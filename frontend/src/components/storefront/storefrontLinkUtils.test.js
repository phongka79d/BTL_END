import assert from 'node:assert/strict';
import test from 'node:test';
import {
  describeLinkTarget,
  resolveStorefrontHref,
} from './storefrontLinkUtils.js';

test('resolveStorefrontHref resolves product category and custom targets', () => {
  assert.equal(resolveStorefrontHref({ type: 'product', productId: 'p1' }), '/products/p1');
  assert.equal(resolveStorefrontHref({ type: 'category', categoryId: 'c1' }), '/products?categoryId=c1');
  assert.equal(resolveStorefrontHref({ type: 'customUrl', customUrl: '/sale' }), '/sale');
  assert.equal(resolveStorefrontHref({ type: 'customUrl', customUrl: 'https://example.com' }), 'https://example.com');
});

test('resolveStorefrontHref falls back to products for incomplete targets', () => {
  assert.equal(resolveStorefrontHref(null), '/products');
  assert.equal(resolveStorefrontHref({ type: 'product' }), '/products');
  assert.equal(resolveStorefrontHref({ type: 'category' }), '/products');
});

test('describeLinkTarget creates admin table copy', () => {
  assert.equal(describeLinkTarget({ type: 'product', productId: 'p1' }), 'Product p1');
  assert.equal(describeLinkTarget({ type: 'category', categoryId: 'c1' }), 'Category c1');
  assert.equal(describeLinkTarget({ type: 'customUrl', customUrl: '/sale' }), '/sale');
  assert.equal(describeLinkTarget(null), 'No link target');
});
