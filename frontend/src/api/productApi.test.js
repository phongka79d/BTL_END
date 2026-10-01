import assert from 'node:assert/strict';
import test from 'node:test';

import { apiClient } from './apiClient.js';
import { productApi } from './productApi.js';

test('product stock reads request no-store through the API client', async () => {
  const originalGet = apiClient.get;
  const calls = [];
  apiClient.get = async (endpoint, options) => {
    calls.push({ endpoint, options });
    return { success: true };
  };

  try {
    await productApi.getProducts({ page: 2 });
    await productApi.getProductById('product-1');
  } finally {
    apiClient.get = originalGet;
  }

  assert.deepEqual(calls, [
    { endpoint: '/products?page=2', options: { cache: 'no-store' } },
    { endpoint: '/products/product-1', options: { cache: 'no-store' } }
  ]);
});

test('product list requests serialize the stockStatus filter when supplied', async () => {
  const originalGet = apiClient.get;
  const calls = [];
  apiClient.get = async (endpoint, options) => {
    calls.push({ endpoint, options });
    return { success: true };
  };

  try {
    await productApi.getProducts({ page: 2, limit: 12, stockStatus: 'low' });
    await productApi.getProducts({ keyword: 'laptop', categoryId: 'c1', stockStatus: 'out' });
  } finally {
    apiClient.get = originalGet;
  }

  assert.deepEqual(calls, [
    { endpoint: '/products?page=2&limit=12&stockStatus=low', options: { cache: 'no-store' } },
    { endpoint: '/products?keyword=laptop&categoryId=c1&stockStatus=out', options: { cache: 'no-store' } }
  ]);
});

test('product list requests omit an empty stockStatus filter', async () => {
  const originalGet = apiClient.get;
  const calls = [];
  apiClient.get = async (endpoint, options) => {
    calls.push({ endpoint, options });
    return { success: true };
  };

  try {
    await productApi.getProducts({ page: 1, stockStatus: '' });
    await productApi.getProducts({ page: 1, stockStatus: undefined });
  } finally {
    apiClient.get = originalGet;
  }

  assert.deepEqual(calls, [
    { endpoint: '/products?page=1', options: { cache: 'no-store' } },
    { endpoint: '/products?page=1', options: { cache: 'no-store' } }
  ]);
});
