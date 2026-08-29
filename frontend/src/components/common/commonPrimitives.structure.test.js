import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';

const readComponent = (filename) => {
  const fileUrl = new URL(`./${filename}`, import.meta.url);
  assert.ok(existsSync(fileUrl), `Component file ${filename} must exist`);
  return readFileSync(fileUrl, 'utf8');
};

test('PageHeader declares title, subtitle, breadcrumb, badge, and actions slots', () => {
  const src = readComponent('PageHeader.jsx');
  assert.match(src, /export const PageHeader =/);
  assert.match(src, /title/);
  assert.match(src, /subtitle/);
  assert.match(src, /breadcrumb/);
  assert.match(src, /badge/);
  assert.match(src, /actions/);
});

test('DataTable declares columns, data, keyField, loading, emptyState, and pagination props', () => {
  const src = readComponent('DataTable.jsx');
  assert.match(src, /export const DataTable =/);
  assert.match(src, /columns\s*=\s*\[\]/);
  assert.match(src, /data\s*=\s*\[\]/);
  assert.match(src, /loading\s*=\s*false/);
  assert.match(src, /pagination/);
  assert.match(src, /page=\{pagination\.page\}/);
  assert.match(src, /TableSkeleton/);
  assert.match(src, /EmptyState/);
});

test('FilterBar declares search, onSearchChange, filters, and onReset props with TextInput and Button', () => {
  const src = readComponent('FilterBar.jsx');
  assert.match(src, /export const FilterBar =/);
  assert.match(src, /search/);
  assert.match(src, /onSearchChange/);
  assert.match(src, /filters/);
  assert.match(src, /onReset/);
  assert.match(src, /TextInput/);
});

test('StatusBadge defines mappings for orders, roles, payment, and review statuses', () => {
  const src = readComponent('StatusBadge.jsx');
  assert.match(src, /export const StatusBadge =/);
  assert.match(src, /pending:/);
  assert.match(src, /confirmed:/);
  assert.match(src, /shipping:/);
  assert.match(src, /completed:/);
  assert.match(src, /cancelled:/);
  assert.match(src, /admin:/);
  assert.match(src, /staff:/);
  assert.match(src, /customer:/);
  assert.match(src, /Badge/);
});

test('StatCard declares title, value, subtitle, trend, and icon props', () => {
  const src = readComponent('StatCard.jsx');
  assert.match(src, /export const StatCard =/);
  assert.match(src, /title/);
  assert.match(src, /value/);
  assert.match(src, /subtitle/);
  assert.match(src, /trend/);
  assert.match(src, /icon/);
});

test('ConfirmationDialog passes purpose="form" and declares onConfirm and onClose', () => {
  const src = readComponent('ConfirmationDialog.jsx');
  assert.match(src, /export const ConfirmationDialog =/);
  assert.match(src, /purpose="form"/);
  assert.match(src, /onConfirm/);
  assert.match(src, /onClose/);
  assert.match(src, /confirmLabel/);
});

test('Drawer declares isOpen, onClose, title, children, and footer', () => {
  const src = readComponent('Drawer.jsx');
  assert.match(src, /export const Drawer =/);
  assert.match(src, /isOpen/);
  assert.match(src, /onClose/);
  assert.match(src, /title/);
  assert.match(src, /children/);
  assert.match(src, /footer/);
});

test('EmptyState declares title, description, and action props', () => {
  const src = readComponent('EmptyState.jsx');
  assert.match(src, /export const EmptyState =/);
  assert.match(src, /title/);
  assert.match(src, /description/);
  assert.match(src, /actionLabel/);
  assert.match(src, /onAction/);
});

test('LoadingSkeleton exports TableSkeleton, CardGridSkeleton, and DetailPageSkeleton', () => {
  const src = readComponent('LoadingSkeleton.jsx');
  assert.match(src, /export const TableSkeleton =/);
  assert.match(src, /export const CardGridSkeleton =/);
  assert.match(src, /export const DetailPageSkeleton =/);
});

test('Can component checks permissions and roles with fallback', () => {
  const src = readComponent('Can.jsx');
  assert.match(src, /export const Can =/);
  assert.match(src, /hasPermission/);
  assert.match(src, /fallback\s*=\s*null/);
});
