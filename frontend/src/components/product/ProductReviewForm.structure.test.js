import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./ProductReviewForm.jsx', import.meta.url),
  'utf8'
);

test('product review form captures rating and optional comment with local validation', () => {
  assert.match(source, /export const ProductReviewForm = \(\{/);
  assert.match(source, /onSubmit/);
  assert.match(source, /useState\(5\)/);
  assert.match(source, /useState\(''\)/);
  assert.match(source, /validateRating/);
  assert.match(source, /Rating/);
  assert.match(source, /Comment/);
  assert.match(source, /<NumberInput/);
  assert.match(source, /min=\{1\}/);
  assert.match(source, /max=\{5\}/);
  assert.match(source, /isIntegerOnly/);
  assert.match(source, /<TextArea/);
  assert.match(source, /isOptional/);
  assert.match(source, /isLoading=\{isSubmitting || isSubmitPending\}/);
});

test('product review form handles error and success feedback without data access', () => {
  assert.match(source, /useNotification\(\)/);
  assert.match(source, /notification\.error\(\{/);
  assert.match(source, /notification\.success\(\{/);
  assert.doesNotMatch(source, /<Banner/);
  assert.match(source, /comment\.trim\(\)/);
  assert.equal(source.includes('reviewApi'), false);
  assert.equal(source.includes('apiClient'), false);
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('localStorage'), false);
  assert.equal(source.includes('DATABASE_URL'), false);
  assert.equal(source.includes('Prisma'), false);
  assert.equal(source.includes('supabase'), false);
});
