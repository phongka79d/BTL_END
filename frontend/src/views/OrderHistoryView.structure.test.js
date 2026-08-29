import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./OrderHistoryView.jsx', import.meta.url), 'utf8');

test('OrderHistoryView integrates PageHeader, DataTable, StatusBadge, and EmptyState', () => {
  assert.match(source, /import PageHeader from '\.\.\/components\/common\/PageHeader';/);
  assert.match(source, /import DataTable from '\.\.\/components\/common\/DataTable';/);
  assert.match(source, /import StatusBadge from '\.\.\/components\/common\/StatusBadge';/);
  assert.match(source, /import EmptyState from '\.\.\/components\/common\/EmptyState';/);

  // Checks PageHeader usage
  assert.match(source, /<PageHeader/);
  assert.match(source, /title="Đơn hàng của tôi"/);

  // Checks DataTable usage with props
  assert.match(source, /<DataTable/);
  assert.match(source, /columns=\{columns\}/);
  assert.match(source, /data=\{pagedOrders\}/);
  assert.match(source, /emptyState=\{/);
  assert.match(source, /pagination=\{/);

  // Checks EmptyState usage
  assert.match(source, /actionLabel="Khám phá sản phẩm"/);
  assert.match(source, /onAction=\{\(\) => navigate\('\/products'\)\}/);
});
