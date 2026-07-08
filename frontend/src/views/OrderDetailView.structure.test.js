import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./OrderDetailView.jsx', import.meta.url), 'utf8');

test('order detail success state renders one back-to-orders action', () => {
  const successState = source.slice(source.indexOf('/* ---------- Success ---------- */'));
  const ghostBackButtons = successState.match(/label=".*Back to orders"[\s\S]*?variant="ghost"/g) || [];

  assert.equal(ghostBackButtons.length, 1);

  const afterPanel = successState.slice(successState.indexOf('<OrderDetailPanel order={order} />'));
  assert.doesNotMatch(afterPanel, /label=".*Back to orders"/);
});
