const assert = require('node:assert/strict');
const { test } = require('node:test');
const { validatePhone } = require('./phoneValidation');

const INVALID_PHONE_MESSAGE = 'Số điện thoại chỉ được chứa chữ số.';

test('phone validation allows optional empty values and preserves leading zeroes', () => {
  assert.equal(validatePhone(''), null);
  assert.equal(validatePhone(null), null);
  assert.equal(validatePhone(undefined), null);
  assert.equal(validatePhone('0987654321'), null);
});

test('phone validation rejects non-digit characters without trimming or coercion', () => {
  [
    '0987abc',
    '09-123',
    '09 123',
    ' 0987654321',
    '0987654321 ',
    '+84987654321',
    987654321,
    0,
    NaN,
  ].forEach((value) => {
    assert.equal(validatePhone(value), INVALID_PHONE_MESSAGE);
  });
});

test('required phone validation rejects empty values', () => {
  assert.equal(validatePhone('', { required: true }), 'Số điện thoại không được để trống.');
  assert.equal(validatePhone(null, { required: true }), 'Số điện thoại không được để trống.');
  assert.equal(validatePhone(undefined, { required: true }), 'Số điện thoại không được để trống.');
  assert.equal(validatePhone('0987654321', { required: true }), null);
});
