const assert = require('node:assert/strict');
const { after, beforeEach, test } = require('node:test');
const { Prisma } = require('@prisma/client');

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

const completedPaidCodFilter = {
  order: {
    status: 'completed',
    payment: {
      is: {
        paymentMethod: 'COD',
        paymentStatus: 'paid',
      },
    },
  },
};

beforeEach(() => {
  prisma.order.aggregate = async () => {
    throw new Error('Unexpected order.aggregate call');
  };
  prisma.order.groupBy = async () => {
    throw new Error('Unexpected order.groupBy call');
  };
  prisma.orderDetail.groupBy = async () => {
    throw new Error('Unexpected orderDetail.groupBy call');
  };
  prisma.product.findMany = async () => {
    throw new Error('Unexpected product.findMany call');
  };
});

after(() => {
  delete require.cache[require.resolve('./report.model')];
  if (originalDatabaseModule) {
    require.cache[databasePath] = originalDatabaseModule;
  } else {
    delete require.cache[databasePath];
  }
});

test('getRevenue aggregates completed orders with paid COD payment', async () => {
  prisma.order.aggregate = async (query) => {
    assert.deepEqual(query, {
      where: completedPaidCodFilter.order,
      _sum: { totalAmount: true },
      _count: { _all: true },
    });
    return {
      _sum: { totalAmount: new Prisma.Decimal('1200.50') },
      _count: { _all: 12 },
    };
  };

  assert.deepEqual(await reportModel.getRevenue(), {
    totalRevenue: '1200.50',
    completedOrderCount: 12,
  });
});

test('getRevenue returns an API-safe zero total for an empty data set', async () => {
  prisma.order.aggregate = async () => ({
    _sum: { totalAmount: null },
    _count: { _all: 0 },
  });

  assert.deepEqual(await reportModel.getRevenue(), {
    totalRevenue: '0.00',
    completedOrderCount: 0,
  });
});

test('getBestSellingProducts combines captured-price groups and returns the top five', async () => {
  prisma.orderDetail.groupBy = async (query) => {
    assert.deepEqual(query, {
      by: ['productId', 'price'],
      where: completedPaidCodFilter,
      _sum: { quantity: true },
    });
    return [
      { productId: 'p1', price: new Prisma.Decimal('10.00'), _sum: { quantity: 2 } },
      { productId: 'p1', price: new Prisma.Decimal('12.00'), _sum: { quantity: 1 } },
      { productId: 'p2', price: new Prisma.Decimal('20.00'), _sum: { quantity: 4 } },
      { productId: 'p3', price: new Prisma.Decimal('5.00'), _sum: { quantity: 3 } },
      { productId: 'p4', price: new Prisma.Decimal('7.00'), _sum: { quantity: 2 } },
      { productId: 'p5', price: new Prisma.Decimal('9.00'), _sum: { quantity: 1 } },
      { productId: 'p6', price: new Prisma.Decimal('1.00'), _sum: { quantity: 1 } },
    ];
  };
  prisma.product.findMany = async (query) => {
    assert.deepEqual(query, {
      where: { id: { in: ['p2', 'p1', 'p3', 'p4', 'p5'] } },
      select: { id: true, name: true, brand: true },
    });
    return [
      { id: 'p1', name: 'Keyboard', brand: 'DemoBrand' },
      { id: 'p2', name: 'Mouse', brand: 'DemoBrand' },
      { id: 'p3', name: 'Cable', brand: 'WireCo' },
      { id: 'p4', name: 'Stand', brand: 'DeskCo' },
      { id: 'p5', name: 'Pad', brand: 'DeskCo' },
    ];
  };

  assert.deepEqual(await reportModel.getBestSellingProducts(), [
    {
      productId: 'p2',
      name: 'Mouse',
      brand: 'DemoBrand',
      soldQuantity: 4,
      revenue: '80.00',
    },
    {
      productId: 'p1',
      name: 'Keyboard',
      brand: 'DemoBrand',
      soldQuantity: 3,
      revenue: '32.00',
    },
    {
      productId: 'p3',
      name: 'Cable',
      brand: 'WireCo',
      soldQuantity: 3,
      revenue: '15.00',
    },
    {
      productId: 'p4',
      name: 'Stand',
      brand: 'DeskCo',
      soldQuantity: 2,
      revenue: '14.00',
    },
    {
      productId: 'p5',
      name: 'Pad',
      brand: 'DeskCo',
      soldQuantity: 1,
      revenue: '9.00',
    },
  ]);
});

test('getOrderSummary fills missing statuses with zero', async () => {
  prisma.order.groupBy = async (query) => {
    assert.deepEqual(query, {
      by: ['status'],
      _count: { _all: true },
    });
    return [
      { status: 'pending', _count: { _all: 3 } },
      { status: 'completed', _count: { _all: 12 } },
      { status: 'cancelled', _count: { _all: 1 } },
    ];
  };

  assert.deepEqual(await reportModel.getOrderSummary(), {
    pending: 3,
    confirmed: 0,
    shipping: 0,
    completed: 12,
    cancelled: 1,
  });
});
