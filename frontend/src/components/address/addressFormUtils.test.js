import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addressFromUser,
  changeProvince,
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
  addressDetail: ' Số 12, ngõ 5, Phố Hàng Bài ',
  address: 'Số 12, ngõ 5, Phố Hàng Bài, Phường Ba Đình, Hà Nội'
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
    detail: 'Số 12, ngõ 5, Phố Hàng Bài'
  });
  assert.equal(isCompleteAddress(first), true);
  assert.notStrictEqual(first, second);
  assert.deepEqual(completeProfile, {
    addressProvinceCode: ' 01 ',
    addressProvinceName: ' Hà Nội ',
    addressWardCode: ' 001 ',
    addressWardName: ' Phường Ba Đình ',
    addressDetail: ' Số 12, ngõ 5, Phố Hàng Bài ',
    address: 'Số 12, ngõ 5, Phố Hàng Bài, Phường Ba Đình, Hà Nội'
  });
});

test('legacy strings and partially verified profiles become fresh empty selections', () => {
  const legacyProfile = { address: '12 Phố Hàng Bài, Hà Nội' };
  const partialProfile = { ...completeProfile, addressDetail: '   ' };
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
    detail: 'Số 12, ngõ 5, Phố Hàng Bài'
  });
  assert.deepEqual(afterWard, {
    provinceCode: '79',
    provinceName: 'Hồ Chí Minh',
    wardCode: '760',
    wardName: 'Phường Bến Nghé',
    detail: 'Số 12, ngõ 5, Phố Hàng Bài'
  });
  assert.notStrictEqual(afterProvince, original);
  assert.notStrictEqual(afterWard, afterProvince);
  assert.equal(original.detail, 'Số 12, ngõ 5, Phố Hàng Bài');
});

test('user-entered house and road details are written in the detail field', () => {
  const address = {
    ...completeAddress(),
    detail: 'Số 12, ngõ 5, Phố Hàng Bài'
  };

  assert.deepEqual(toAddressPayload(address), {
    provinceCode: '01',
    wardCode: '001',
    detail: 'Số 12, ngõ 5, Phố Hàng Bài'
  });
});

test('address payloads trim canonical write fields and use null for an empty value', () => {
  assert.equal(toAddressPayload(EMPTY_ADDRESS), null);
  assert.equal(toAddressPayload(null), null);
  assert.deepEqual(toAddressPayload({
    provinceCode: ' 01 ',
    provinceName: 'client value is not sent',
    wardCode: ' 001 ',
    wardName: 'client value is not sent',
    detail: '  Số 12, Phố Hàng Bài  '
  }), {
    provinceCode: '01',
    wardCode: '001',
    detail: 'Số 12, Phố Hàng Bài'
  });
});
