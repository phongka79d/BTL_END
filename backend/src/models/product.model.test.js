const assert = require('node:assert/strict');
const { after, beforeEach, test } = require('node:test');

const databasePath = require.resolve('../config/database');
const originalDatabaseModule = require.cache[databasePath];
const prisma = {
  product: {
    count: async () => {
      throw new Error('Unexpected product.count call');
    },
    findMany: async () => {
      throw new Error('Unexpected product.findMany call');
    },
  },
  review: {
    groupBy: async () => {
      throw new Error('Unexpected review.groupBy call');
    },
  },
  orderDetail: {
    groupBy: async () => {
      throw new Error('Unexpected orderDetail.groupBy call');
    },
  },
};

require.cache[databasePath] = {
  id: databasePath,
  filename: databasePath,
  loaded: true,
  exports: prisma,
};

const productModel = require('./product.model');

beforeEach(() => {
  prisma.product.count = async () => {
    throw new Error('Unexpected product.count call');
  };
  prisma.product.findMany = async () => {
    throw new Error('Unexpected product.findMany call');
  };
  prisma.review.groupBy = async () => {
    throw new Error('Unexpected review.groupBy call');
  };
  prisma.orderDetail.groupBy = async () => {
    throw new Error('Unexpected orderDetail.groupBy call');
  };
});

after(() => {
  delete require.cache[require.resolve('./product.model')];
  if (originalDatabaseModule) {
    require.cache[databasePath] = originalDatabaseModule;
  } else {
    delete require.cache[databasePath];
  }
});

test('findAll attaches visible review summaries to listed products', async () => {
  prisma.product.count = async (query) => {
    assert.deepEqual(query, { where: {} });
    return 2;
  };

  prisma.product.findMany = async () => [
    { id: 'p1', name: 'Reviewed product' },
    { id: 'p2', name: 'No reviews product' },
  ];

  prisma.review.groupBy = async (query) => {
    assert.deepEqual(query, {
      by: ['productId'],
      where: {
        productId: { in: ['p1', 'p2'] },
        status: 'visible',
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    return [
      {
        productId: 'p1',
        _avg: { rating: 4.5 },
        _count: { _all: 2 },
      },
    ];
  };

  const result = await productModel.findAll({ page: 1, limit: 2 });

  assert.deepEqual(result.items, [
    {
      id: 'p1',
      name: 'Reviewed product',
      reviewSummary: {
        averageRating: 4.5,
        reviewCount: 2,
      },
    },
    {
      id: 'p2',
      name: 'No reviews product',
      reviewSummary: {
        averageRating: null,
        reviewCount: 0,
      },
    },
  ]);
});

test('findAll sorts products by price when requested', async () => {
  prisma.product.count = async (query) => {
    assert.deepEqual(query, { where: {} });
    return 1;
  };

  prisma.product.findMany = async (query) => {
    assert.deepEqual(query.orderBy, { price: 'asc' });
    return [{ id: 'p1', name: 'Budget product' }];
  };

  prisma.review.groupBy = async () => [];

  const result = await productModel.findAll({ page: 1, limit: 12, sort: 'price' });

  assert.deepEqual(result.items, [
    {
      id: 'p1',
      name: 'Budget product',
      reviewSummary: {
        averageRating: null,
        reviewCount: 0,
      },
    },
  ]);
});

test('findAll sorts products by visible review quality when requested', async () => {
  prisma.product.count = async () => 3;
  prisma.product.findMany = async () => [
    { id: 'p1', name: 'Good but fewer reviews', createdAt: new Date('2026-01-01') },
    { id: 'p2', name: 'Best reviewed', createdAt: new Date('2026-01-02') },
    { id: 'p3', name: 'No reviews', createdAt: new Date('2026-01-03') },
  ];
  prisma.review.groupBy = async () => [
    { productId: 'p1', _avg: { rating: 4.8 }, _count: { _all: 2 } },
    { productId: 'p2', _avg: { rating: 4.8 }, _count: { _all: 6 } },
  ];

  const result = await productModel.findAll({ page: 1, limit: 3, sort: 'review' });

  assert.deepEqual(result.items.map((product) => product.id), ['p2', 'p1', 'p3']);
});

test('findAll sorts products by ordered quantity when requested', async () => {
  prisma.product.count = async () => 3;
  prisma.product.findMany = async () => [
    { id: 'p1', name: 'Second ordered', createdAt: new Date('2026-01-01') },
    { id: 'p2', name: 'Never ordered', createdAt: new Date('2026-01-03') },
    { id: 'p3', name: 'Most ordered', createdAt: new Date('2026-01-02') },
  ];
  prisma.review.groupBy = async () => [];
  prisma.orderDetail.groupBy = async (query) => {
    assert.deepEqual(query, {
      by: ['productId'],
      where: {
        productId: { in: ['p1', 'p2', 'p3'] },
      },
      _sum: { quantity: true },
    });

    return [
      { productId: 'p1', _sum: { quantity: 3 } },
      { productId: 'p3', _sum: { quantity: 8 } },
    ];
  };

  const result = await productModel.findAll({ page: 1, limit: 3, sort: 'orders' });

  assert.deepEqual(result.items.map((product) => product.id), ['p3', 'p1', 'p2']);
});
