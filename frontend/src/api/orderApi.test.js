import assert from 'node:assert/strict';
import test from 'node:test';

import { apiClient } from './apiClient.js';
import { orderApi } from './orderApi.js';

const captureAdminOrderRequests = async (run) => {
  const originalGet = apiClient.get;
  const requestedEndpoints = [];
  apiClient.get = async (endpoint) => {
    requestedEndpoints.push(endpoint);
    return { success: true, data: { items: [], pagination: {} } };
  };

  try {
    await run();
  } finally {
    apiClient.get = originalGet;
  }

  return requestedEndpoints;
};

test('orderApi.getAdminOrders serializes status, keyword aliases, searchField, and pagination', async () => {
  const endpoints = await captureAdminOrderRequests(async () => {
    await orderApi.getAdminOrders({
      status: 'pending',
      keyword: 'Alice',
      searchField: 'customer',
      page: 2,
      limit: 5
    });
  });

  assert.deepEqual(endpoints, [
    '/admin/orders?status=pending&keyword=Alice&search=Alice&searchField=customer&page=2&limit=5'
  ]);
});

test('orderApi.getAdminOrders keeps the legacy search alias and omits an absent searchField', async () => {
  const endpoints = await captureAdminOrderRequests(async () => {
    await orderApi.getAdminOrders({ search: 'Alice' });
    await orderApi.getAdminOrders({ keyword: 'Alice', searchField: '' });
  });

  assert.deepEqual(endpoints, [
    '/admin/orders?keyword=Alice&search=Alice',
    '/admin/orders?keyword=Alice&search=Alice'
  ]);
});

test('orderApi.getAdminOrders keeps the status shorthand and bare list requests intact', async () => {
  const endpoints = await captureAdminOrderRequests(async () => {
    await orderApi.getAdminOrders();
    await orderApi.getAdminOrders('completed');
    await orderApi.getAdminOrders({});
  });

  assert.deepEqual(endpoints, [
    '/admin/orders',
    '/admin/orders?status=completed',
    '/admin/orders'
  ]);
});
