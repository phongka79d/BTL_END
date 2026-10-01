const assert = require('node:assert/strict');
const test = require('node:test');

const { productsData } = require('./seedProducts');
const { verifySeedImageConfiguration } = require('./updateProductImages');

test('every catalog product has a valid model photo and source configuration', () => {
  const verification = verifySeedImageConfiguration(productsData);
  assert.deepEqual(verification.errors, []);
  assert.deepEqual(verification.missing, [], 'no seeded product is left with a generic placeholder');
});
