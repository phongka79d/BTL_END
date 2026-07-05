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
    ['getRevenueReport', 'Revenue report retrieved successfully', modelResults.revenue],
    [
      'getBestSellingProductsReport',
      'Best-selling products report retrieved successfully',
      modelResults.bestSellingProducts,
    ],
    ['getOrderSummaryReport', 'Order summary report retrieved successfully', modelResults.orderSummary],
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

test('report routes protect every endpoint with authentication and admin middleware', () => {
  const reportController = require('./report.controller');
  const { protect } = require('../middlewares/auth.middleware');
  const { admin } = require('../middlewares/admin.middleware');
  const reportRouter = require('../routes/report.routes');

  const routes = reportRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      method: Object.keys(layer.route.methods)[0],
      handlers: layer.route.stack.map((routeLayer) => routeLayer.handle),
    }));

  assert.deepEqual(routes, [
    {
      path: '/revenue',
      method: 'get',
      handlers: [protect, admin, reportController.getRevenueReport],
    },
    {
      path: '/best-selling-products',
      method: 'get',
      handlers: [protect, admin, reportController.getBestSellingProductsReport],
    },
    {
      path: '/order-summary',
      method: 'get',
      handlers: [protect, admin, reportController.getOrderSummaryReport],
    },
  ]);
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
    assert.equal(body.message, 'Not authorized, no token provided');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
