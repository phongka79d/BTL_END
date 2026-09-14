import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readComponent = (name) =>
  readFileSync(new URL(`./${name}.jsx`, import.meta.url), 'utf8');

test('RevenueSummaryCard uses Astryx cards and the shared currency formatter', () => {
  const source = readComponent('RevenueSummaryCard');

  assert.match(source, /Card/);
  assert.match(source, /Skeleton/);
  assert.match(source, /formatPrice\(totalRevenue\)/);
  assert.match(source, /Đơn hàng hoàn tất/);
  assert.doesNotMatch(source, /<div\b/);
});

test('BestSellingProductsTable reuses AdminTable with meaningful columns', () => {
  const source = readComponent('BestSellingProductsTable');

  for (const header of ['Sản phẩm', 'Thương hiệu', 'Số lượng đã bán', 'Doanh thu']) {
    assert.match(source, new RegExp(`header: '${header}'`));
  }

  assert.match(source, /<AdminTable/);
  assert.match(source, /formatPrice\(product\.revenue\)/);
  assert.match(source, /emptyTitle="No sales data yet"/);
  assert.doesNotMatch(source, /<div\b/);
});

test('OrderSummaryCards uses shared statuses and semantic badges', () => {
  const source = readComponent('OrderSummaryCards');

  assert.match(source, /ORDER_STATUS_VALUES/);
  assert.match(source, /ORDER_STATUS_LABELS/);
  assert.match(source, /<OrderStatusBadge status=\{status\} \/>/);
  assert.match(source, /Skeleton/);
  assert.doesNotMatch(source, /<div\b/);
});
