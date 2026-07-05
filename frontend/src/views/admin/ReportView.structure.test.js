import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./ReportView.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../../layouts/AdminLayout.jsx', import.meta.url), 'utf8');

test('ReportView loads and presents all three report surfaces', () => {
  assert.match(viewSource, /<Heading level=\{1\}>Reports<\/Heading>/);
  assert.match(viewSource, /Revenue, best-selling products, and order summaries/);
  assert.match(viewSource, /reportApi\.getRevenueReport\(\)/);
  assert.match(viewSource, /reportApi\.getBestSellingProductsReport\(\)/);
  assert.match(viewSource, /reportApi\.getOrderSummaryReport\(\)/);
  assert.match(viewSource, /<RevenueSummaryCard/);
  assert.match(viewSource, /<BestSellingProductsTable/);
  assert.match(viewSource, /<OrderSummaryCards/);
  assert.match(viewSource, /<Alert/);
  assert.match(viewSource, /actionLabel="Retry"/);
  assert.doesNotMatch(viewSource, /<div\b/);
});

test('admin reports route is registered inside the protected admin layout', () => {
  assert.match(routesSource, /import ReportView from '\.\.\/views\/admin\/ReportView';/);
  assert.match(
    routesSource,
    /<Route element=\{<AdminRoute \/>\}>[\s\S]*?<Route element=\{<AdminLayout \/>\}>[\s\S]*?<Route path="\/admin\/reports" element=\{<ReportView \/>\} \/>/
  );
});

test('admin navigation retains the reports link', () => {
  assert.match(layoutSource, /label="Reports"/);
  assert.match(layoutSource, /href="\/admin\/reports"/);
  assert.match(layoutSource, /isSelected=\{location\.pathname\.startsWith\('\/admin\/reports'\)\}/);
});
