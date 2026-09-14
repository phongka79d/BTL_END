import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./FeaturedProductManager.jsx', import.meta.url), 'utf8');

test('FeaturedProductManager uses Astryx controls and bulk picker for admin-selected homepage products', () => {
  assert.match(source, /import FeaturedProductBulkPicker from '\.\/FeaturedProductBulkPicker';/);
  assert.match(source, /import AdminTable from '\.\.\/AdminTable';/);
  assert.match(source, /NumberInput/);
  assert.match(source, /label="Số lượng sản phẩm nổi bật"/);
  assert.match(source, /<FeaturedProductBulkPicker/);
  assert.match(source, /onSaveSettings/);
  assert.match(source, /onCreateFeaturedProductsBulk/);
  assert.match(source, /onReorderFeaturedProducts/);
  assert.match(source, /onDeleteFeaturedProduct/);
  assert.match(source, /onToggleFeaturedProduct/);
});

test('FeaturedProductManager move actions reorder the full featured product list', () => {
  assert.match(source, /const moveFeaturedProduct = useCallback\(\(item, direction\) => \{/);
  assert.match(source, /const nextProducts = \[\.\.\.featuredProducts\];/);
  assert.match(source, /onReorderFeaturedProducts\(nextProducts\.map\(\(product\) => product\.id\)\)/);
  assert.match(source, /onClick: \(\) => moveFeaturedProduct\(item, 'up'\)/);
  assert.match(source, /onClick: \(\) => moveFeaturedProduct\(item, 'down'\)/);
});
