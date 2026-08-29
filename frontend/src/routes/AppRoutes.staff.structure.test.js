import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./AppRoutes.jsx', import.meta.url), 'utf8');

test('app routes declare StaffRoute with capability guard and mount staff views', () => {
  assert.match(source, /import StaffLayout from '\.\.\/layouts\/StaffLayout';/);
  assert.match(source, /import StaffDashboardView from '\.\.\/views\/staff\/StaffDashboardView';/);
  assert.match(source, /import StaffOrderView from '\.\.\/views\/staff\/StaffOrderView';/);
  assert.match(source, /import StaffInventoryView from '\.\.\/views\/staff\/StaffInventoryView';/);
  assert.match(source, /import StaffReviewView from '\.\.\/views\/staff\/StaffReviewView';/);
  assert.match(source, /import StaffReportView from '\.\.\/views\/staff\/StaffReportView';/);

  assert.match(source, /export const StaffRoute = \(\) =>/);
  assert.match(source, /hasPermission\(PERMISSIONS\.ORDERS_VIEW_ALL\)/);

  assert.match(source, /<Route element=\{<StaffRoute \/>\}>/);
  assert.match(source, /<Route path="\/staff" element=\{<StaffDashboardView \/>\} \/>/);
  assert.match(source, /<Route path="\/staff\/orders" element=\{<StaffOrderView \/>\} \/>/);
  assert.match(source, /<Route path="\/staff\/inventory" element=\{<StaffInventoryView \/>\} \/>/);
  assert.match(source, /<Route path="\/staff\/reviews" element=\{<StaffReviewView \/>\} \/>/);
  assert.match(source, /<Route path="\/staff\/reports" element=\{<StaffReportView \/>\} \/>/);
});
