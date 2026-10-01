const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../config/database');
const orderModel = require('./order.model');

const withTransactionStub = async (tx, run) => {
  const original = prisma.$transaction;
  prisma.$transaction = async (handler) => {
    if (tx.calls) tx.calls.transactionOpens += 1;
    return handler(tx);
  };
  try {
    return await run();
  } finally {
    prisma.$transaction = original;
  }
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * Tx stub cho checkout: giữ tồn kho thật trong `stock` để chứng minh
 * chuỗi 34 -> 4 (trừ) và 4 -> 34 (hủy đơn) thay vì chỉ ghi lại lời gọi.
 */
const createCheckoutTxStub = ({ cart, stock = {}, stockUpdateCounts = {}, cartDeleteCount } = {}) => {
  const calls = {
    transactionOpens: 0,
    productStockUpdates: [],
    orderCreates: [],
    orderDetailCreates: [],
    paymentCreates: [],
    cartItemDeletes: [],
    profileTouches: 0
  };

  return {
    calls,
    cart: {
      findUnique: async () => cart
    },
    product: {
      updateMany: async (args) => {
        calls.productStockUpdates.push(args);
        const productId = args.where.id;
        const count = hasOwn(stockUpdateCounts, productId) ? stockUpdateCounts[productId] : 1;
        if (count === 1 && typeof stock[productId] === 'number') {
          stock[productId] -= args.data.quantity.decrement;
        }
        return { count };
      }
    },
    order: {
      create: async (args) => {
        calls.orderCreates.push(args);
        return { id: 'order_new', ...args.data };
      },
      findUnique: async () => {
        const created = calls.orderCreates[0];
        if (!created) return null;
        return {
          id: 'order_new',
          ...created.data,
          details: calls.orderDetailCreates.map((call) => call.data),
          payment: calls.paymentCreates[0] ? calls.paymentCreates[0].data : null
        };
      }
    },
    orderDetail: {
      create: async (args) => {
        calls.orderDetailCreates.push(args);
        return { id: `detail_${calls.orderDetailCreates.length}`, ...args.data };
      }
    },
    payment: {
      create: async (args) => {
        calls.paymentCreates.push(args);
        return { id: 'payment_new', ...args.data };
      }
    },
    cartItem: {
      deleteMany: async (args) => {
        calls.cartItemDeletes.push(args);
        const selectedCount = args.where.id.in.length;
        return { count: cartDeleteCount === undefined ? selectedCount : cartDeleteCount };
      }
    },
    user: {
      findUnique: async () => {
        calls.profileTouches += 1;
        return { id: 'user_1', fullName: 'Hồ sơ', phone: '0000000000' };
      },
      update: async () => {
        calls.profileTouches += 1;
        return null;
      }
    }
  };
};

const selectedCart = (overrides = {}) => ({
  id: 'cart_1',
  userId: 'user_1',
  user: { fullName: 'Hồ sơ', phone: '0000000000' },
  items: [
    {
      id: 'item_a',
      productId: 'product_a',
      quantity: 30,
      unitPrice: '100.00',
      product: { id: 'product_a', name: 'Laptop', quantity: 34 }
    },
    {
      id: 'item_b',
      productId: 'product_b',
      quantity: 2,
      unitPrice: '50.00',
      product: { id: 'product_b', name: 'Mouse', quantity: 50 }
    }
  ],
  ...overrides
});

const contact = {
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  note: 'Giao ngoài giờ'
};

test('checkout decrements the selected line 34 -> 4 and deletes only that cart line', async () => {
  const stock = { product_a: 34, product_b: 50 };
  const tx = createCheckoutTxStub({ cart: selectedCart(), stock });

  let order;
  await withTransactionStub(tx, async () => {
    order = await orderModel.checkout('user_1', '123 Đường ABC', contact, ['item_a']);
  });

  // Cập nhật tồn kho có điều kiện: 34 - 30 = 4, dòng không chọn giữ nguyên 50.
  assert.equal(tx.calls.productStockUpdates.length, 1);
  assert.equal(tx.calls.productStockUpdates[0].where.id, 'product_a');
  assert.equal(tx.calls.productStockUpdates[0].where.quantity.gte, 30);
  assert.equal(tx.calls.productStockUpdates[0].data.quantity.decrement, 30);
  assert.equal(stock.product_a, 4);
  assert.equal(stock.product_b, 50);

  // Chỉ mục giỏ hàng được chọn bị xóa.
  assert.equal(tx.calls.cartItemDeletes.length, 1);
  assert.equal(tx.calls.cartItemDeletes[0].where.cartId, 'cart_1');
  assert.deepEqual(tx.calls.cartItemDeletes[0].where.id.in, ['item_a']);

  // Đơn hàng chỉ có dòng được chọn, tổng tiền và thanh toán COD là Prisma Decimal.
  assert.equal(tx.calls.orderCreates.length, 1);
  assert.equal(tx.calls.orderCreates[0].data.status, 'pending');
  assert.equal(Number(tx.calls.orderCreates[0].data.totalAmount), 3000);
  assert.equal(tx.calls.orderDetailCreates.length, 1);
  assert.equal(tx.calls.orderDetailCreates[0].data.productId, 'product_a');
  assert.equal(tx.calls.orderDetailCreates[0].data.quantity, 30);
  assert.equal(tx.calls.paymentCreates.length, 1);
  assert.equal(tx.calls.paymentCreates[0].data.paymentMethod, 'COD');
  assert.equal(tx.calls.paymentCreates[0].data.paymentStatus, 'unpaid');
  assert.equal(tx.calls.paymentCreates[0].data.paymentDate, null);
  assert.equal(Number(tx.calls.paymentCreates[0].data.amount), 3000);

  assert.equal(order.id, 'order_new');
  assert.equal(order.shippingAddress, '123 Đường ABC');
});

test('checkout then cancel restores the stock it took (34 -> 4 -> 34)', async () => {
  const stock = { product_a: 34 };
  const checkoutTx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }), stock });

  let placed;
  await withTransactionStub(checkoutTx, async () => {
    placed = await orderModel.checkout('user_1', '123 Đường ABC', contact, ['item_a']);
  });
  assert.equal(stock.product_a, 4);

  const cancelTx = {
    order: {
      findUnique: async () => ({
        id: placed.id,
        userId: 'user_1',
        status: 'pending',
        details: [{ productId: 'product_a', quantity: 30 }]
      }),
      updateMany: async (args) => {
        assert.equal(args.data.status, 'cancelled');
        return { count: 1 };
      }
    },
    product: {
      update: async (args) => {
        stock[args.where.id] += args.data.quantity.increment;
        return args;
      }
    }
  };

  await withTransactionStub(cancelTx, async () => {
    await orderModel.cancelOwnOrder(placed.id, 'user_1');
  });

  assert.equal(stock.product_a, 34);
});

