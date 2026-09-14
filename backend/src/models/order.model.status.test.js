const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../config/database');
const orderModel = require('./order.model');

const withTransactionStub = async (tx, run) => {
  const original = prisma.$transaction;
  prisma.$transaction = async (handler) => handler(tx);
  try {
    return await run();
  } finally {
    prisma.$transaction = original;
  }
};

const createTxStub = ({ order, updateCount = 1 } = {}) => {
  const calls = {
    productUpdates: [],
    orderStatusUpdates: [],
    paymentUpdates: []
  };

  const currentOrder = order || {
    id: 'order_1',
    status: 'pending',
    payment: null,
    details: []
  };

  return {
    calls,
    order: {
      findUnique: async () => (currentOrder === null ? null : currentOrder),
      updateMany: async (args) => {
        calls.orderStatusUpdates.push(args);
        return { count: updateCount };
      },
      update: async () => currentOrder
    },
    product: {
      update: async (args) => {
        calls.productUpdates.push(args);
        return args;
      }
    },
    payment: {
      update: async (args) => {
        calls.paymentUpdates.push(args);
        return args;
      }
    }
  };
};

test('updateStatus rejects transitions outside the lifecycle map', async () => {
  const tx = createTxStub({ order: { id: 'order_1', status: 'pending', payment: null, details: [] } });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.updateStatus('order_1', 'shipping'),
      /Không thể chuyển trạng thái/
    );
    await assert.rejects(
      () => orderModel.updateStatus('order_1', 'completed'),
      /Không thể chuyển trạng thái/
    );
  });

  assert.equal(tx.calls.orderStatusUpdates.length, 0);
});

test('updateStatus keeps terminal statuses terminal', async () => {
  const tx = createTxStub({ order: { id: 'order_1', status: 'completed', payment: null, details: [] } });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.updateStatus('order_1', 'pending'),
      /Không thể chuyển trạng thái/
    );
    await assert.rejects(
      () => orderModel.updateStatus('order_1', 'cancelled'),
      /Không thể chuyển trạng thái/
    );
  });
});

test('updateStatus restocks every product line when an order is cancelled', async () => {
  const tx = createTxStub({
    order: {
      id: 'order_1',
      status: 'confirmed',
      payment: null,
      details: [
        { productId: 'product_a', quantity: 2 },
        { productId: 'product_b', quantity: 3 }
      ]
    }
  });

  await withTransactionStub(tx, async () => {
    await orderModel.updateStatus('order_1', 'cancelled');
  });

  assert.deepEqual(
    tx.calls.productUpdates.map((call) => call.where.id),
    ['product_a', 'product_b']
  );
  assert.deepEqual(
    tx.calls.productUpdates.map((call) => call.data.quantity.increment),
    [2, 3]
  );
});

test('updateStatus marks the payment as paid when an order completes', async () => {
  const tx = createTxStub({
    order: { id: 'order_1', status: 'shipping', payment: { id: 'payment_1' }, details: [] }
  });

  await withTransactionStub(tx, async () => {
    await orderModel.updateStatus('order_1', 'completed');
  });

  assert.equal(tx.calls.paymentUpdates.length, 1);
  assert.equal(tx.calls.paymentUpdates[0].data.paymentStatus, 'paid');
  assert.equal(tx.calls.productUpdates.length, 0);
});

test('updateStatus refuses to write when the order changed concurrently', async () => {
  const tx = createTxStub({
    order: { id: 'order_1', status: 'pending', payment: null, details: [] },
    updateCount: 0
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.updateStatus('order_1', 'confirmed'),
      /đã thay đổi/
    );
  });

  assert.equal(tx.calls.productUpdates.length, 0);
});

test('cancelOwnOrder refuses orders owned by another customer', async () => {
  const tx = createTxStub({
    order: { id: 'order_1', userId: 'customer_2', status: 'pending', details: [] }
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.cancelOwnOrder('order_1', 'customer_1'),
      /Không được phép/
    );
  });

  assert.equal(tx.calls.orderStatusUpdates.length, 0);
});

test('cancelOwnOrder refuses orders that already left the store', async () => {
  const tx = createTxStub({
    order: { id: 'order_1', userId: 'customer_1', status: 'shipping', details: [] }
  });

  await withTransactionStub(tx, async () => {
    await assert.rejects(
      () => orderModel.cancelOwnOrder('order_1', 'customer_1'),
      /Chỉ có thể hủy/
    );
  });

  assert.equal(tx.calls.productUpdates.length, 0);
});

test('cancelOwnOrder cancels a pending order and restocks its products', async () => {
  const tx = createTxStub({
    order: {
      id: 'order_1',
      userId: 'customer_1',
      status: 'pending',
      details: [{ productId: 'product_a', quantity: 4 }]
    }
  });

  await withTransactionStub(tx, async () => {
    await orderModel.cancelOwnOrder('order_1', 'customer_1');
  });

  assert.equal(tx.calls.orderStatusUpdates.length, 1);
  assert.equal(tx.calls.orderStatusUpdates[0].data.status, 'cancelled');
  assert.deepEqual(tx.calls.orderStatusUpdates[0].where.status.in, ['pending', 'confirmed']);
  assert.equal(tx.calls.productUpdates.length, 1);
  assert.equal(tx.calls.productUpdates[0].data.quantity.increment, 4);
});

test('order status constants stay aligned with the Prisma enum order', () => {
  assert.deepEqual(Object.keys(orderModel.ORDER_STATUS_TRANSITIONS), [
    'pending',
    'confirmed',
    'shipping',
    'completed',
    'cancelled'
  ]);
  assert.deepEqual(orderModel.CUSTOMER_CANCELLABLE_STATUSES, ['pending', 'confirmed']);
});
