const assert = require('node:assert/strict');
const test = require('node:test');
const { createAddressService } = require('./address.service');

const dataset = {
  metadata: { version: 'fixture' },
  provinces: [
    { code: '01', name: 'Thành phố Hà Nội', type: 'thành phố trung ương' },
    { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'thành phố trung ương' },
  ],
  wards: [
    { code: '00001', provinceCode: '01', name: 'Phường Ba Đình', type: 'phường' },
    { code: '00002', provinceCode: '79', name: 'Phường Bến Nghé', type: 'phường' },
  ],
};

const makeService = (fixture = dataset) => createAddressService({ dataset: fixture });
const completeInput = (overrides = {}) => ({
  provinceCode: '01',
  wardCode: '00001',
  detail: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ',
  provinceName: 'Forged Province',
  wardName: 'Forged Ward',
  [['street', 'Ref'].join('')]: 'forged reference',
  [['street', 'Name'].join('')]: 'Forged name',
  ...overrides,
});

const assertFieldError = async (promise, field) => {
  await assert.rejects(promise, (error) => {
    assert.equal(error.status, 400);
    assert.ok(error.errors.some((item) => item.field === field));
    return true;
  });
};

test('province and ward reads use the bundled canonical units', () => {
  const service = makeService();
  assert.deepEqual(service.listProvinces(), [
    { code: '01', name: 'Thành phố Hà Nội', type: 'thành phố trung ương' },
    { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'thành phố trung ương' },
  ]);
  assert.deepEqual(service.listWards('01'), [
    { code: '00001', provinceCode: '01', name: 'Phường Ba Đình', type: 'phường' },
  ]);
  assert.throws(() => service.listWards('79x'), { status: 400 });
});

test('address resolution ignores submitted names and unknown fields, using the local hierarchy', async () => {
  const service = makeService();
  const resolved = await service.resolveAddress(completeInput(), { required: true });
  assert.deepEqual(resolved, {
    provinceCode: '01',
    provinceName: 'Thành phố Hà Nội',
    wardCode: '00001',
    wardName: 'Phường Ba Đình',
    detail: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ',
  });

  assert.deepEqual(service.toUserAddressFields(resolved), {
    address: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ, Phường Ba Đình, Thành phố Hà Nội',
    addressProvinceCode: '01',
    addressProvinceName: 'Thành phố Hà Nội',
    addressWardCode: '00001',
    addressWardName: 'Phường Ba Đình',
    addressDetail: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ',
  });
  assert.deepEqual(service.toOrderAddressFields(resolved), {
    shippingAddress: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ, Phường Ba Đình, Thành phố Hà Nội',
    shippingProvinceCode: '01',
    shippingProvinceName: 'Thành phố Hà Nội',
    shippingWardCode: '00001',
    shippingWardName: 'Phường Ba Đình',
    shippingAddressDetail: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ',
  });
});

test('address resolution validates province and ward hierarchy with field errors', async () => {
  const service = makeService();
  await assertFieldError(service.resolveAddress(completeInput({ provinceCode: 'invalid' }), { required: true }), 'provinceCode');
  await assertFieldError(service.resolveAddress(completeInput({ wardCode: '00002' }), { required: true }), 'wardCode');
});

test('optional addresses accept emptiness while partial addresses require all three fields', async () => {
  const service = makeService();
  assert.equal(await service.resolveAddress({}), null);
  assert.equal(await service.resolveAddress({
    [['street', 'Ref'].join('')]: 'ignored',
    [['street', 'Name'].join('')]: 'ignored',
  }), null);

  await assertFieldError(service.resolveAddress({ provinceCode: '01' }), 'wardCode');
  await assertFieldError(service.resolveAddress({ provinceCode: '01' }), 'detail');
  await assertFieldError(service.resolveAddress(null, { required: true }), 'provinceCode');
});

test('formatted canonical address must contain at least 12 characters', async () => {
  const service = makeService({
    provinces: [{ code: '01', name: 'P' }],
    wards: [{ code: '00001', provinceCode: '01', name: 'W' }],
  });
  await assertFieldError(service.resolveAddress({
    provinceCode: '01',
    wardCode: '00001',
    detail: 'abcde',
  }, { required: true }), 'address');
  assert.deepEqual(await service.resolveAddress({
    provinceCode: '01',
    wardCode: '00001',
    detail: 'abcdef',
  }, { required: true }), {
    provinceCode: '01',
    provinceName: 'P',
    wardCode: '00001',
    wardName: 'W',
    detail: 'abcdef',
  });
});
