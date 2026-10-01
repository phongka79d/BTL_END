import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FALLBACK_PRODUCT_IMAGE,
  getProductImageSrc,
  handleProductImageError
} from './productUtils.js';

const createImageElement = (src) => {
  let currentSrc = src;
  let srcWriteCount = 0;

  return {
    get src() {
      return currentSrc;
    },
    set src(value) {
      currentSrc = value;
      srcWriteCount += 1;
    },
    getAttribute(name) {
      return name === 'src' ? currentSrc : null;
    },
    get srcWriteCount() {
      return srcWriteCount;
    }
  };
};

test('image source trims configured urls and falls back for missing or blank ones', () => {
  assert.equal(
    getProductImageSrc('  https://cdn.example.com/product.webp  '),
    'https://cdn.example.com/product.webp'
  );
  assert.equal(getProductImageSrc(''), FALLBACK_PRODUCT_IMAGE);
  assert.equal(getProductImageSrc('   '), FALLBACK_PRODUCT_IMAGE);
  assert.equal(getProductImageSrc(null), FALLBACK_PRODUCT_IMAGE);
  assert.equal(getProductImageSrc(undefined), FALLBACK_PRODUCT_IMAGE);
});

test('image error replaces a broken source once and never rewrites the fallback', () => {
  const imageElement = createImageElement('https://cdn.example.com/broken-product.webp');

  handleProductImageError({ currentTarget: imageElement });

  assert.equal(imageElement.src, FALLBACK_PRODUCT_IMAGE);
  assert.equal(imageElement.srcWriteCount, 1);

  handleProductImageError({ currentTarget: imageElement });
  handleProductImageError({ currentTarget: imageElement });

  assert.equal(imageElement.src, FALLBACK_PRODUCT_IMAGE);
  assert.equal(imageElement.srcWriteCount, 1);
});

test('image error ignores events without an image target or already on the fallback', () => {
  assert.doesNotThrow(() => handleProductImageError(undefined));
  assert.doesNotThrow(() => handleProductImageError({ currentTarget: null }));

  const fallbackElement = createImageElement(FALLBACK_PRODUCT_IMAGE);

  handleProductImageError({ currentTarget: fallbackElement });

  assert.equal(fallbackElement.srcWriteCount, 0);
});
