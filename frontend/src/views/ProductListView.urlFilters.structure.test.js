import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const productListViewSource = readFileSync(new URL('./ProductListView.jsx', import.meta.url), 'utf8');
const productFilterSource = readFileSync(
  new URL('../components/product/ProductFilter.jsx', import.meta.url),
  'utf8'
);

test('ProductListView drives product filters from URL search params', () => {
  assert.match(productListViewSource, /import \{ useSearchParams \} from 'react-router-dom';/);
  assert.match(productListViewSource, /const \[searchParams, setSearchParams\] = useSearchParams\(\);/);
  assert.match(productListViewSource, /searchParams\.get\('categoryId'\)/);
  assert.match(productListViewSource, /productApi\.getProducts\(toProductQuery\(appliedFilters, page\)\)/);
  assert.match(productListViewSource, /setSearchParams\(nextParams\)/);
});

test('ProductFilter renders category filters as links instead of a category selector', () => {
  assert.match(productFilterSource, /import \{ Link \} from 'react-router-dom';/);
  assert.match(productFilterSource, /toCategoryHref/);
  assert.match(productFilterSource, /<Link[\s\S]*to=\{toCategoryHref\(category\.id, filters\)\}/);
  assert.match(productFilterSource, /to=\{toCategoryHref\('', filters\)\}/);
  assert.doesNotMatch(productFilterSource, /label="Category"[\s\S]*<Selector/);
});

test('ProductFilter visibly indicates the selected category', () => {
  assert.match(productFilterSource, /aria-current=.*'page'/);
  assert.match(productFilterSource, /const SelectedIndicator/);
  assert.match(productFilterSource, /background: isActive \? 'var\(--color-accent\)' : 'transparent'/);
});

test('ProductFilter keeps both price inputs with one range slider below them', () => {
  assert.match(productFilterSource, /<NumberInput[\s\S]*label="Giá tối thiểu"/);
  assert.match(productFilterSource, /<NumberInput[\s\S]*label="Giá tối đa"/);
  assert.match(productFilterSource, /label="Điều chỉnh khoảng giá"/);
  assert.match(productFilterSource, /onChange=\{\(\[minPrice, maxPrice\]\)/);
});
