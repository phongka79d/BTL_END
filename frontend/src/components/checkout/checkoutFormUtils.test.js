import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCheckoutPayload,
  createCheckoutRequest,
  createSubmissionGuard,
  validateCheckoutValues
} from './checkoutFormUtils.js';
import {
  addressFromUser,
  EMPTY_ADDRESS,
  hasLegacyAddress
} from '../address/addressFormUtils.js';

const validAddress = {
  provinceCode: '01',
  provinceName: 'Hà Nội',
  wardCode: '00001',
  wardName: 'Phường Phúc Xá',
  streetRef: 'street-1',
  streetName: 'Đường ABC',
  detail: '12/3'
};

const validValues = {
  fullName: '  Nguyễn Văn A  ',
  phone: '0987654321',
  address: validAddress,
  note: ' Giao giờ hành chính '
};

const selectedItems = [{ id: 'cart-item-1' }];

test('checkout validates selected address and sends only structured address fields', () => {
  assert.deepEqual(validateCheckoutValues(validValues), {});
  assert.deepEqual(buildCheckoutPayload(validValues, selectedItems), {
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    address: {
      provinceCode: '01',
      wardCode: '00001',
      streetRef: 'street-1',
      detail: '12/3'
    },
    note: 'Giao giờ hành chính',
    cartItemIds: ['cart-item-1']
  });
});

test('checkout validates inclusive full-name boundaries and rejects blank or overlong names', () => {
  for (const fullName of [`  ${'A'.repeat(10)}  `, 'A'.repeat(50)]) {
    assert.equal(validateCheckoutValues({ ...validValues, fullName }).fullName, undefined);
  }

  for (const fullName of [` ${'A'.repeat(9)} `, 'A'.repeat(51), '', '   ']) {
    const request = createCheckoutRequest({
      values: { ...validValues, fullName },
      selectedItems,
      createOrder: () => assert.fail('invalid names must not submit')
    });

    assert.ok(request.errors.fullName);
    assert.equal(request.run, null);
  }
});

test('checkout accepts 9–11 digit phones and preserves leading zeroes', () => {
  for (const phone of ['012345678', '0123456789', '01234567890']) {
    const request = createCheckoutRequest({
      values: { ...validValues, phone },
      selectedItems,
      createOrder: (payload) => payload
    });

    assert.equal(request.errors.phone, undefined);
    assert.equal(request.run().phone, phone);
  }
});

test('checkout blocks out-of-range and non-digit phone values', () => {
  for (const phone of [
    '01234567',
    '012345678901',
    '0987abc',
    '0987 654321',
    '+84987654321'
  ]) {
    let requestCount = 0;
    const request = createCheckoutRequest({
      values: { ...validValues, phone },
      selectedItems,
      createOrder: () => {
        requestCount += 1;
      }
    });

    assert.ok(request.errors.phone, phone);
    assert.equal(request.run, null, phone);
    assert.equal(requestCount, 0, phone);
  }
});

test('checkout reports required address fields as nested errors', () => {
  const missingAddress = validateCheckoutValues({
    ...validValues,
    address: EMPTY_ADDRESS
  });
  assert.deepEqual(missingAddress.address, {
    provinceCode: 'Vui lòng chọn Tỉnh/Thành phố.',
    wardCode: 'Vui lòng chọn Phường/Xã.',
    streetRef: 'Vui lòng chọn Đường/Phố.',
    detail: 'Vui lòng nhập số nhà/ngõ/ngách hoặc thông tin chi tiết.'
  });

  const missingStreet = validateCheckoutValues({
    ...validValues,
    address: { ...validAddress, streetRef: '', streetName: '' }
  });
  assert.deepEqual(missingStreet.address, {
    streetRef: 'Vui lòng chọn Đường/Phố.'
  });

  const missingDetail = validateCheckoutValues({
    ...validValues,
    address: { ...validAddress, detail: '  ' }
  });
  assert.deepEqual(missingDetail.address, {
    detail: 'Vui lòng nhập số nhà/ngõ/ngách hoặc thông tin chi tiết.'
  });
});

test('legacy profile addresses cannot satisfy checkout address validation', () => {
  const legacyProfile = {
    address: '12 Đường cũ, Phường cũ, Hà Nội',
    addressProvinceCode: '01',
    addressProvinceName: 'Hà Nội'
  };
  assert.equal(hasLegacyAddress(legacyProfile), true);

  let requestCount = 0;
  const request = createCheckoutRequest({
    values: { ...validValues, address: addressFromUser(legacyProfile) },
    selectedItems,
    createOrder: () => {
      requestCount += 1;
    }
  });

  assert.deepEqual(request.errors.address, {
    provinceCode: 'Vui lòng chọn Tỉnh/Thành phố.',
    wardCode: 'Vui lòng chọn Phường/Xã.',
    streetRef: 'Vui lòng chọn Đường/Phố.',
    detail: 'Vui lòng nhập số nhà/ngõ/ngách hoặc thông tin chi tiết.'
  });
  assert.equal(request.run, null);
  assert.equal(requestCount, 0);
});

test('checkout request snapshots do not share address or selected-item state', () => {
  const values = {
    ...validValues,
    address: { ...validAddress, detail: ' 12/3 ' }
  };
  const items = [{ id: 'cart-item-1' }];
  const request = createCheckoutRequest({
    values,
    selectedItems: items,
    createOrder: (payload) => payload
  });

  values.address.detail = 'Edited after submission';
  items[0].id = 'different-item';

  assert.deepEqual(request.run().address, {
    provinceCode: '01',
    wardCode: '00001',
    streetRef: 'street-1',
    detail: '12/3'
  });
  assert.deepEqual(request.run().cartItemIds, ['cart-item-1']);
});

test('submission guard admits one order at a time and unlocks for retries', () => {
  const guard = createSubmissionGuard();

  assert.equal(guard.begin(), true);
  assert.equal(guard.begin(), false, 'rapid repeated submit is ignored while in flight');
  guard.end();
  assert.equal(guard.begin(), true, 'checkout is retryable once the order settles');
});
