import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./FeaturedProductManager.jsx', import.meta.url), 'utf8');

test('FeaturedProductManager uses Astryx controls and ProductPicker for admin-selected homepage products', () => {
  assert.match(source, /import ProductPicker from '\.\.\/ProductPicker';/);
  assert.match(source, /import AdminTable from '\.\.\/AdminTable';/);
  assert.match(source, /NumberInput/);
  assert.match(source, /label="Featured product count"/);
  assert.match(source, /<ProductPicker/);
  assert.match(source, /onSaveSettings/);
  assert.match(source, /onCreateFeaturedProduct/);
  assert.match(source, /onUpdateFeaturedProduct/);
  assert.match(source, /onDeleteFeaturedProduct/);
  assert.match(source, /onToggleFeaturedProduct/);
});
