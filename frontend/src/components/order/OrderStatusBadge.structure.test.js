import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./OrderStatusBadge.jsx', import.meta.url),
  'utf8'
);

test('cancelled orders use the installed semantic error badge variant', () => {
  assert.match(source, /cancelled: 'error'/);
  assert.doesNotMatch(source, /cancelled: 'danger'/);
});
