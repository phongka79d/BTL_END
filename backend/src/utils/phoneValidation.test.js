const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  PHONE_LENGTH_MESSAGE,
  PHONE_REQUIRED_MESSAGE,
  PHONE_VALIDATION_MESSAGE,
  validatePhone,
} = require('./phoneValidation');

test('phone validation preserves optional-empty and digit-string semantics', () => {
  for (const value of ['', null, undefined]) {
    assert.equal(validatePhone(value), null);
  }

  for (const value of ['012345678', '0123456789', '01234567890', '01234567891']) {
    assert.equal(validatePhone(value), null);
  }
});

test('phone validation rejects lengths outside 9–11 digits', () => {
  assert.equal(validatePhone('12345678'), PHONE_LENGTH_MESSAGE);
  assert.equal(validatePhone('123456789012'), PHONE_LENGTH_MESSAGE);
});

test('phone validation rejects non-digit characters and non-string values', () => {
  for (const value of [
    '0987abc',
    '09-1234567',
    '09 1234567',
    ' 0987654321',
    '0987654321 ',
    '+84987654321',
    987654321,
    0,
    NaN,
  ]) {
    assert.equal(validatePhone(value), PHONE_VALIDATION_MESSAGE);
  }
});

test('required phone validation rejects empty values with the existing message', () => {
  for (const value of ['', null, undefined]) {
    assert.equal(validatePhone(value, { required: true }), PHONE_REQUIRED_MESSAGE);
  }
  assert.equal(validatePhone('0987654321', { required: true }), null);
});
