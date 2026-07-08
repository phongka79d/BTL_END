import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./HomeAllProductsSection.jsx', import.meta.url), 'utf8');

test('HomeAllProductsSection renders all products with four Astryx sort buttons', () => {
  assert.match(source, /import \{[\s\S]*Button,[\s\S]*HStack,[\s\S]*VStack/);
  assert.match(source, /title="All products"/);
  assert.match(source, /label: 'Default'/);
  assert.match(source, /label: 'Price'/);
  assert.match(source, /label: 'Good review'/);
  assert.match(source, /label: 'Order number'/);
  assert.match(source, /sortOptions\.map/);
  assert.match(source, /onSortChange\(option\.value\)/);
  assert.match(source, /<HomeProductTile key=\{product\.id\} product=\{product\} \/>/);
  assert.match(source, /label="Load more"/);
});
