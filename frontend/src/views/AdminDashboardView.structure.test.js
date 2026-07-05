import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./AdminDashboardView.jsx', import.meta.url),
  'utf8'
);

test('admin dashboard reuses report APIs and report components', () => {
  assert.match(source, /reportApi\.getRevenueReport\(\)/);
  assert.match(source, /reportApi\.getOrderSummaryReport\(\)/);
  assert.match(source, /<RevenueSummaryCard/);
  assert.match(source, /<OrderSummaryCards/);
  assert.match(source, /<Alert/);
  assert.match(source, /actionLabel="Retry"/);
});

test('admin dashboard links to reports without unsupported UI or calculations', () => {
  assert.match(source, /navigate\('\/admin\/reports'\)/);
  assert.match(source, /label="View reports"/);
  assert.doesNotMatch(source, /chart/i);
  assert.doesNotMatch(source, /reduce\(/);
  assert.doesNotMatch(source, /<div\b/);
  assert.doesNotMatch(source, /fetch\(|supabase|API_BASE_URL/);
});

test('admin dashboard uses Astryx stack props for responsive header layout', () => {
  assert.match(
    source,
    /<HStack\s+gap=\{4\}\s+align="center"\s+justify="between"\s+wrap="wrap"\s+width="100%"/
  );
  assert.match(source, /<HStack gap=\{2\} wrap="wrap">/);
  assert.doesNotMatch(source, /style=\{\{/);
});
