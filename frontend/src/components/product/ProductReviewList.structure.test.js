import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./ProductReviewList.jsx', import.meta.url),
  'utf8'
);

test('product review list is presentation-only and covers review states', () => {
  assert.match(source, /export const ProductReviewList = \(\{/);
  assert.match(source, /reviews = \[\]/);
  assert.match(source, /isLoading = false/);
  assert.match(source, /error = null/);
  assert.match(source, /onRetry/);
  assert.match(source, /<EmptyState/);
  assert.match(source, /<Skeleton/);
  assert.match(source, /<Alert/);
  assert.match(source, /<List/);
  assert.match(source, /<ListItem/);
  assert.match(source, /<Avatar/);
  assert.match(source, /<Badge[^>]*label=\{formatRatingLabel/);
  assert.match(source, /<Timestamp/);
});

test('product review list does not own review data access', () => {
  assert.equal(source.includes('reviewApi'), false);
  assert.equal(source.includes('apiClient'), false);
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('localStorage'), false);
  assert.equal(source.includes('DATABASE_URL'), false);
  assert.equal(source.includes('Prisma'), false);
  assert.equal(source.includes('supabase'), false);
});
