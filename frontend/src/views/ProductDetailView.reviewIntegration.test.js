import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ProductDetailView.jsx', import.meta.url), 'utf8');

test('ProductDetailView wires customer review API and components', () => {
  assert.match(source, /import \{ reviewApi \} from '\.\.\/api\/reviewApi';/);
  assert.match(source, /import ProductReviewList from '\.\.\/components\/product\/ProductReviewList';/);
  assert.match(source, /import ProductReviewForm from '\.\.\/components\/product\/ProductReviewForm';/);
  assert.match(source, /reviewApi\.getProductReviews\(id\)/);
  assert.match(source, /reviewApi\.createProductReview\(product\.id,\s*payload\)/);
});

test('ProductDetailView renders review states and refreshes after submit', () => {
  assert.match(source, /const \{ isAuthenticated,\s*user \} = useAuth\(\);/);
  assert.match(source, /setReviews\(response\?\.data\s*\|\|\s*\[\]\)/);
  assert.match(source, /await loadReviews\(\);/);
  assert.match(source, /<ProductReviewList[\s\S]*reviews=\{reviews\}[\s\S]*isLoading=\{isReviewsLoading\}[\s\S]*error=\{reviewsError\}[\s\S]*onRetry=\{loadReviews\}/);
  assert.match(source, /<ProductReviewForm[\s\S]*onSubmit=\{handleReviewSubmit\}[\s\S]*isSubmitting=\{isReviewSubmitting\}/);
  assert.match(source, /Đăng nhập để viết đánh giá/);
});

test('ProductDetailView keeps review integration in the view layer only', () => {
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('localStorage'), false);
  assert.equal(source.includes('Prisma'), false);
  assert.equal(source.includes('DATABASE_URL'), false);
  assert.equal(source.includes('DIRECT_URL'), false);
  assert.equal(source.includes('supabase'), false);
});
