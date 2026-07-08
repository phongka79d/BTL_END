const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/product.controller.js', 'utf8');

test('product controller forwards storefront sort query to product model', () => {
  assert.match(source, /const \{ keyword, categoryId, minPrice, maxPrice, page, limit, sort \} = req\.query;/);
  assert.match(source, /sort/);
});
