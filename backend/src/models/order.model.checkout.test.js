const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../config/database');
const addressService = require('../services/address.service');
const orderModel = require('./order.model');

const structuredAddress = {
  provinceCode: '01',
  wardCode: '00001',
  detail: 'Số nhà 123, Đường ABC'
};
const resolvedAddress = {
  provinceCode: '01',
  provinceName: 'Hà Nội',
  wardCode: '00001',
  wardName: 'Phường Phúc Xá',
  detail: 'Số nhà 123, Đường ABC'
};
const withTransactionStub = async (tx, run, { resolveAddress = async () => resolvedAddress } = {}) => {
  const originalTransaction = prisma.$transaction;
  const originalResolveAddress = addressService.resolveAddress;
  const originalToOrderAddressFields = addressService.toOrderAddressFields;
  prisma.$transaction = async (handler) => {
    if (tx.calls) tx.calls.transactionOpens += 1;
    return handler(tx);
  };
  addressService.resolveAddress = async (input, options) => {
    if (tx.calls) {
      tx.calls.addressResolutions.push({ input, options, transactionOpens: tx.calls.transactionOpens });
    }
    return resolveAddress(input, options);
  };
  addressService.toOrderAddressFields = (address) => {
    if (tx.calls) tx.calls.addressMappings.push(address);
    return {
      shippingAddress: `${address.detail}, ${address.wardName}, ${address.provinceName}`,
      shippingProvinceCode: address.provinceCode,
      shippingProvinceName: address.provinceName,
      shippingWardCode: address.wardCode,
      shippingWardName: address.wardName,
      shippingAddressDetail: address.detail
    };
  };
  try {
    return await run();
  } finally {
    prisma.$transaction = originalTransaction;
    addressService.resolveAddress = originalResolveAddress;
    addressService.toOrderAddressFields = originalToOrderAddressFields;
  }
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * Tx stub cho checkout: giữ tồn kho thật trong `stock` để chứng minh
 * chuỗi 34 -> 4 (trừ) và 4 -> 34 (hủy đơn) thay vì chỉ ghi lại lời gọi.
 */
const createCheckoutTxStub = ({ cart, stock = {}, stockUpdateCounts = {}, cartDeleteCount, cartLineQuantities = {} } = {}) => {
  const calls = {
    transactionOpens: 0,
    productStockUpdates: [],
    orderCreates: [],
    orderDetailCreates: [],
    paymentCreates: [],
    cartItemDeletes: [],
    addressResolutions: [],
    addressMappings: [],
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
      },
      findUnique: async (args) => (
        typeof stock[args.where.id] === 'number' ? { quantity: stock[args.where.id] } : null
      )
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
        if (cartDeleteCount !== undefined) return { count: cartDeleteCount };
        // Mô phỏng xóa có điều kiện: chỉ xóa dòng có số lượng hiện tại khớp số lượng đã đọc.
        const currentQuantity = (id) => (
          hasOwn(cartLineQuantities, id) ? cartLineQuantities[id] : cart?.items?.find((item) => item.id === id)?.quantity
        );
        const count = args.where.OR.filter((line) => currentQuantity(line.id) === line.quantity).length;
        return { count };
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
    order = await orderModel.checkout('user_1', structuredAddress, contact, ['item_a']);
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
  assert.deepEqual(tx.calls.cartItemDeletes[0].where.OR, [{ id: 'item_a', quantity: 30 }]);

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
  assert.equal(order.shippingAddress, `${resolvedAddress.detail}, ${resolvedAddress.wardName}, ${resolvedAddress.provinceName}`);
});

test('checkout then cancel restores the stock it took (34 -> 4 -> 34)', async () => {
  const stock = { product_a: 34 };
  const checkoutTx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }), stock });

  let placed;
  await withTransactionStub(checkoutTx, async () => {
    placed = await orderModel.checkout('user_1', structuredAddress, contact, ['item_a']);
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

test('checkout rejects a quantity above stock (5 from 4) with the remaining stock, without writing anything', async () => {
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
      () => orderModel.checkout('user_1', structuredAddress, contact, ['item_a']),
      (error) => error.status === 409 && error.message === 'Sản phẩm "Laptop" chỉ còn 4 sản phẩm trong kho.'
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
        () => orderModel.checkout('user_1', structuredAddress, contact, ['item_a']),
        /Số lượng không hợp lệ/
      );
    });

    assert.equal(tx.calls.productStockUpdates.length, 0, String(quantity));
    assert.equal(tx.calls.orderCreates.length, 0, String(quantity));
  }
});

