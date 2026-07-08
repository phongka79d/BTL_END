import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./ProductPicker.jsx', import.meta.url), 'utf8');

test('ProductPicker searches products on demand instead of receiving a full product list', () => {
  assert.match(source, /import \{ productApi \} from '\.\.\/\.\.\/api\/productApi';/);
  assert.match(source, /import Pagination from '\.\.\/common\/Pagination';/);
  assert.match(source, /productApi\.getProducts\(\{ keyword: searchKeyword, page: productPage, limit: pageSize \}\)/);
  assert.match(source, /productApi\.getProductById\(value\)/);
  assert.match(source, /window\.setTimeout/);
  assert.match(source, /300/);
  assert.match(source, /const shouldFetchProducts = showInitialProducts \|\| searchKeyword\.length >= 2;/);
  assert.doesNotMatch(source, /products\s*=/);
});

test('ProductPicker can show paginated products immediately for review moderation', () => {
  assert.match(source, /showInitialProducts = false/);
  assert.match(source, /pageSize = 20/);
  assert.match(source, /const \[productPage, setProductPage\] = useState\(1\);/);
  assert.match(source, /setPagination\(response\?\.data\?\.pagination \|\| \{/);
  assert.match(source, /<Pagination[\s\S]*page=\{pagination\.page\}[\s\S]*totalPages=\{pagination\.totalPages\}[\s\S]*onPageChange=\{setProductPage\}/);
});

test('ProductPicker presents searchable result context for admin selection', () => {
  assert.match(source, /label="Search products"/);
  assert.match(source, /product\.brand/);
  assert.match(source, /product\.category\?\.name/);
  assert.match(source, /formatPrice\(product\.price\)/);
  assert.match(source, /Stock/);
  assert.match(source, /onChange\(product\.id\)/);
});
