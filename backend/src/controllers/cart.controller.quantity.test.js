const assert = require('node:assert/strict');
const test = require('node:test');

const cartController = require('./cart.controller');
const cartModel = require('../models/cart.model');
const cartItemModel = require('../models/cartItem.model');
const productModel = require('../models/product.model');

const INVALID_QUANTITY = 'Số lượng không hợp lệ';

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

test('cart add rejects malformed quantity values before reading stock', async () => {
  const invalidValues = [0, '0', -1, '-1', -999, '-999', 1.5, '1.5', '', ' ', 'abc', NaN, true, null, undefined];

  for (const quantity of invalidValues) {
    const res = createMockResponse();
    let nextCalled = false;

    await cartController.addCartItem(
      { user: { id: 'user-1' }, body: { productId: 'product-1', quantity } },
      res,
      () => { nextCalled = true; }
    );

    assert.equal(res.statusCode, 400, String(quantity));
    assert.equal(res.body.message, INVALID_QUANTITY, String(quantity));
    assert.equal(nextCalled, false, String(quantity));
  }
});

test('cart add accepts stock boundary one and rejects a request above stock', async () => {
  const originalFindById = productModel.findById;
  const originalGetOrCreateCart = cartModel.getOrCreateCart;
  const originalAddItem = cartModel.addItem;

  try {
    productModel.findById = async () => ({ id: 'product-1', quantity: 34 });
    cartModel.getOrCreateCart = async () => ({ items: [] });
    cartModel.addItem = async (_userId, _productId, quantity) => ({ quantity });

    for (const quantity of [1, 34]) {
      const accepted = createMockResponse();
      await cartController.addCartItem(
        { user: { id: 'user-1' }, body: { productId: 'product-1', quantity } },
        accepted,
        () => {}
      );
      assert.equal(accepted.statusCode, 201, String(quantity));
    }

    const rejected = createMockResponse();
    await cartController.addCartItem(
      { user: { id: 'user-1' }, body: { productId: 'product-1', quantity: 35 } },
      rejected,
      () => {}
    );
    assert.equal(rejected.statusCode, 400);
    assert.equal(rejected.body.message, INVALID_QUANTITY);
  } finally {
    productModel.findById = originalFindById;
    cartModel.getOrCreateCart = originalGetOrCreateCart;
    cartModel.addItem = originalAddItem;
  }
});

test('cart update rejects malformed quantity values before loading the cart item', async () => {
  const invalidValues = [0, '0', 1.5, '1.5', '', 'abc', NaN, false, null, undefined];

  for (const quantity of invalidValues) {
    const res = createMockResponse();
    let nextCalled = false;

    await cartController.updateCartItem(
      { user: { id: 'user-1' }, params: { id: 'item-1' }, body: { quantity } },
      res,
      () => { nextCalled = true; }
    );

    assert.equal(res.statusCode, 400, String(quantity));
    assert.equal(res.body.message, INVALID_QUANTITY, String(quantity));
    assert.equal(nextCalled, false, String(quantity));
  }
});

test('cart update rejects quantities above the current product stock', async () => {
  const originalFindById = cartItemModel.findById;
  const originalGetOrCreateCart = cartModel.getOrCreateCart;
  const originalProductFindById = productModel.findById;

  try {
    cartItemModel.findById = async () => ({ cartId: 'cart-1', productId: 'product-1' });
    cartModel.getOrCreateCart = async () => ({ id: 'cart-1' });
    productModel.findById = async () => ({ id: 'product-1', quantity: 34 });

    const rejected = createMockResponse();
    await cartController.updateCartItem(
      { user: { id: 'user-1' }, params: { id: 'item-1' }, body: { quantity: 35 } },
      rejected,
      () => {}
    );

    assert.equal(rejected.statusCode, 400);
    assert.equal(rejected.body.message, INVALID_QUANTITY);
  } finally {
    cartItemModel.findById = originalFindById;
    cartModel.getOrCreateCart = originalGetOrCreateCart;
    productModel.findById = originalProductFindById;
  }
});
