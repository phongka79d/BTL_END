const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/storefrontContent.routes.js', 'utf8');

test('storefront routes include featured products and protected admin settings', () => {
  assert.match(source, /storefrontContentPublicRouter\.get\('\/featured-products', controller\.getPublicFeaturedProducts\);/);
  assert.match(source, /storefrontContentAdminRouter\.get\('\/featured-products',\s*protect,\s*requirePermission\(PERMISSIONS\.STOREFRONT_MANAGE\),\s*controller\.listAdminFeaturedProducts\);/);
  assert.match(source, /storefrontContentAdminRouter\.post\('\/featured-products',\s*protect,\s*requirePermission\(PERMISSIONS\.STOREFRONT_MANAGE\),\s*controller\.createAdminFeaturedProduct\);/);
  assert.match(source, /storefrontContentAdminRouter\.post\('\/featured-products\/bulk',\s*protect,\s*requirePermission\(PERMISSIONS\.STOREFRONT_MANAGE\),\s*controller\.createAdminFeaturedProductsBulk\);/);
  assert.match(source, /storefrontContentAdminRouter\.put\('\/featured-products\/reorder',\s*protect,\s*requirePermission\(PERMISSIONS\.STOREFRONT_MANAGE\),\s*controller\.reorderAdminFeaturedProducts\);/);
  assert.match(source, /storefrontContentAdminRouter\.put\('\/featured-products\/:id',\s*protect,\s*requirePermission\(PERMISSIONS\.STOREFRONT_MANAGE\),\s*controller\.updateAdminFeaturedProduct\);/);
  assert.match(source, /storefrontContentAdminRouter\.delete\('\/featured-products\/:id',\s*protect,\s*requirePermission\(PERMISSIONS\.STOREFRONT_MANAGE\),\s*controller\.deleteAdminFeaturedProduct\);/);
  assert.match(source, /storefrontContentAdminRouter\.put\('\/settings',\s*protect,\s*requirePermission\(PERMISSIONS\.STOREFRONT_MANAGE\),\s*controller\.updateAdminStorefrontSettings\);/);
});
