const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const express = require('express');

const reportModelPath = require.resolve('../models/report.model');
const reportModel = require(reportModelPath);

const modelResults = {
  revenue: {
    totalRevenue: '0.00',
    completedOrderCount: 0,
  },
  bestSellingProducts: [],
  orderSummary: {
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  },
};

beforeEach(() => {
  reportModel.getRevenue = async () => modelResults.revenue;
  reportModel.getBestSellingProducts = async () => modelResults.bestSellingProducts;
  reportModel.getOrderSummary = async () => modelResults.orderSummary;
});

const createResponse = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
  };
  return response;
};

test('report controllers return the three Plan 4 response shapes', async () => {
  const reportController = require('./report.controller');
  const cases = [
    ['getRevenueReport', 'Đã lấy báo cáo doanh thu thành công', { ...modelResults.revenue, range: null }],
    [
      'getBestSellingProductsReport',
      'Đã lấy báo cáo sản phẩm bán chạy thành công',
      modelResults.bestSellingProducts,
    ],
    ['getOrderSummaryReport', 'Đã lấy báo cáo tổng quan đơn hàng thành công', { ...modelResults.orderSummary, range: null }],
  ];

  for (const [method, message, data] of cases) {
    const response = createResponse();
    await reportController[method]({}, response, assert.fail);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
      success: true,
      message,
      data,
    });
  }
});

test('report controllers forward aggregation failures to error middleware', async () => {
  const reportController = require('./report.controller');
  const failure = new Error('database unavailable');
  reportModel.getRevenue = async () => {
    throw failure;
  };

  const response = createResponse();
  let forwardedError;
  await reportController.getRevenueReport({}, response, (error) => {
    forwardedError = error;
  });

  assert.equal(forwardedError, failure);
  assert.equal(response.statusCode, null);
});

test('report routes protect every endpoint with authentication and a capability gate', () => {
  const reportController = require('./report.controller');
  const { protect } = require('../middlewares/auth.middleware');
  const reportRouter = require('../routes/report.routes');

  const routes = reportRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      method: Object.keys(layer.route.methods)[0],
      handlers: layer.route.stack.map((routeLayer) => routeLayer.handle),
    }));

  assert.deepEqual(
    routes.map((route) => `${route.method} ${route.path}`),
    ['get /revenue', 'get /best-selling-products', 'get /order-summary']
  );

  const controllersByPath = {
    '/revenue': reportController.getRevenueReport,
    '/best-selling-products': reportController.getBestSellingProductsReport,
    '/order-summary': reportController.getOrderSummaryReport,
  };

  for (const route of routes) {
    assert.equal(route.handlers.length, 3);
    assert.equal(route.handlers[0], protect);
    assert.equal(typeof route.handlers[1], 'function');
    assert.equal(route.handlers[2], controllersByPath[route.path]);
  }
});

test('report capability gate rejects customers without touching the controller', () => {
  const reportRouter = require('../routes/report.routes');
  const revenueRoute = reportRouter.stack
    .filter((layer) => layer.route && layer.route.path === '/revenue')[0];
  const capabilityGate = revenueRoute.route.stack[1].handle;

  const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  });

  const forbidden = createResponse();
  let reachedController = false;

  capabilityGate(
    { user: { id: 'customer_1', role: 'customer' } },
    forbidden,
    () => {
      reachedController = true;
    }
  );

  assert.equal(reachedController, false);
  assert.equal(forbidden.statusCode, 403);
  assert.equal(forbidden.body.success, false);

  const unauthenticated = createResponse();
  capabilityGate({}, unauthenticated, () => {
    reachedController = true;
  });

  assert.equal(reachedController, false);
  assert.equal(unauthenticated.statusCode, 401);
});

test('report router is mounted at /api/admin/reports', async () => {
  const app = express();
  app.use('/api', require('../routes'));
  app.use((req, res) => res.status(404).json({ status: 404 }));

  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://localhost:${port}/api/admin/reports/revenue`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.message, 'Không được phép, chưa cung cấp token');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
