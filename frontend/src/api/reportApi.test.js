import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./reportApi.js', import.meta.url), 'utf8');

test('report API helper uses apiClient for all admin report endpoints', () => {
  assert.match(source, /import \{ apiClient \} from '\.\/apiClient';/);
  assert.match(source, /export const reportApi = \{/);
  assert.match(source, /getRevenueReport:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/reports\/revenue'\)/);
  assert.match(source, /getBestSellingProductsReport:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/reports\/best-selling-products'\)/);
  assert.match(source, /getOrderSummaryReport:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/reports\/order-summary'\)/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /supabase/i);
});
