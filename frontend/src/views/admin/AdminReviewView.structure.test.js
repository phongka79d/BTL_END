import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./AdminReviewView.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');

test('AdminReviewView searches products on demand, loads visible reviews, and hides selected reviews', () => {
  assert.match(viewSource, /import \{ useNavigate \} from 'react-router-dom';/);
  assert.match(viewSource, /import ProductPicker from '\.\.\/\.\.\/components\/admin\/ProductPicker';/);
  assert.match(viewSource, /import \{ reviewApi \} from '\.\.\/\.\.\/api\/reviewApi';/);
  assert.match(viewSource, /const navigate = useNavigate\(\);/);
  assert.doesNotMatch(viewSource, /import \{ productApi \}/);
  assert.doesNotMatch(viewSource, /productApi\.getProducts\(\)/);
  assert.doesNotMatch(viewSource, /const getProductsFromResponse/);
  assert.match(viewSource, /<ProductPicker[\s\S]*showInitialProducts[\s\S]*pageSize=\{10\}[\s\S]*value=\{selectedProductId \|\| undefined\}[\s\S]*onChange=\{handleProductChange\}/);
  assert.match(viewSource, /reviewApi\.getProductReviews\(productId\)/);
  assert.match(viewSource, /const loadReviews = useCallback\(async \(productId\) =>/);
  assert.match(viewSource, /}, \[\]\);/);
  assert.match(viewSource, /reviewApi\.hideReview\(target\.id\)/);
  assert.match(viewSource, /setIsHiding\(true\)/);
  assert.match(viewSource, /setReviews\(\(currentReviews\)\s*=>\s*currentReviews\.filter\(\(review\)\s*=>\s*review\.id !== target\.id\)\)/);
  assert.match(viewSource, /key=\{reviews\.map\(\(review\)\s*=>\s*review\.id\)\.join\(':',?\)\}/);
});

test('AdminReviewView provides admin review moderation states and action UI', () => {
  assert.match(viewSource, /Manage Reviews/);
  assert.match(viewSource, /Product reviews/);
  assert.match(viewSource, /Select a product to moderate its visible reviews\./);
  assert.match(viewSource, /label="View product"[\s\S]*navigate\(`\/products\/\$\{selectedProductId\}`\)/);
  assert.match(viewSource, /Hide review/);
  assert.match(viewSource, /Unable to load reviews/);
  assert.match(viewSource, /No visible reviews/);
  assert.match(viewSource, /Review hidden/);
  assert.match(viewSource, /AdminTable/);
  assert.match(viewSource, /AlertDialog/);
});

test('admin review route is registered behind the admin layout', () => {
  assert.match(routesSource, /import AdminReviewView from '\.\.\/views\/admin\/AdminReviewView';/);
  assert.match(routesSource, /<Route path="\/admin\/reviews" element=\{<AdminReviewView \/>\} \/>/);
});
