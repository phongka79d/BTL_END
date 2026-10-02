const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  ADDRESS_DETAIL_REQUIRED_MESSAGE,
  ADDRESS_INVALID_MESSAGE,
  ADDRESS_MIN_LENGTH_MESSAGE,
  ADDRESS_PROVINCE_REQUIRED_MESSAGE,
  ADDRESS_STREET_REQUIRED_MESSAGE,
  ADDRESS_WARD_REQUIRED_MESSAGE,
  validateAddress,
} = require('./addressValidation');

test('optional address validation accepts a fully empty normalized address', () => {
  assert.deepEqual(validateAddress({}), {});
  assert.deepEqual(validateAddress({
    provinceCode: '',
    provinceName: '',
    wardCode: '',
    wardName: '',
    streetRef: '',
    streetName: '',
    detail: '',
  }), {});
});

test('required and partial addresses require every selection and detail field', () => {
  const emptyErrors = validateAddress({}, { required: true });
  assert.deepEqual(emptyErrors, {
    provinceCode: ADDRESS_PROVINCE_REQUIRED_MESSAGE,
    wardCode: ADDRESS_WARD_REQUIRED_MESSAGE,
    streetRef: ADDRESS_STREET_REQUIRED_MESSAGE,
    detail: ADDRESS_DETAIL_REQUIRED_MESSAGE,
  });

  const partialErrors = validateAddress({
    provinceCode: '01',
    streetName: 'Phố Điện Biên Phủ',
  });
  assert.deepEqual(partialErrors, {
    wardCode: ADDRESS_WARD_REQUIRED_MESSAGE,
    streetRef: ADDRESS_STREET_REQUIRED_MESSAGE,
    detail: ADDRESS_DETAIL_REQUIRED_MESSAGE,
  });
});

test('a typed street name without an authoritative street reference is invalid', () => {
  const errors = validateAddress({
    provinceCode: '01',
    provinceName: 'Thành phố Hà Nội',
    wardCode: '00001',
    wardName: 'Phường Ba Đình',
    streetName: 'Phố Điện Biên Phủ',
    detail: 'Số 10',
  });
  assert.equal(errors.streetRef, ADDRESS_STREET_REQUIRED_MESSAGE);
});

test('validation requires object/string shape without coercion', () => {
  for (const value of [null, undefined, [], 'address', 123]) {
    assert.deepEqual(validateAddress(value), { address: ADDRESS_INVALID_MESSAGE });
  }

  assert.equal(validateAddress({ provinceCode: 1 }).provinceCode, ADDRESS_INVALID_MESSAGE);
  assert.equal(validateAddress({ streetName: ['typed'] }).address, ADDRESS_INVALID_MESSAGE);
  assert.equal(validateAddress({ streetRef: null }).streetRef, ADDRESS_INVALID_MESSAGE);
});

test('canonical formatted address minimum is checked only when every normalized name exists', () => {
  const shortNamedAddress = {
    provinceCode: '01',
    wardCode: '01',
    streetRef: 's1',
    detail: 'ab',
    streetName: 'b',
    wardName: 'c',
    provinceName: 'd',
  };
  assert.equal(validateAddress(shortNamedAddress).address, ADDRESS_MIN_LENGTH_MESSAGE);

  const exactMinimumAddress = {
    ...shortNamedAddress,
    detail: 'abc',
  };
  assert.deepEqual(validateAddress(exactMinimumAddress), {});

  const unresolvedNames = {
    ...shortNamedAddress,
    streetName: '',
    wardName: '',
    provinceName: '',
  };
  assert.deepEqual(validateAddress(unresolvedNames), {});
});
