import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./OrderDetailView.jsx', import.meta.url), 'utf8');

test('order detail success state renders one back-to-orders action', () => {
  const successMarker = '/* ---------- Thành công ---------- */';
  assert.ok(source.includes(successMarker), 'success section marker is missing');

  const successState = source.slice(source.indexOf(successMarker));
  const ghostBackButtons = successState.match(/label="← Quay lại đơn hàng"[\s\S]*?variant="ghost"/g) || [];

  assert.equal(ghostBackButtons.length, 1);

  const afterPanel = successState.slice(successState.indexOf('<OrderDetailPanel order={order} />'));
  assert.doesNotMatch(afterPanel, /label="← Quay lại đơn hàng"/);
});

test('order detail exposes a guarded customer cancel action', () => {
  assert.match(source, /orderApi\.cancelOrder\(order\.id\)/);
  assert.match(source, /isCustomerCancellable\(order\.status\)/);
  assert.match(source, /<ConfirmationDialog[\s\S]*?onConfirm=\{handleCancelOrder\}/);
  assert.match(source, /variant="destructive"/);
});