test('checkout rejects a quantity above stock (5 from 4) without writing anything', async () => {
  const stock = { product_a: 4 };
  const tx = createCheckoutTxStub({
    cart: selectedCart({
      items: [
        {
          id: 'item_a',
          productId: 'product_a',
          quantity: 5,
          unitPrice: '100.00',
          product: { id: 'product_a', name: 'Laptop', quantity: 4 }
        }
      ]
    }),
    stock
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.checkout('user_1', '123 Đường ABC', contact, ['item_a']),
      (error) => error.status === 400 && /vượt quá tồn kho/.test(error.message)
    );
  });

  assert.equal(stock.product_a, 4);
  assert.equal(tx.calls.productStockUpdates.length, 0);
  assert.equal(tx.calls.orderCreates.length, 0);
  assert.equal(tx.calls.cartItemDeletes.length, 0);
});

test('checkout rejects cart quantities that are not positive integers', async () => {
  for (const quantity of [0, -3, 1.5, '1.5', 'abc', null]) {
    const tx = createCheckoutTxStub({
      cart: selectedCart({
        items: [
          {
            id: 'item_a',
            productId: 'product_a',
            quantity,
            unitPrice: '100.00',
            product: { id: 'product_a', name: 'Laptop', quantity: 10 }
          }
        ]
      })
    });

    await withTransactionStub(tx, async () => {
      await assert.rejects(
        () => orderModel.checkout('user_1', '123 Đường ABC', contact, ['item_a']),
        /Số lượng không hợp lệ/
      );
    });

    assert.equal(tx.calls.productStockUpdates.length, 0, String(quantity));
    assert.equal(tx.calls.orderCreates.length, 0, String(quantity));
  }
});

