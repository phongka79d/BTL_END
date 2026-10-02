import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addressFromUser,
  changeProvince,
  changeStreet,
  changeWard,
  EMPTY_ADDRESS,
  hasLegacyAddress,
  isCompleteAddress,
  toAddressPayload
} from './addressFormUtils.js';

const completeProfile = Object.freeze({
  addressProvinceCode: ' 01 ',
  addressProvinceName: ' Hà Nội ',
  addressWardCode: ' 001 ',
  addressWardName: ' Phường Ba Đình ',
  addressStreetRef: ' street-abc ',
  addressStreetName: ' Đường ABC ',
  addressDetail: ' Số 12, ngõ 5 ',
  address: 'Số 12, Đường ABC, Phường Ba Đình, Hà Nội'
});

const completeAddress = () => addressFromUser(completeProfile);

test('profile addresses are accepted only when every verified field is present', () => {
  const first = addressFromUser(completeProfile);
  const second = addressFromUser(completeProfile);

  assert.deepEqual(first, {
    provinceCode: '01',
    provinceName: 'Hà Nội',
    wardCode: '001',
    wardName: 'Phường Ba Đình',
    streetRef: 'street-abc',
    streetName: 'Đường ABC',
    detail: 'Số 12, ngõ 5'
  });
  assert.equal(isCompleteAddress(first), true);
  assert.notStrictEqual(first, second);
  assert.deepEqual(completeProfile, {
    addressProvinceCode: ' 01 ',
    addressProvinceName: ' Hà Nội ',
    addressWardCode: ' 001 ',
    addressWardName: ' Phường Ba Đình ',
    addressStreetRef: ' street-abc ',
    addressStreetName: ' Đường ABC ',
    addressDetail: ' Số 12, ngõ 5 ',
    address: 'Số 12, Đường ABC, Phường Ba Đình, Hà Nội'
  });
});

test('legacy strings and partially verified profiles become fresh empty selections', () => {
  const legacyProfile = { address: '12 Đường ABC, Hà Nội' };
  const partialProfile = { ...completeProfile, addressStreetName: '   ' };
  const first = addressFromUser(legacyProfile);
  const second = addressFromUser(partialProfile);

  assert.equal(isCompleteAddress(first), false);
  assert.equal(isCompleteAddress(second), false);
  assert.deepEqual(first, EMPTY_ADDRESS);
  assert.deepEqual(second, EMPTY_ADDRESS);
  assert.notStrictEqual(first, EMPTY_ADDRESS);
  assert.notStrictEqual(first, second);
  assert.equal(hasLegacyAddress(legacyProfile), true);
  assert.equal(hasLegacyAddress(partialProfile), true);
  assert.equal(hasLegacyAddress({ address: '  ' }), false);
  assert.equal(hasLegacyAddress(completeProfile), false);
});

test('empty address constant cannot be mutated and all callers receive their own value', () => {
  assert.equal(Object.isFrozen(EMPTY_ADDRESS), true);
  assert.notStrictEqual(addressFromUser(null), addressFromUser(null));
  assert.deepEqual(addressFromUser(null), EMPTY_ADDRESS);
});

test('province and ward changes clear dependent selections while preserving typed detail', () => {
  const original = completeAddress();
  const afterProvince = changeProvince(original, { code: '79', name: 'Hồ Chí Minh' });
  const afterWard = changeWard(afterProvince, { code: '760', name: 'Phường Bến Nghé' });

  assert.deepEqual(afterProvince, {
    provinceCode: '79',
    provinceName: 'Hồ Chí Minh',
    wardCode: '',
    wardName: '',
    streetRef: '',
    streetName: '',
    detail: 'Số 12, ngõ 5'
  });
  assert.deepEqual(afterWard, {
    provinceCode: '79',
    provinceName: 'Hồ Chí Minh',
    wardCode: '760',
    wardName: 'Phường Bến Nghé',
    streetRef: '',
    streetName: '',
    detail: 'Số 12, ngõ 5'
  });
  assert.notStrictEqual(afterProvince, original);
  assert.notStrictEqual(afterWard, afterProvince);
  assert.equal(original.streetRef, 'street-abc');
});

test('only a selected returned street reference is persisted, never search text', () => {
  const area = completeAddress();
  const typedSearch = changeStreet(area, 'Đường người dùng tự nhập');
  const selectedStreet = changeStreet(area, { ref: 'street-new', name: 'Đường Mới' });

  assert.equal(typedSearch.streetRef, '');
  assert.equal(typedSearch.streetName, '');
  assert.deepEqual(toAddressPayload(typedSearch), {
    provinceCode: '01',
    wardCode: '001',
    streetRef: '',
    detail: 'Số 12, ngõ 5'
  });
  assert.equal(selectedStreet.streetRef, 'street-new');
  assert.equal(selectedStreet.streetName, 'Đường Mới');
  assert.deepEqual(toAddressPayload(selectedStreet), {
    provinceCode: '01',
    wardCode: '001',
    streetRef: 'street-new',
    detail: 'Số 12, ngõ 5'
  });
  assert.equal(Object.hasOwn(toAddressPayload(selectedStreet), 'streetName'), false);
});

test('address payloads trim only canonical write fields and use null for an empty value', () => {
  assert.equal(toAddressPayload(EMPTY_ADDRESS), null);
  assert.equal(toAddressPayload(null), null);
  assert.deepEqual(toAddressPayload({
    provinceCode: ' 01 ',
    provinceName: 'client value is not sent',
    wardCode: ' 001 ',
    wardName: 'client value is not sent',
    streetRef: ' ref-1 ',
    streetName: 'client value is not sent',
    detail: '  Unit 2  '
  }), {
    provinceCode: '01',
    wardCode: '001',
    streetRef: 'ref-1',
    detail: 'Unit 2'
  });
});
