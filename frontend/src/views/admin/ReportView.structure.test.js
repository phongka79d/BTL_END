import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./ReportView.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../../layouts/AdminLayout.jsx', import.meta.url), 'utf8');

test('ReportView loads and presents all three report surfaces', () => {
  assert.match(viewSource, /<Heading level=\{1\}>Báo cáo<\/Heading>/);
  assert.match(viewSource, /reportApi\.getRevenueReport\(appliedRange\)/);
  assert.match(viewSource, /reportApi\.getBestSellingProductsReport\(appliedRange\)/);
  assert.match(viewSource, /reportApi\.getOrderSummaryReport\(appliedRange\)/);
  assert.match(viewSource, /<RevenueSummaryCard/);
  assert.match(viewSource, /<BestSellingProductsTable/);
  assert.match(viewSource, /<OrderSummaryCards/);
  assert.match(viewSource, /<Alert/);
  assert.match(viewSource, /actionLabel="Thử lại"/);
  assert.doesNotMatch(viewSource, /<div\b/);
});

test('ReportView filters by a date range and blocks a reversed range', () => {
  assert.match(viewSource, /const INVALID_RANGE_MESSAGE = 'Ngày bắt đầu không được sau ngày kết thúc';/);
  assert.match(viewSource, /type="date"/);
  assert.match(viewSource, /if \(startDate && endDate && startDate > endDate\) \{/);
  assert.match(viewSource, /setRangeError\(INVALID_RANGE_MESSAGE\)/);
  assert.match(viewSource, /setAppliedRange\(\{[\s\S]*?startDate: startDate \|\| undefined/);
  assert.match(viewSource, /const handleResetFilter = \(\) => \{/);
  assert.match(viewSource, /Không có dữ liệu để hiển thị/);
});

test('ReportView exports the displayed revenue and order figures as CSV', () => {
  assert.match(viewSource, /import \{ downloadCsv \} from '\.\.\/\.\.\/utils\/csvExport';/);
  assert.match(viewSource, /const handleExportRevenue = \(\) => \{/);
  assert.match(viewSource, /const handleExportOrderSummary = \(\) => \{/);
  assert.match(viewSource, /ORDER_STATUS_VALUES\.map/);
});

test('admin reports route is registered inside the protected admin layout', () => {
  assert.match(routesSource, /import ReportView from '\.\.\/views\/admin\/ReportView';/);
  assert.match(
    routesSource,
    /<Route element=\{<AdminRoute \/>\}>[\s\S]*?<Route element=\{<AdminLayout \/>\}>[\s\S]*?<Route path="\/admin\/reports" element=\{<ReportView \/>\} \/>/
  );
});

test('admin navigation retains the reports link', () => {
  assert.match(layoutSource, /label="Báo cáo"/);
  assert.match(layoutSource, /href="\/admin\/reports"/);
  assert.match(layoutSource, /isSelected=\{location\.pathname\.startsWith\('\/admin\/reports'\)\}/);
});
