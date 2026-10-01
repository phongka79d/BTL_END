const assert = require('node:assert/strict');
const test = require('node:test');

const prisma = require('../config/database');
const productController = require('./product.controller');

const createMockResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const baseProduct = {
  name: 'Mouse',
  brand: 'Logi',
  price: 10,
  categoryId: 'category-1'
};

const invalidInventoryValues = [-1, -999, 1.5, '1.5', '', ' ', NaN, true, null, undefined, {}, []];
const invalidEditInventoryValues = invalidInventoryValues.filter((value) => value !== undefined);

test('product create accepts zero and one but rejects invalid inventory quantities with 400', async () => {
  const originalCreate = prisma.product.create;

  try {
    prisma.product.create = async ({ data }) => data;

    for (const quantity of [0, 1]) {
      const res = createMockResponse();
      await productController.createProduct(
        { body: { ...baseProduct, quantity } },
        res,
        () => {}
      );
      assert.equal(res.statusCode, 201, String(quantity));
    }

    for (const quantity of invalidInventoryValues) {
      const res = createMockResponse();
      await productController.createProduct(
        { body: { ...baseProduct, quantity } },
        res,
        () => {}
      );
      assert.equal(res.statusCode, 400, String(quantity));
    }
  } finally {
    prisma.product.create = originalCreate;
  }
});

test('product edit accepts zero and one but rejects invalid inventory quantities with 400', async () => {
  const originalFindUnique = prisma.product.findUnique;
  const originalUpdate = prisma.product.update;

  try {
    prisma.product.findUnique = async () => ({ id: 'product-1' });
    prisma.product.update = async ({ data }) => data;

    for (const quantity of [0, 1]) {
      const res = createMockResponse();
      await productController.updateProduct(
        { params: { id: 'product-1' }, body: { quantity } },
        res,
        () => {}
      );
      assert.equal(res.statusCode, 200, String(quantity));
    }

    for (const quantity of invalidEditInventoryValues) {
      const res = createMockResponse();
      await productController.updateProduct(
        { params: { id: 'product-1' }, body: { quantity } },
        res,
        () => {}
      );
      assert.equal(res.statusCode, 400, String(quantity));
    }
  } finally {
    prisma.product.findUnique = originalFindUnique;
    prisma.product.update = originalUpdate;
  }
});
