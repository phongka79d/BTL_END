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

test('cancelMyOrder returns the cancelled order for the owning customer', async () => {
  const original = orderModel.cancelOwnOrder;

  try {
    orderModel.cancelOwnOrder = async (id, userId) => ({ id, userId, status: 'cancelled' });

    const req = { params: { id: 'order_1' }, user: { id: 'customer_1', role: 'customer' } };
    const res = createMockResponse();

    await orderController.cancelMyOrder(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'cancelled');
  } finally {
    orderModel.cancelOwnOrder = original;
  }
});

test('cancelMyOrder maps model failures to the matching HTTP status', async () => {
  const original = orderModel.cancelOwnOrder;

  const cases = [
    { message: 'Không tìm thấy đơn hàng có ID order_1.', expected: 404 },
    { message: 'Không được phép hủy đơn hàng của người dùng khác.', expected: 403 },
    { message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận hoặc đã xác nhận.', expected: 400 },
    { message: 'Trạng thái đơn hàng đã thay đổi, vui lòng thử lại.', expected: 409 }
  ];

  try {
    for (const testCase of cases) {
      orderModel.cancelOwnOrder = async () => {
        throw new Error(testCase.message);
      };

      const res = createMockResponse();
      await orderController.cancelMyOrder(
        { params: { id: 'order_1' }, user: { id: 'customer_1' } },
        res,
        () => {}
      );

      assert.equal(res.statusCode, testCase.expected, testCase.message);
      assert.equal(res.body.success, false);
    }
  } finally {
    orderModel.cancelOwnOrder = original;
  }
});

test('updateOrderStatus rejects a transition the model refuses', async () => {
  const original = orderModel.updateStatus;

  try {
    orderModel.updateStatus = async () => {
      throw new Error('Không thể chuyển trạng thái từ completed sang pending.');
    };

    const res = createMockResponse();
    await orderController.updateOrderStatus(
      { params: { id: 'order_1' }, body: { status: 'pending' } },
      res,
      () => {}
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
  } finally {
    orderModel.updateStatus = original;
  }
});
