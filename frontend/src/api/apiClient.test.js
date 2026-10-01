import assert from 'node:assert/strict';
import test, { after, beforeEach } from 'node:test';

import { apiClient } from './apiClient.js';

const originalFetch = globalThis.fetch;
const originalLocalStorage = globalThis.localStorage;

const calls = [];

globalThis.localStorage = { getItem: () => null };
globalThis.fetch = async (url, options) => {
  calls.push({ url, options });
  return {
    ok: true,
    json: async () => ({ success: true })
  };
};

after(() => {
  globalThis.fetch = originalFetch;
  globalThis.localStorage = originalLocalStorage;
});

beforeEach(() => {
  calls.length = 0;
});

test('stock reads disable browser caching without affecting unrelated GET requests', async () => {
  await apiClient.get('/products?page=1');
  await apiClient.get('/products/product-1');
  await apiClient.get('/cart');
  await apiClient.get('/categories');
  await apiClient.get('/products/product-1/reviews');

  assert.deepEqual(
    calls.slice(0, 3).map(({ options }) => options.cache),
    ['no-store', 'no-store', 'no-store']
  );
  assert.equal(calls[3].options.cache, undefined);
  assert.equal(calls[4].options.cache, undefined);
});
