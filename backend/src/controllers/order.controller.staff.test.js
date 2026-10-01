const test = require('node:test');
const assert = require('node:assert/strict');
const orderController = require('./order.controller');
const orderModel = require('../models/order.model');

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

test('getOrderById allows staff to view another user order', async () => {
  const originalFindById = orderModel.findById;
  const originalFindOwnedOrAdmin = orderModel.findOwnedOrAdminVisible;

  try {
    orderModel.findById = async (id) => ({ id, userId: 'customer_1' });
    orderModel.findOwnedOrAdminVisible = async (id, userId, canViewAll) => ({
      id,
      userId: 'customer_1',
      totalAmount: '100.00',
      canViewAll
    });

    const req = {
      params: { id: 'order_123' },
      user: { id: 'staff_1', role: 'staff' }
    };
    const res = createMockResponse();

    await orderController.getOrderById(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.canViewAll, true);
  } finally {
    orderModel.findById = originalFindById;
    orderModel.findOwnedOrAdminVisible = originalFindOwnedOrAdmin;
  }
});

test('getOrderById allows customer to view own order but blocks other customer order', async () => {
  const originalFindById = orderModel.findById;
  const originalFindOwnedOrAdmin = orderModel.findOwnedOrAdminVisible;

  try {
    orderModel.findById = async (id) => ({ id, userId: 'customer_1' });
    orderModel.findOwnedOrAdminVisible = async (id, userId, canViewAll) => ({
      id,
      userId,
      canViewAll
    });

    // Case 1: Own order
    const reqOwn = {
      params: { id: 'order_123' },
      user: { id: 'customer_1', role: 'customer' }
    };
    const resOwn = createMockResponse();
    await orderController.getOrderById(reqOwn, resOwn, () => {});

    assert.equal(resOwn.statusCode, 200);
    assert.equal(resOwn.body.success, true);
    assert.equal(resOwn.body.data.canViewAll, false);

    // Case 2: Other customer order
    const reqOther = {
      params: { id: 'order_123' },
      user: { id: 'customer_2', role: 'customer' }
    };
    const resOther = createMockResponse();
    await orderController.getOrderById(reqOther, resOther, () => {});

    assert.equal(resOther.statusCode, 403);
    assert.equal(resOther.body.success, false);
  } finally {
    orderModel.findById = originalFindById;
    orderModel.findOwnedOrAdminVisible = originalFindOwnedOrAdmin;
  }
});

test('getAdminOrders forwards status, keyword, searchField, page, and limit to orderModel.listForAdmin', async () => {
  const originalListForAdmin = orderModel.listForAdmin;

  try {
    let capturedFilters = null;
    orderModel.listForAdmin = async (filters) => {
      capturedFilters = filters;
      return {
        items: [{ id: 'order_1', status: 'pending' }],
        pagination: { page: 2, limit: 5, total: 10, totalPages: 2 }
      };
    };

    const req = {
      query: { status: 'pending', keyword: 'Alice', searchField: 'customer', page: '2', limit: '5' },
      user: { id: 'staff_1', role: 'staff' }
    };
    const res = createMockResponse();

    await orderController.getAdminOrders(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(capturedFilters, {
      status: 'pending',
      keyword: 'Alice',
      searchField: 'customer',
      page: '2',
      limit: '5'
    });
    assert.equal(res.body.data.pagination.page, 2);
    assert.equal(res.body.data.items.length, 1);
  } finally {
    orderModel.listForAdmin = originalListForAdmin;
  }
});

test('getAdminOrders rejects unknown or non-string searchField values with 400 without querying the model', async () => {
  const originalListForAdmin = orderModel.listForAdmin;

  try {
    let listCalled = false;
    orderModel.listForAdmin = async () => {
      listCalled = true;
      return { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
    };

    const invalidValues = [
      'bogus',
      'id',
      'ALL',
      ['orderId'],
      ['orderId', 'customer'],
      { value: 'customer' },
      0,
      5,
      true
    ];

    for (const searchField of invalidValues) {
      listCalled = false;
      const res = createMockResponse();

      await orderController.getAdminOrders({ query: { searchField }, user: { role: 'staff' } }, res, () => {});

      assert.equal(res.statusCode, 400, `searchField=${JSON.stringify(searchField)}`);
      assert.equal(res.body.success, false, `searchField=${JSON.stringify(searchField)}`);
      assert.equal(listCalled, false, `searchField=${JSON.stringify(searchField)}`);
    }
  } finally {
    orderModel.listForAdmin = originalListForAdmin;
  }
});

test('getAdminOrders returns 400 when status, page, or limit validation fails', async () => {
  const originalListForAdmin = orderModel.listForAdmin;

  try {
    // Invalid status
    orderModel.listForAdmin = async () => {
      throw new Error('Bộ lọc trạng thái không hợp lệ: invalid_status');
    };
    const resStatus = createMockResponse();
    await orderController.getAdminOrders({ query: { status: 'invalid_status' }, user: { role: 'staff' } }, resStatus, () => {});
    assert.equal(resStatus.statusCode, 400);
    assert.equal(resStatus.body.success, false);

    // Invalid page
    orderModel.listForAdmin = async () => {
      throw new Error('Trang phải là số nguyên dương (>= 1)');
    };
    const resPage = createMockResponse();
    await orderController.getAdminOrders({ query: { page: '-1' }, user: { role: 'staff' } }, resPage, () => {});
    assert.equal(resPage.statusCode, 400);
    assert.equal(resPage.body.success, false);

    // Invalid limit
    orderModel.listForAdmin = async () => {
      throw new Error('Giới hạn phải là số nguyên từ 1 đến 100');
    };
    const resLimit = createMockResponse();
    await orderController.getAdminOrders({ query: { limit: '999' }, user: { role: 'staff' } }, resLimit, () => {});
    assert.equal(resLimit.statusCode, 400);
    assert.equal(resLimit.body.success, false);
  } finally {
    orderModel.listForAdmin = originalListForAdmin;
  }
});
