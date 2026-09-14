import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./HomeAllProductsSection.jsx', import.meta.url), 'utf8');

test('HomeAllProductsSection renders all products with four Astryx sort buttons and ProductList pagination', () => {
  assert.match(source, /import \{[\s\S]*Button,[\s\S]*HStack,[\s\S]*VStack/);
  assert.match(source, /import ProductList from '\.\.\/product\/ProductList';/);
  assert.match(source, /title="Tất cả sản phẩm"/);
  assert.match(source, /label: 'Mặc định'/);
  assert.match(source, /label: 'Giá'/);
  assert.match(source, /label: 'Đánh giá tốt'/);
  assert.match(source, /label: 'Số đơn hàng'/);
  assert.match(source, /sortOptions\.map/);
  assert.match(source, /onSortChange\(option\.value\)/);
  assert.match(source, /<ProductList/);
  assert.match(source, /products=\{products\}/);
  assert.match(source, /pagination=\{pagination\}/);
  assert.match(source, /onPageChange=\{onPageChange\}/);
  assert.doesNotMatch(source, /HomeProductTile/);
  assert.doesNotMatch(source, /label="Load more"/);
});
