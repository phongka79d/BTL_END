const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const express = require('express');

const storefrontModel = require('../models/storefrontContent.model');

beforeEach(() => {
  storefrontModel.findPublicCarouselSlides = async () => [];
  storefrontModel.findPublicNavigation = async () => [];
  storefrontModel.findAdminCarouselSlides = async () => [];
  storefrontModel.createCarouselSlide = async (payload) => ({ id: 'slide-1', ...payload });
  storefrontModel.updateCarouselSlide = async (id, payload) => ({ id, ...payload });
  storefrontModel.deleteCarouselSlide = async () => ({ id: 'slide-1' });
  storefrontModel.findAdminNavigation = async () => [];
  storefrontModel.createNavigationItem = async (payload) => ({ id: 'nav-1', ...payload });
  storefrontModel.updateNavigationItem = async (id, payload) => ({ id, ...payload });
  storefrontModel.deleteNavigationItem = async () => ({ id: 'nav-1' });
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

test('public storefront controllers return carousel and navigation response shapes', async () => {
  const controller = require('./storefrontContent.controller');

  const carouselResponse = createResponse();
  await controller.getPublicCarousel({}, carouselResponse, assert.fail);
  assert.equal(carouselResponse.statusCode, 200);
  assert.deepEqual(carouselResponse.body, {
    success: true,
    message: 'Storefront carousel retrieved successfully',
    data: { slides: [] },
  });

  const navResponse = createResponse();
  await controller.getPublicNavigation({}, navResponse, assert.fail);
  assert.equal(navResponse.statusCode, 200);
  assert.deepEqual(navResponse.body, {
    success: true,
    message: 'Storefront navigation retrieved successfully',
    data: { items: [] },
  });
});

test('admin create carousel validation errors return HTTP 400', async () => {
  const controller = require('./storefrontContent.controller');
  storefrontModel.createCarouselSlide = async () => {
    throw new Error('Carousel title is required.');
  };

  const response = createResponse();
  await controller.createAdminCarouselSlide({ body: {} }, response, assert.fail);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Carousel title is required.');
});

test('storefront routes mount public and admin endpoints with protection', async () => {
  const { protect } = require('../middlewares/auth.middleware');
  const { admin } = require('../middlewares/admin.middleware');
  const controller = require('./storefrontContent.controller');
  const { storefrontContentPublicRouter, storefrontContentAdminRouter } = require('../routes/storefrontContent.routes');

  const publicRoutes = storefrontContentPublicRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      method: Object.keys(layer.route.methods)[0],
      handlers: layer.route.stack.map((routeLayer) => routeLayer.handle),
    }));

  assert.deepEqual(publicRoutes, [
    { path: '/carousel', method: 'get', handlers: [controller.getPublicCarousel] },
    { path: '/navigation', method: 'get', handlers: [controller.getPublicNavigation] },
  ]);

  const adminRoutes = storefrontContentAdminRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      method: Object.keys(layer.route.methods)[0],
      handlers: layer.route.stack.map((routeLayer) => routeLayer.handle),
    }));

  assert.deepEqual(adminRoutes.map((route) => route.handlers.slice(0, 2)), [
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
  ]);
});

test('public and admin storefront routes are mounted under /api', async () => {
  const app = express();
  app.use('/api', require('../routes'));
  app.use((req, res) => res.status(404).json({ status: 404 }));

  const server = app.listen(0);
  try {
    const { port } = server.address();

    const publicResponse = await fetch(`http://localhost:${port}/api/storefront/carousel`);
    const publicBody = await publicResponse.json();
    assert.equal(publicResponse.status, 200);
    assert.equal(publicBody.message, 'Storefront carousel retrieved successfully');

    const adminResponse = await fetch(`http://localhost:${port}/api/admin/storefront/carousel`);
    const adminBody = await adminResponse.json();
    assert.equal(adminResponse.status, 401);
    assert.equal(adminBody.message, 'Not authorized, no token provided');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
