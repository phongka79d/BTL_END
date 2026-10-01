const test = require('node:test');
const assert = require('node:assert/strict');
const productController = require('./product.controller');
const productModel = require('../models/product.model');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS, hasRolePermission } = require('../config/permissions');

const createMockResponse = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
};

test('updateStock capability authorization grants Staff & Admin, rejects Customer', () => {
  assert.equal(hasRolePermission('staff', PERMISSIONS.PRODUCTS_UPDATE_STOCK), true);
  assert.equal(hasRolePermission('admin', PERMISSIONS.PRODUCTS_UPDATE_STOCK), true);
  assert.equal(hasRolePermission('customer', PERMISSIONS.PRODUCTS_UPDATE_STOCK), false);

  const mw = requirePermission(PERMISSIONS.PRODUCTS_UPDATE_STOCK);

  // Staff passes
  let nextCalledStaff = false;
  mw({ user: { id: 's1', role: 'staff' } }, createMockResponse(), () => { nextCalledStaff = true; });
  assert.equal(nextCalledStaff, true);

  // Customer blocked with 403
  let nextCalledCust = false;
  const resCust = createMockResponse();
  mw({ user: { id: 'c1', role: 'customer' } }, resCust, () => { nextCalledCust = true; });
  assert.equal(nextCalledCust, false);
  assert.equal(resCust.statusCode, 403);
});

test('updateStock rejects missing quantity with 400', async () => {
  const req = { params: { id: 'p1' }, body: {} };
  const res = createMockResponse();

  await productController.updateStock(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test('updateStock rejects non-integer and invalid quantity values with 400', async () => {
  for (const quantity of [-1, -999, 1.5, '1.5', '', 'abc', NaN, true]) {
    const req = { params: { id: 'p1' }, body: { quantity } };
    const res = createMockResponse();

    await productController.updateStock(req, res, () => {});

    assert.equal(res.statusCode, 400, String(quantity));
    assert.equal(res.body.success, false, String(quantity));
  }
});

test('updateStock returns 404 when product is not found', async () => {
  const originalFindById = productModel.findById;
  try {
    productModel.findById = async () => null;

    const req = { params: { id: 'p_nonexistent' }, body: { quantity: 10 } };
    const res = createMockResponse();

    await productController.updateStock(req, res, () => {});

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
  } finally {
    productModel.findById = originalFindById;
  }
});

test('updateStock calls productModel.updateStock and returns 200 with updated product', async () => {
  const originalFindById = productModel.findById;
  const originalUpdateStock = productModel.updateStock;
  try {
    productModel.findById = async (id) => ({ id, name: 'Laptop', quantity: 5 });
    productModel.updateStock = async (id, quantity) => ({ id, name: 'Laptop', quantity: parseInt(quantity, 10) });

    const req = { params: { id: 'p1' }, body: { quantity: 50 } };
    const res = createMockResponse();

    await productController.updateStock(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.product.quantity, 50);
  } finally {
    productModel.findById = originalFindById;
    productModel.updateStock = originalUpdateStock;
  }
});

test('updateStock accepts zero quantity without clamping and persists it', async () => {
  const originalFindById = productModel.findById;
  const originalUpdateStock = productModel.updateStock;
  try {
    productModel.findById = async (id) => ({ id, name: 'Laptop', quantity: 5 });
    let receivedQuantity = null;
    productModel.updateStock = async (id, quantity) => {
      receivedQuantity = quantity;
      return { id, name: 'Laptop', quantity: 0 };
    };

    const req = { params: { id: 'p1' }, body: { quantity: 0 } };
    const res = createMockResponse();

    await productController.updateStock(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(receivedQuantity, 0);
    assert.equal(res.body.data.product.quantity, 0);
  } finally {
    productModel.findById = originalFindById;
    productModel.updateStock = originalUpdateStock;
  }
});

test('getProducts forwards stockStatus filter to the model and returns the filtered page', async () => {
  const originalFindAll = productModel.findAll;
  let receivedParams = null;
  try {
    productModel.findAll = async (params) => {
      receivedParams = params;
      return {
        items: [{ id: 'p1', name: 'Out of stock product', quantity: 0 }],
        pagination: { page: 2, limit: 12, total: 13, totalPages: 2 }
      };
    };

    const req = { query: { page: '2', limit: '12', stockStatus: 'out' } };
    const res = createMockResponse();

    await productController.getProducts(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(receivedParams.stockStatus, 'out');
    assert.equal(receivedParams.page, '2');
    assert.deepEqual(res.body.data.items.map((product) => product.id), ['p1']);
    assert.equal(res.body.data.pagination.total, 13);
    assert.equal(res.body.data.pagination.totalPages, 2);
  } finally {
    productModel.findAll = originalFindAll;
  }
});

test('getProducts rejects unknown, non-string and repeated stockStatus values with 400 without querying the model', async () => {
  const originalFindAll = productModel.findAll;
  const invalidValues = ['all', 'danger', 'LOW', 'in-stock', 0, 5, true, ['low'], ['low', 'out'], { value: 'low' }];
  try {
    let findAllCalled = false;
    productModel.findAll = async () => {
      findAllCalled = true;
      return { items: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
    };

    for (const stockStatus of invalidValues) {
      findAllCalled = false;
      const res = createMockResponse();

      await productController.getProducts({ query: { stockStatus } }, res, () => {});

      assert.equal(res.statusCode, 400, JSON.stringify(stockStatus));
      assert.equal(res.body.success, false, JSON.stringify(stockStatus));
      assert.equal(findAllCalled, false, JSON.stringify(stockStatus));
    }
  } finally {
    productModel.findAll = originalFindAll;
  }
});

test('getProducts keeps the public list unfiltered when stockStatus is absent or empty', async () => {
  const originalFindAll = productModel.findAll;
  const receivedParams = [];
  try {
    productModel.findAll = async (params) => {
      receivedParams.push(params);
      return { items: [{ id: 'p1', name: 'Any product' }], pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } };
    };

    for (const query of [{}, { stockStatus: undefined }, { stockStatus: '' }]) {
      const res = createMockResponse();

      await productController.getProducts({ query }, res, () => {});

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.data.items.map((product) => product.id), ['p1']);
    }

    assert.equal(receivedParams.length, 3);
    assert.ok(receivedParams.every((params) => params.stockStatus === undefined || params.stockStatus === ''));
  } finally {
    productModel.findAll = originalFindAll;
  }
});
