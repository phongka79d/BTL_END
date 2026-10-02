import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CHECKOUT_FULL_NAME_MESSAGE,
  validateCheckoutFullName
} from './checkoutValidation.js';

test('checkout full name trims whitespace and accepts inclusive length boundaries', () => {
  assert.equal(validateCheckoutFullName(`  ${'A'.repeat(10)}  `), null);
  assert.equal(validateCheckoutFullName('A'.repeat(50)), null);
});

test('checkout full name rejects trimmed values below or above the allowed range', () => {
  assert.equal(validateCheckoutFullName(` ${'A'.repeat(9)} `), CHECKOUT_FULL_NAME_MESSAGE);
  assert.equal(validateCheckoutFullName('A'.repeat(51)), CHECKOUT_FULL_NAME_MESSAGE);
  assert.equal(validateCheckoutFullName('          '), CHECKOUT_FULL_NAME_MESSAGE);
});

test('checkout full name rejects non-string values without coercion', () => {
  [null, undefined, 1234567890, {}].forEach((value) => {
    assert.equal(validateCheckoutFullName(value), CHECKOUT_FULL_NAME_MESSAGE);
  });
});
