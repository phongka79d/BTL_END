const test = require('node:test');
const assert = require('node:assert/strict');
const reportController = require('./report.controller');
const reportModel = require('../models/report.model');

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

const withReportModelStubs = async (run) => {
  const originals = {
    getRevenue: reportModel.getRevenue,
    getBestSellingProducts: reportModel.getBestSellingProducts,
    getOrderSummary: reportModel.getOrderSummary
  };

  try {
    return await run();
  } finally {
    reportModel.getRevenue = originals.getRevenue;
    reportModel.getBestSellingProducts = originals.getBestSellingProducts;
    reportModel.getOrderSummary = originals.getOrderSummary;
  }
};

test('revenue report rejects a reversed date range before querying the database', async () => {
  let modelCalled = false;

  await withReportModelStubs(async () => {
    reportModel.getRevenue = async () => {
      modelCalled = true;
      return { totalRevenue: '0.00', completedOrderCount: 0 };
    };

    const res = createMockResponse();
    await reportController.getRevenueReport(
      { query: { startDate: '2026-09-10', endDate: '2026-09-01' } },
      res,
      () => {}
    );

    assert.equal(modelCalled, false);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, 'Ngày bắt đầu không được sau ngày kết thúc');
  });
});

test('revenue report rejects malformed dates', async () => {
  await withReportModelStubs(async () => {
    reportModel.getRevenue = async () => {
      throw new Error('model should not be called');
    };

    const res = createMockResponse();
    await reportController.getRevenueReport(
      { query: { startDate: 'not-a-date' } },
      res,
      () => {}
    );

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.message.includes('Định dạng ngày'));
  });
});

test('revenue report keeps working without range parameters', async () => {
  let capturedRange = 'unset';

  await withReportModelStubs(async () => {
    reportModel.getRevenue = async (range) => {
      capturedRange = range;
      return { totalRevenue: '12.00', completedOrderCount: 1 };
    };

    const res = createMockResponse();
    await reportController.getRevenueReport({ query: {} }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(capturedRange, null);
    assert.equal(res.body.data.totalRevenue, '12.00');
    assert.equal(res.body.data.range, null);
  });
});

test('revenue report passes an inclusive end-of-day boundary to the model', async () => {
  let capturedRange = null;

  await withReportModelStubs(async () => {
    reportModel.getRevenue = async (range) => {
      capturedRange = range;
      return { totalRevenue: '0.00', completedOrderCount: 0 };
    };

    const res = createMockResponse();
    await reportController.getRevenueReport(
      { query: { startDate: '2026-09-01', endDate: '2026-09-14' } },
      res,
      () => {}
    );

    assert.equal(res.statusCode, 200);
    assert.equal(capturedRange.startDate.getFullYear(), 2026);
    assert.equal(capturedRange.startDate.getMonth(), 8);
    assert.equal(capturedRange.startDate.getDate(), 1);
    assert.equal(capturedRange.startDate.getHours(), 0);
    assert.equal(capturedRange.endDate.getDate(), 14);
    assert.equal(capturedRange.endDate.getHours(), 23);
    assert.ok(res.body.data.range.startDate.startsWith('2026-'));
  });
});

test('order summary report forwards the range and keeps its shape', async () => {
  let capturedRange = null;

  await withReportModelStubs(async () => {
    reportModel.getOrderSummary = async (range) => {
      capturedRange = range;
      return { pending: 1, confirmed: 0, shipping: 0, completed: 2, cancelled: 0 };
    };

    const res = createMockResponse();
    await reportController.getOrderSummaryReport(
      { query: { startDate: '2026-09-01', endDate: '2026-09-14' } },
      res,
      () => {}
    );

    assert.equal(res.statusCode, 200);
    assert.equal(capturedRange.startDate.getDate(), 1);
    assert.equal(res.body.data.completed, 2);
    assert.equal(res.body.data.cancelled, 0);
  });
});

test('best-selling report keeps returning an array payload', async () => {
  await withReportModelStubs(async () => {
    reportModel.getBestSellingProducts = async () => ([{ productId: 'product_1', soldQuantity: 3 }]);

    const res = createMockResponse();
    await reportController.getBestSellingProductsReport({ query: {} }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data[0].productId, 'product_1');
  });
});
