import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./orderApi.js', import.meta.url), 'utf8');

test('orderApi exposes createOrder, getMyOrders, getOrderById, cancelOrder, getAdminOrders, and updateOrderStatus', () => {
  assert.match(source, /createOrder:\s*\(shippingAddress\)\s*=>\s*apiClient\.post\('\/orders'/);
  assert.match(source, /getMyOrders:\s*\(\)\s*=>\s*apiClient\.get\('\/orders\/my-orders'/);
  assert.match(source, /getOrderById:\s*\(id\)\s*=>\s*apiClient\.get\(`\/orders\/\$\{id\}`\)/);
  assert.match(source, /cancelOrder:\s*\(id\)\s*=>\s*apiClient\.put\(`\/orders\/\$\{id\}\/cancel`\)/);
  assert.match(source, /getAdminOrders:\s*\(params\)\s*=>/);
  assert.match(source, /updateOrderStatus:\s*\(id,\s*status\)\s*=>\s*apiClient\.put\(`\/admin\/orders\/\$\{id\}\/status`/);
});

test('orderApi.getAdminOrders serializes status, keyword, page, and limit query parameters', () => {
  assert.match(source, /params\.status/);
  assert.match(source, /params\.keyword/);
  assert.match(source, /params\.page/);
  assert.match(source, /params\.limit/);
  assert.match(source, /apiClient\.get\(`\/admin\/orders\$\{query \? `\?\$\{query\}` : ''\}`\)/);
});
