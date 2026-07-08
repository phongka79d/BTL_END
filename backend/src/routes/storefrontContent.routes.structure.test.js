const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/storefrontContent.routes.js', 'utf8');

test('storefront routes include featured products and protected admin settings', () => {
  assert.match(source, /storefrontContentPublicRouter\.get\('\/featured-products', controller\.getPublicFeaturedProducts\);/);
  assert.match(source, /storefrontContentAdminRouter\.get\('\/featured-products', protect, admin, controller\.listAdminFeaturedProducts\);/);
  assert.match(source, /storefrontContentAdminRouter\.post\('\/featured-products', protect, admin, controller\.createAdminFeaturedProduct\);/);
  assert.match(source, /storefrontContentAdminRouter\.put\('\/featured-products\/:id', protect, admin, controller\.updateAdminFeaturedProduct\);/);
  assert.match(source, /storefrontContentAdminRouter\.delete\('\/featured-products\/:id', protect, admin, controller\.deleteAdminFeaturedProduct\);/);
  assert.match(source, /storefrontContentAdminRouter\.put\('\/settings', protect, admin, controller\.updateAdminStorefrontSettings\);/);
});
