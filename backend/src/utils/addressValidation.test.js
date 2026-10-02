const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  ADDRESS_DETAIL_REQUIRED_MESSAGE,
  ADDRESS_INVALID_MESSAGE,
  ADDRESS_PROVINCE_REQUIRED_MESSAGE,
  ADDRESS_WARD_REQUIRED_MESSAGE,
  validateAddress,
} = require('./addressValidation');

test('optional address validation accepts empty address data', () => {
  assert.deepEqual(validateAddress({}), {});
  assert.deepEqual(validateAddress({
    provinceCode: '',
    wardCode: '',
    detail: '',
    [['street', 'Ref'].join('')]: null,
    [['street', 'Name'].join('')]: [],
  }), {});
});

test('required and partial addresses require province, ward, and detail', () => {
  assert.deepEqual(validateAddress({}, { required: true }), {
    provinceCode: ADDRESS_PROVINCE_REQUIRED_MESSAGE,
    wardCode: ADDRESS_WARD_REQUIRED_MESSAGE,
    detail: ADDRESS_DETAIL_REQUIRED_MESSAGE,
  });

  assert.deepEqual(validateAddress({ provinceCode: '01' }), {
    wardCode: ADDRESS_WARD_REQUIRED_MESSAGE,
    detail: ADDRESS_DETAIL_REQUIRED_MESSAGE,
  });
});

test('validation requires object/string shape without coercion', () => {
  for (const value of [null, undefined, [], 'address', 123]) {
    assert.deepEqual(validateAddress(value), { address: ADDRESS_INVALID_MESSAGE });
  }

  assert.equal(validateAddress({ provinceCode: 1 }).provinceCode, ADDRESS_INVALID_MESSAGE);
  assert.equal(validateAddress({ detail: null }).detail, ADDRESS_INVALID_MESSAGE);
});