test('checkout rolls back and reports the stock that is actually left when another order wins the race', async () => {
  // Another customer bought Mouse between loading the cart and the conditional write: only 1 left.
  const stock = { product_a: 34, product_b: 1 };
  const tx = createCheckoutTxStub({
    cart: selectedCart(),
    stock,
    stockUpdateCounts: { product_b: 0 }
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.checkout('user_1', structuredAddress, contact, ['item_a', 'item_b']),
      (error) => error.status === 409 && error.message === 'Sản phẩm "Mouse" chỉ còn 1 sản phẩm trong kho.'
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

test('checkout rolls back when another tab changed the cart line quantity before it could be removed', async () => {
  // Checkout read item_a at 30, then another tab saved 31: ordering 30 and deleting the line would lose that edit.
  const tx = createCheckoutTxStub({
    cart: selectedCart({ items: [selectedCart().items[0]] }),
    stock: { product_a: 34 },
    cartLineQuantities: { item_a: 31 }
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.checkout('user_1', structuredAddress, contact, ['item_a']),
      (error) => error.status === 409 && /Giỏ hàng đã thay đổi/.test(error.message)
    );
  });

  assert.equal(tx.calls.cartItemDeletes.length, 1);
  assert.deepEqual(tx.calls.cartItemDeletes[0].where.OR, [{ id: 'item_a', quantity: 30 }]);
});

test('checkout snapshots the requested recipient instead of the user profile', async () => {
  const tx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }), stock: { product_a: 34 } });

  let order;
  await withTransactionStub(tx, async () => {
    const untrustedAddress = {
      ...structuredAddress,
      provinceName: 'Client Province',
      wardName: 'Client Ward',
      shippingProvinceCode: 'forged'
    };
    order = await orderModel.checkout(
      'user_1',
      untrustedAddress,
      { fullName: '  Nguyễn Văn A  ', phone: '0987654321', note: 'Giao ngoài giờ' },
      ['item_a']
    );
  });

  const data = tx.calls.orderCreates[0].data;
  assert.deepEqual(tx.calls.addressResolutions, [{
    input: {
      ...structuredAddress,
      provinceName: 'Client Province',
      wardName: 'Client Ward',
      shippingProvinceCode: 'forged'
    },
    options: { required: true },
    transactionOpens: 0
  }]);
  assert.deepEqual(tx.calls.addressMappings, [resolvedAddress]);
  assert.deepEqual(
    {
      shippingAddress: data.shippingAddress,
      shippingProvinceCode: data.shippingProvinceCode,
      shippingProvinceName: data.shippingProvinceName,
      shippingWardCode: data.shippingWardCode,
      shippingWardName: data.shippingWardName,
      shippingAddressDetail: data.shippingAddressDetail
    },
    {
      shippingAddress: 'Số nhà 123, Đường ABC, Phường Phúc Xá, Hà Nội',
      shippingProvinceCode: '01',
      shippingProvinceName: 'Hà Nội',
      shippingWardCode: '00001',
      shippingWardName: 'Phường Phúc Xá',
      shippingAddressDetail: 'Số nhà 123, Đường ABC'
    }
  );

  // Số điện thoại giữ nguyên số 0 đầu và hồ sơ người dùng không bị đọc/ghi đè.
  assert.equal(tx.calls.profileTouches, 0);
  assert.equal(order.recipientPhone, '0987654321');
  assert.equal(order.note, 'Giao ngoài giờ');
});

test('checkout requires a valid recipient contact before opening the transaction', async () => {
  const tx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }), stock: { product_a: 34 } });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.checkout('user_1', structuredAddress, undefined, ['item_a']),
      /Thông tin người nhận/
    );
    await assert.rejects(
      () => orderModel.checkout('user_1', structuredAddress, { fullName: 'Nguyễn Văn A', phone: '09 8765 4321' }, ['item_a']),
      /chữ số/
    );
    await assert.rejects(
      () => orderModel.checkout('user_1', structuredAddress, { fullName: '123456789', phone: '0987654321' }, ['item_a']),
      /Họ và tên/
    );
    await assert.rejects(
      () => orderModel.checkout('user_1', structuredAddress, { fullName: 'A'.repeat(51), phone: '0987654321' }, ['item_a']),
      /Họ và tên/
    );
    await assert.rejects(
      () => orderModel.checkout('user_1', structuredAddress, { fullName: 'Nguyễn Văn A', phone: '0987654321', note: 42 }, ['item_a']),
      /Ghi chú/
    );
    for (const phone of ['12345678', '123456789012']) {
      await assert.rejects(
        () => orderModel.checkout('user_1', structuredAddress, { fullName: 'Nguyễn Văn A', phone }, ['item_a']),
        /Số điện thoại/
      );
    }
  });

  assert.equal(tx.calls.transactionOpens, 0);
  assert.equal(tx.calls.orderCreates.length, 0);
  assert.equal(tx.calls.productStockUpdates.length, 0);
  assert.equal(tx.calls.addressResolutions.length, 0);
});

test('checkout resolves the address before the transaction and propagates provider errors', async () => {
  const tx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }) });
  const providerError = Object.assign(new Error('Address provider unavailable'), {
    status: 503,
    statusCode: 503
  });

  await assert.rejects(
    () => withTransactionStub(
      tx,
      () => orderModel.checkout('user_1', structuredAddress, contact, ['item_a']),
      {
        resolveAddress: async (input, options) => {
          assert.deepEqual(input, structuredAddress);
          assert.deepEqual(options, { required: true });
          assert.equal(tx.calls.transactionOpens, 0);
          throw providerError;
        }
      }
    ),
    (error) => error === providerError
  );

  assert.equal(tx.calls.transactionOpens, 0);
  assert.equal(tx.calls.orderCreates.length, 0);
  assert.equal(tx.calls.productStockUpdates.length, 0);
  assert.equal(tx.calls.addressResolutions.length, 1);
  assert.equal(tx.calls.addressMappings.length, 0);
});

test('checkout accepts trimmed ten-to-fifty-character names and nine-to-eleven-digit phone boundaries', async () => {
  const validContacts = [
    { fullName: 'A'.repeat(10), phone: '123456789' },
    { fullName: 'B'.repeat(50), phone: '12345678901' }
  ];

  for (const validContact of validContacts) {
    const tx = createCheckoutTxStub({ cart: selectedCart({ items: [selectedCart().items[0]] }) });
    let order;
    await withTransactionStub(tx, async () => {
      order = await orderModel.checkout(
        'user_1',
        structuredAddress,
        { ...validContact, fullName: `  ${validContact.fullName}  ` },
        ['item_a']
      );
    });

    assert.equal(order.recipientName, validContact.fullName);
    assert.equal(order.recipientPhone, validContact.phone);
    assert.equal(tx.calls.transactionOpens, 1);
  }
});
