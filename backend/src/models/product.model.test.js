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
