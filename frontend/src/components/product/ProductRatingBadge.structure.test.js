import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./ProductRatingBadge.jsx', import.meta.url),
  'utf8'
);

const homeShowcaseSource = readFileSync(
  new URL('../home/HomeCategoryShowcase.jsx', import.meta.url),
  'utf8'
);

const productCardSource = readFileSync(
  new URL('./ProductCard.jsx', import.meta.url),
  'utf8'
);

test('ProductRatingBadge uses Astryx Badge and hides products without visible reviews', () => {
  assert.match(source, /import \{ Badge \} from '@astryxdesign\/core';/);
  assert.match(source, /reviewSummary/);
  assert.match(source, /reviewCount <= 0/);
  assert.match(source, /return null;/);
  assert.match(source, /averageRating\.toFixed\(1\)/);
  assert.match(source, /<Badge\s+variant="yellow"\s+label=\{ratingLabel\}/);
});

test('home and catalog product cards share the product rating badge', () => {
  assert.match(homeShowcaseSource, /import ProductRatingBadge from '\.\.\/product\/ProductRatingBadge';/);
  assert.match(homeShowcaseSource, /<ProductRatingBadge product=\{product\} \/>/);
  assert.match(productCardSource, /import ProductRatingBadge from '\.\/ProductRatingBadge';/);
  assert.match(productCardSource, /<ProductRatingBadge product=\{product\} \/>/);
});