test('checkout rolls back when a conditional stock write loses the race', async () => {
  const stock = { product_a: 34, product_b: 50 };
  const tx = createCheckoutTxStub({
    cart: selectedCart(),
    stock,
    stockUpdateCounts: { product_b: 0 }
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.checkout('user_1', '123 Đường ABC', contact, ['item_a', 'item_b']),
      (error) => error.status === 409 && /Mouse/.test(error.message)
    );
  });

  // Cả hai dòng đều được kiểm tra bằng điều kiện gte trước khi dòng thứ hai thất bại.
  assert.equal(tx.calls.productStockUpdates.length, 2);
  assert.equal(tx.calls.productStockUpdates[1].where.quantity.gte, 2);
  assert.equal(tx.calls.productStockUpdates[1].data.quantity.decrement, 2);

  // Không có đơn hàng/chi tiết/thanh toán nào được ghi khi tồn kho đổi đồng thời.
  assert.equal(tx.calls.orderCreates.length, 0);
  assert.equal(tx.calls.orderDetailCreates.length, 0);
  assert.equal(tx.calls.paymentCreates.length, 0);
  assert.equal(tx.calls.cartItemDeletes.length, 0);
});

test('checkout rejects when the cart changed concurrently before the cart line could be removed', async () => {
  const tx = createCheckoutTxStub({
    cart: selectedCart({ items: [selectedCart().items[0]] }),
    stock: { product_a: 34 },
    cartDeleteCount: 0
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.checkout('user_1', '123 Đường ABC', contact, ['item_a']),
      (error) => error.status === 409 && /Giỏ hàng đã thay đổi/.test(error.message)
    );
  });

  assert.equal(tx.calls.cartItemDeletes.length, 1);
  assert.deepEqual(tx.calls.cartItemDeletes[0].where.id.in, ['item_a']);
});

test('checkout snapshots the requested recipient instead of the user profile', async () => {
  const tx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }), stock: { product_a: 34 } });

  let order;
  await withTransactionStub(tx, async () => {
    order = await orderModel.checkout(
      'user_1',
      '  123 Đường ABC  ',
      { fullName: '  Nguyễn Văn A  ', phone: '0987654321', note: 'Giao ngoài giờ' },
      ['item_a']
    );
  });

  const data = tx.calls.orderCreates[0].data;
  assert.equal(data.shippingAddress, '123 Đường ABC');
  assert.equal(data.recipientName, 'Nguyễn Văn A');
  assert.equal(data.recipientPhone, '0987654321');
  assert.equal(typeof data.recipientPhone, 'string');
  assert.equal(data.note, 'Giao ngoài giờ');

  // Số điện thoại giữ nguyên số 0 đầu và hồ sơ người dùng không bị đọc/ghi đè.
  assert.equal(tx.calls.profileTouches, 0);
  assert.equal(order.recipientPhone, '0987654321');
  assert.equal(order.note, 'Giao ngoài giờ');
});

test('checkout requires a valid recipient contact before opening the transaction', async () => {
  const tx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }), stock: { product_a: 34 } });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.checkout('user_1', '123 Đường ABC', undefined, ['item_a']),
      /Thông tin người nhận/
    );
    await assert.rejects(
      () => orderModel.checkout('user_1', '123 Đường ABC', { fullName: 'Nguyễn Văn A', phone: '09 8765 4321' }, ['item_a']),
      /chữ số/
    );
    await assert.rejects(
      () => orderModel.checkout('user_1', '123 Đường ABC', { fullName: '   ', phone: '0987654321' }, ['item_a']),
      /Họ và tên/
    );
    await assert.rejects(
      () => orderModel.checkout('user_1', '123 Đường ABC', { fullName: 'Nguyễn Văn A', phone: '0987654321', note: 42 }, ['item_a']),
      /Ghi chú/
    );
  });

  assert.equal(tx.calls.transactionOpens, 0);
  assert.equal(tx.calls.orderCreates.length, 0);
  assert.equal(tx.calls.productStockUpdates.length, 0);
});
