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
