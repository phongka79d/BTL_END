import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./reportApi.js', import.meta.url), 'utf8');

test('report API helper uses apiClient for all admin report endpoints', () => {
  assert.match(source, /import \{ apiClient \} from '\.\/apiClient';/);
  assert.match(source, /export const reportApi = \{/);
  assert.match(source, /getRevenueReport[\s\S]*?\/admin\/reports\/revenue/);
  assert.match(source, /getBestSellingProductsReport[\s\S]*?\/admin\/reports\/best-selling-products/);
  assert.match(source, /getOrderSummaryReport[\s\S]*?\/admin\/reports\/order-summary/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /supabase/i);
});

test('report API helper forwards an optional date range and keeps the default call unchanged', () => {
  assert.match(source, /const buildRangeQuery = \(range = \{\}\) => \{/);
  assert.match(source, /if \(!range\) return '';/);
  assert.match(source, /params\.set\('startDate', range\.startDate\)/);
  assert.match(source, /params\.set\('endDate', range\.endDate\)/);
  assert.match(source, /apiClient\.get\(`\/admin\/reports\/revenue\$\{buildRangeQuery\(range\)\}`\)/);
  assert.match(source, /apiClient\.get\(`\/admin\/reports\/best-selling-products\$\{buildRangeQuery\(range\)\}`\)/);
  assert.match(source, /apiClient\.get\(`\/admin\/reports\/order-summary\$\{buildRangeQuery\(range\)\}`\)/);
});
