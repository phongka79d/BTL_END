import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./AdminReviewView.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');

test('AdminReviewView loads all visible reviews by default and filters by selected product', () => {
  assert.match(viewSource, /import \{ useNavigate \} from 'react-router-dom';/);
  assert.match(viewSource, /import ProductPicker from '\.\.\/\.\.\/components\/admin\/ProductPicker';/);
  assert.match(viewSource, /import \{ reviewApi \} from '\.\.\/\.\.\/api\/reviewApi';/);
  assert.match(viewSource, /const navigate = useNavigate\(\);/);
  assert.doesNotMatch(viewSource, /import \{ productApi \}/);
  assert.doesNotMatch(viewSource, /productApi\.getProducts\(\)/);
  assert.doesNotMatch(viewSource, /const getProductsFromResponse/);
  assert.match(viewSource, /<ProductPicker[\s\S]*value=\{selectedProductId \|\| undefined\}[\s\S]*onChange=\{handleProductChange\}/);
  assert.doesNotMatch(viewSource, /showInitialProducts/);
  assert.doesNotMatch(viewSource, /pageSize=\{10\}/);
  assert.match(viewSource, /reviewApi\.getAdminReviews\(productId \? \{ productId \} : \{\}\)/);
  assert.match(viewSource, /const loadReviews = useCallback\(async \(productId = ''\) =>/);
  assert.match(viewSource, /useEffect\(\(\) => \{\s*loadReviews\(\);\s*\}, \[loadReviews\]\);/s);
  assert.match(viewSource, /reviewApi\.hideReview\(target\.id\)/);
  assert.match(viewSource, /setIsHiding\(true\)/);
  assert.match(viewSource, /setReviews\(\(currentReviews\)\s*=>\s*currentReviews\.filter\(\(review\)\s*=>\s*review\.id !== target\.id\)\)/);
  assert.match(viewSource, /key=\{reviews\.map\(\(review\)\s*=>\s*review\.id\)\.join\(':',?\)\}/);
});

test('AdminReviewView provides admin review moderation states and action UI', () => {
  assert.match(viewSource, /Quản lý đánh giá/);
  assert.match(viewSource, /label="Đánh giá sản phẩm"/);
  assert.match(viewSource, /Đang hiển thị tất cả đánh giá hiện có\. Tìm kiếm và chọn sản phẩm để lọc\./);
  assert.match(viewSource, /const productId = review\.productId \|\| review\.product\?\.id \|\| selectedProductId;/);
  assert.match(viewSource, /label="Xem sản phẩm"[\s\S]*navigate\(`\/products\/\$\{productId\}`\)/);
  assert.match(viewSource, /Ẩn đánh giá/);
  assert.match(viewSource, /Không thể tải đánh giá/);
  assert.match(viewSource, /Không có đánh giá hiển thị/);
  assert.match(viewSource, /Đã ẩn đánh giá/);
  assert.match(viewSource, /AdminTable/);
  assert.match(viewSource, /AlertDialog/);
});

test('admin review route is registered behind the admin layout', () => {
  assert.match(routesSource, /import AdminReviewView from '\.\.\/views\/admin\/AdminReviewView';/);
  assert.match(routesSource, /<Route path="\/admin\/reviews" element=\{<AdminReviewView \/>\} \/>/);
});
