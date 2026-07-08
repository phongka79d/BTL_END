import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./reviewApi.js', import.meta.url), 'utf8');

test('review API helper uses apiClient for customer review list and create calls', () => {
  assert.match(source, /import \{ apiClient \} from '\.\/apiClient'/);
  assert.match(source, /export const reviewApi = \{/);
  assert.match(source, /getProductReviews:\s*\(productId\)\s*=>\s*apiClient\.get\(`\/products\/\$\{productId\}\/reviews`\)/);
  assert.match(source, /createProductReview:\s*\(productId,\s*payload\)\s*=>\s*apiClient\.post\(`\/products\/\$\{productId\}\/reviews`,\s*payload\)/);
});

test('review API helper exposes admin hide action through apiClient', () => {
  assert.match(source, /getAdminReviews:\s*\(filters = \{\}\)\s*=>\s*apiClient\.get\(`\/admin\/reviews\$\{buildReviewQuery\(filters\)\}`\)/);
  assert.match(source, /hideReview:\s*\(reviewId\)\s*=>\s*apiClient\.delete\(`\/admin\/reviews\/\$\{reviewId\}`\)/);
});
