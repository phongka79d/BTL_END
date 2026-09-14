const assert = require('node:assert/strict');
const { after, test } = require('node:test');

const databasePath = require.resolve('../config/database');
const originalDatabaseModule = require.cache[databasePath];
const prisma = {
  order: {
    aggregate: async () => {
      throw new Error('Unexpected order.aggregate call');
    },
    groupBy: async () => {
      throw new Error('Unexpected order.groupBy call');
    },
  },
  orderDetail: {
    groupBy: async () => {
      throw new Error('Unexpected orderDetail.groupBy call');
    },
  },
  product: {
    findMany: async () => {
      throw new Error('Unexpected product.findMany call');
    },
  },
};

require.cache[databasePath] = {
  id: databasePath,
  filename: databasePath,
  loaded: true,
  exports: prisma,
};

const reportModel = require('./report.model');

const range = {
  startDate: new Date('2026-09-01T00:00:00.000Z'),
  endDate: new Date('2026-09-14T23:59:59.999Z'),
};

after(() => {
  delete require.cache[require.resolve('./report.model')];
  if (originalDatabaseModule) {
    require.cache[databasePath] = originalDatabaseModule;
  } else {
    delete require.cache[databasePath];
  }
});

test('getRevenue applies the reporting range on top of the completed-paid filter', async () => {
  prisma.order.aggregate = async (query) => {
    assert.equal(query.where.createdAt.gte.getTime(), range.startDate.getTime());
    assert.equal(query.where.createdAt.lte.getTime(), range.endDate.getTime());
    assert.equal(query.where.status, 'completed');
    assert.equal(query.where.payment.is.paymentStatus, 'paid');

    return {
      _sum: { totalAmount: null },
      _count: { _all: 0 },
    };
  };

  assert.deepEqual(await reportModel.getRevenue(range), {
    totalRevenue: '0.00',
    completedOrderCount: 0,
  });
});

test('getRevenue omits any createdAt filter when no range is requested', async () => {
  prisma.order.aggregate = async (query) => {
    assert.equal(Object.prototype.hasOwnProperty.call(query.where, 'createdAt'), false);
    return {
      _sum: { totalAmount: null },
      _count: { _all: 0 },
    };
  };

  await reportModel.getRevenue(undefined);
});

test('getOrderSummary filters status counts by the requested range', async () => {
  prisma.order.groupBy = async (query) => {
    assert.equal(query.where.createdAt.gte.getTime(), range.startDate.getTime());
    assert.equal(query.where.createdAt.lte.getTime(), range.endDate.getTime());
    return [{ status: 'completed', _count: { _all: 2 } }];
  };

  assert.deepEqual(await reportModel.getOrderSummary(range), {
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 2,
    cancelled: 0,
  });
});

test('getBestSellingProducts pushes the range into the nested order filter', async () => {
  prisma.orderDetail.groupBy = async (query) => {
    assert.equal(query.where.order.createdAt.gte.getTime(), range.startDate.getTime());
    assert.equal(query.where.order.createdAt.lte.getTime(), range.endDate.getTime());
    assert.equal(query.where.order.status, 'completed');
    return [];
  };

  assert.deepEqual(await reportModel.getBestSellingProducts(range), []);
});
