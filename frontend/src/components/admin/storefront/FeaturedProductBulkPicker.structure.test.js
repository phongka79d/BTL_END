import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./FeaturedProductBulkPicker.jsx', import.meta.url), 'utf8');
const managerSource = readFileSync(new URL('./FeaturedProductManager.jsx', import.meta.url), 'utf8');

test('FeaturedProductBulkPicker uses Astryx checkboxes to select multiple searched products', () => {
  assert.match(source, /import \{[\s\S]*CheckboxList,[\s\S]*CheckboxListItem,[\s\S]*TextInput/);
  assert.match(source, /productApi\.getProducts\(\{ keyword: searchKeyword, page: productPage, limit: pageSize \}\)/);
  assert.match(source, /const \[selectedProductIds, setSelectedProductIds\] = useState\(\[\]\);/);
  assert.match(source, /<CheckboxList[\s\S]*value=\{selectedProductIds\}[\s\S]*onChange=\{setSelectedProductIds\}/);
  assert.match(source, /<CheckboxListItem[\s\S]*value=\{product\.id\}/);
  assert.match(source, /onAddProducts\(\{ productIds: selectedProductIds \}\)/);
  assert.match(source, /label=\{`Add \$\{selectedProductIds\.length\} selected products`\}/);
});

test('FeaturedProductManager delegates adding to the bulk picker instead of manual sort order input', () => {
  assert.match(managerSource, /import FeaturedProductBulkPicker from '\.\/FeaturedProductBulkPicker';/);
  assert.match(managerSource, /<FeaturedProductBulkPicker/);
  assert.match(managerSource, /onAddProducts=\{onCreateFeaturedProductsBulk\}/);
  assert.doesNotMatch(managerSource, /label="Sort order"/);
});
