import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const loadingSource = readFileSync(
  new URL('./Loading.jsx', import.meta.url),
  'utf8'
);

const productCardSource = readFileSync(
  new URL('../product/ProductCard.jsx', import.meta.url),
  'utf8'
);

test('catalog card media and loading preview use rectangular corners', () => {
  assert.match(
    loadingSource,
    /borderRadius:\s*'var\(--radius-none\)'/,
    'loading preview container should be rectangular'
  );
  assert.match(
    loadingSource,
    /<Skeleton width="100%" height="100%" radius="none" \/>/,
    'large loading preview skeleton should not use rounded corners'
  );
  assert.match(
    productCardSource,
    /--_card-radius':\s*'var\(--radius-none\)'/,
    'product card shell should be rectangular'
  );
  assert.match(
    productCardSource,
    /borderRadius:\s*'var\(--radius-none\)'/,
    'product image media frame should be rectangular'
  );
});
