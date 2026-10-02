const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  CHECKOUT_FULL_NAME_MESSAGE,
  validateCheckoutFullName,
} = require('./checkoutValidation');

test('checkout full-name validation accepts trimmed 10–50 character names', () => {
  assert.equal(validateCheckoutFullName('  Nguyễn Văn An  '), null);
  assert.equal(validateCheckoutFullName('x'.repeat(10)), null);
  assert.equal(validateCheckoutFullName('x'.repeat(50)), null);
});

test('checkout full-name validation rejects names outside the trimmed boundaries', () => {
  for (const value of ['', '   ', 'x'.repeat(9), ` ${'x'.repeat(51)} `, null, undefined, 123]) {
    assert.equal(validateCheckoutFullName(value), CHECKOUT_FULL_NAME_MESSAGE);
  }
});
