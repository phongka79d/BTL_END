import assert from 'node:assert/strict';
import test from 'node:test';
import { ADDRESS_INVALID_MESSAGE, validateAddress } from './addressValidation.js';

const FULL_SELECTION = {
  provinceCode: '01',
  wardCode: '00123',
  detail: 'Số 12, Phố Hàng Bài'
};

const COMPLETE_NORMALIZED_ADDRESS = {
  ...FULL_SELECTION,
  detail: '123456',
  wardName: 'B',
  provinceName: 'C'
};

const REQUIRED_ERRORS = {
  provinceCode: 'Vui lòng chọn Tỉnh/Thành phố.',
  wardCode: 'Vui lòng chọn Phường/Xã.',
  detail: 'Vui lòng nhập số nhà, ngõ/ngách, tên đường.'
};

test('optional empty addresses are accepted while required empty addresses report every required field', () => {
  assert.deepEqual(validateAddress(), {});
  assert.deepEqual(validateAddress(null), {});
  assert.deepEqual(validateAddress({}), {});
  assert.deepEqual(validateAddress({ detail: '   ' }), {});
  assert.deepEqual(validateAddress({}, { required: true }), REQUIRED_ERRORS);
});

test('each missing selector reports its own guidance and missing detail is field-specific', () => {
  const missingSelectors = [
    ['provinceCode', 'Vui lòng chọn Tỉnh/Thành phố.'],
    ['wardCode', 'Vui lòng chọn Phường/Xã.']
  ];

  for (const [field, message] of missingSelectors) {
    assert.deepEqual(validateAddress({ ...FULL_SELECTION, [field]: '  ' }), { [field]: message });
  }

  assert.deepEqual(validateAddress({ ...FULL_SELECTION, detail: '  ' }), {
    detail: 'Vui lòng nhập số nhà, ngõ/ngách, tên đường.'
  });
  assert.deepEqual(validateAddress({ provinceCode: '01' }), {
    wardCode: 'Vui lòng chọn Phường/Xã.',
    detail: 'Vui lòng nhập số nhà, ngõ/ngách, tên đường.'
  });
});

test('required address codes and populated canonical fields must be strings', () => {
  assert.deepEqual(validateAddress({ ...FULL_SELECTION, wardCode: undefined }), {
    wardCode: 'Vui lòng chọn Phường/Xã.'
  });
  assert.deepEqual(validateAddress({ ...FULL_SELECTION, wardCode: 1 }), {
    address: ADDRESS_INVALID_MESSAGE
  });
  assert.deepEqual(validateAddress([]), { address: ADDRESS_INVALID_MESSAGE });
});

test('minimum length applies to the canonical formatted address when names exist', () => {
  assert.equal(
    `${COMPLETE_NORMALIZED_ADDRESS.detail}, ${COMPLETE_NORMALIZED_ADDRESS.wardName}, ${COMPLETE_NORMALIZED_ADDRESS.provinceName}`.length,
    12
  );
  assert.deepEqual(validateAddress(COMPLETE_NORMALIZED_ADDRESS), {});
  assert.deepEqual(validateAddress({ ...COMPLETE_NORMALIZED_ADDRESS, detail: '12' }), {
    address: 'Địa chỉ phải có ít nhất 12 ký tự.'
  });
  assert.deepEqual(validateAddress({ ...FULL_SELECTION, detail: '1' }), {});
});
