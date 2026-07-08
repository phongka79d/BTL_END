const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/storefrontContent.controller.js', 'utf8');

test('storefront controller exposes public and admin featured product actions', () => {
  assert.match(source, /const getPublicFeaturedProducts = async \(req, res, next\) => \{/);
  assert.match(source, /storefrontContentModel\.findPublicFeaturedProducts\(\)/);
  assert.match(source, /const listAdminFeaturedProducts = async \(req, res, next\) => \{/);
  assert.match(source, /storefrontContentModel\.findAdminFeaturedProducts\(\)/);
  assert.match(source, /const updateAdminStorefrontSettings = async \(req, res, next\) => \{/);
  assert.match(source, /storefrontContentModel\.updateStorefrontSettings\(req\.body\)/);
});
