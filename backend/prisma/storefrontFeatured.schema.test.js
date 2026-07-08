const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const schema = readFileSync(__dirname + '/schema.prisma', 'utf8');

test('schema supports admin-managed homepage featured products and limit setting', () => {
  assert.match(schema, /model StorefrontSetting \{/);
  assert.match(schema, /featuredProductLimit\s+Int\s+@default\(6\)\s+@map\("featured_product_limit"\)/);
  assert.match(schema, /model StorefrontFeaturedProduct \{/);
  assert.match(schema, /productId\s+String\s+@unique\s+@map\("product_id"\)/);
  assert.match(schema, /sortOrder\s+Int\s+@default\(0\)\s+@map\("sort_order"\)/);
  assert.match(schema, /isActive\s+Boolean\s+@default\(true\)\s+@map\("is_active"\)/);
  assert.match(schema, /@@index\(\[isActive, sortOrder\]\)/);
});
