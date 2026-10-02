const assert = require('node:assert/strict');
const test = require('node:test');
const { createAddressService } = require('./address.service');

const dataset = {
  metadata: { version: 'fixture' },
  provinces: [
    { code: '01', name: 'Thành phố Hà Nội', type: 'thành phố trung ương' },
    { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'thành phố trung ương' }
  ],
  wards: [
    { code: '00001', provinceCode: '01', name: 'Phường Ba Đình', type: 'phường' },
    { code: '00002', provinceCode: '79', name: 'Phường Bến Nghé', type: 'phường' }
  ]
};

const canonicalStreet = {
  ref: 'vm:street:opaque-ref',
  name: 'Phố Điện Biên Phủ',
  displayName: 'Phố Điện Biên Phủ, Phường Ba Đình, Thành phố Hà Nội',
  provinceCode: '01',
  wardCode: '00001'
};

const makeService = ({ provider, fixture = dataset, ...options } = {}) => createAddressService({
  dataset: fixture,
  provider: provider || {
    searchStreets: async () => [{ ...canonicalStreet }],
    resolveStreet: async () => ({ ...canonicalStreet })
  },
  ...options
});

const completeInput = (overrides = {}) => ({
  provinceCode: '01',
  provinceName: 'forged province name',
  wardCode: '00001',
  wardName: 'forged ward name',
  streetRef: canonicalStreet.ref,
  streetName: 'forged street name',
  detail: 'Tầng 2, số 10 ngõ 5',
  ...overrides
});

const assertStatus = async (promise, statusCode) => {
  await assert.rejects(promise, (error) => {
    assert.equal(error.status, statusCode);
    assert.equal(error.statusCode, statusCode);
    return true;
  });
};

test('province and ward reads use local zero-padded canonical units during provider outage', async () => {
  const service = makeService({ provider: { searchStreets: async () => { throw new Error('offline'); }, resolveStreet: async () => { throw new Error('offline'); } } });

  assert.deepEqual(service.listProvinces(), [
    { code: '01', name: 'Thành phố Hà Nội', type: 'thành phố trung ương' },
    { code: '79', name: 'Thành phố Hồ Chí Minh', type: 'thành phố trung ương' }
  ]);
  assert.deepEqual(service.listWards('01'), [{ code: '00001', provinceCode: '01', name: 'Phường Ba Đình', type: 'phường' }]);
  await assertStatus(Promise.resolve().then(() => service.listWards('79x')), 400);
});

test('street lookup validates local hierarchy and caches normalized searches', async () => {
  let providerCalls = 0;
  let providerQuery;
  const service = makeService({ provider: {
    searchStreets: async ({ query }) => {
      providerCalls += 1;
      providerQuery = query;
      return [{ ref: canonicalStreet.ref, name: query, displayName: `${query}, ward` }];
    },
    resolveStreet: async () => ({ ...canonicalStreet })
  } });

  await assertStatus(service.searchStreets({ provinceCode: '01', wardCode: '00002', query: 'Main' }), 400);
  await assertStatus(service.searchStreets({ provinceCode: '01', wardCode: '00001', query: ' a ' }), 400);
  await assertStatus(service.searchStreets({ provinceCode: '01', wardCode: '00001', query: ['Main'] }), 400);
  assert.equal(providerCalls, 0);

  assert.deepEqual(await service.searchStreets({ provinceCode: '01', wardCode: '00001', query: '  Đường   A\u0301  ' }), [
    { ref: canonicalStreet.ref, name: 'Đường Á', displayName: 'Đường Á, ward' }
  ]);
  assert.deepEqual(await service.searchStreets({ provinceCode: '01', wardCode: '00001', query: 'đường á' }), [
    { ref: canonicalStreet.ref, name: 'Đường Á', displayName: 'Đường Á, ward' }
  ]);
  assert.equal(providerQuery, 'Đường Á');
  assert.equal(providerCalls, 1);
});

test('resolveAddress verifies street area and builds canonical names, ignoring submitted names', async () => {
  let providerCalls = 0;
  const service = makeService({ provider: {
    searchStreets: async () => [],
    resolveStreet: async (ref) => {
      providerCalls += 1;
      return { ...canonicalStreet, ref };
    }
  } });
  const address = await service.resolveAddress(completeInput(), { required: true });

  assert.deepEqual(address, {
    provinceCode: '01',
    provinceName: 'Thành phố Hà Nội',
    wardCode: '00001',
    wardName: 'Phường Ba Đình',
    streetRef: canonicalStreet.ref,
    streetName: 'Phố Điện Biên Phủ',
    detail: 'Tầng 2, số 10 ngõ 5'
  });
  assert.equal(providerCalls, 1);
  assert.deepEqual(service.toUserAddressFields(address), {
    address: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ, Phường Ba Đình, Thành phố Hà Nội',
    addressProvinceCode: '01',
    addressProvinceName: 'Thành phố Hà Nội',
    addressWardCode: '00001',
    addressWardName: 'Phường Ba Đình',
    addressStreetRef: canonicalStreet.ref,
    addressStreetName: 'Phố Điện Biên Phủ',
    addressDetail: 'Tầng 2, số 10 ngõ 5'
  });
  assert.deepEqual(service.toOrderAddressFields(address), {
    shippingAddress: 'Tầng 2, số 10 ngõ 5, Phố Điện Biên Phủ, Phường Ba Đình, Thành phố Hà Nội',
    shippingProvinceCode: '01',
    shippingProvinceName: 'Thành phố Hà Nội',
    shippingWardCode: '00001',
    shippingWardName: 'Phường Ba Đình',
    shippingStreetRef: canonicalStreet.ref,
    shippingStreetName: 'Phố Điện Biên Phủ',
    shippingAddressDetail: 'Tầng 2, số 10 ngõ 5'
  });
  assert.deepEqual(service.toUserAddressFields(null), {
    address: null,
    addressProvinceCode: null,
    addressProvinceName: null,
    addressWardCode: null,
    addressWardName: null,
    addressStreetRef: null,
    addressStreetName: null,
    addressDetail: null
  });
  assert.deepEqual(service.toOrderAddressFields(null), {
    shippingAddress: null,
    shippingProvinceCode: null,
    shippingProvinceName: null,
    shippingWardCode: null,
    shippingWardName: null,
    shippingStreetRef: null,
    shippingStreetName: null,
    shippingAddressDetail: null
  });

});

test('resolveAddress rejects cross-province wards, invalid refs and partial input before persistence', async () => {
  let providerCalls = 0;
  const service = makeService({ provider: {
    searchStreets: async () => [],
    resolveStreet: async (ref) => {
      providerCalls += 1;
      if (ref === 'mismatched-ref') return { ...canonicalStreet, ref: 'another-ref' };
      if (ref === 'invalid-ref') {
        const error = new Error('Provider detail must not be exposed');
        error.status = 400;
        error.statusCode = 400;
        throw error;
      }
      return { ...canonicalStreet, provinceCode: '79', wardCode: '00002' };
    }
  } });
  const crossProvinceInput = completeInput({ provinceCode: '79' });

  assert.equal(await service.resolveAddress({}), null);
  assert.equal(await service.resolveAddress({ provinceCode: '', wardCode: '', streetRef: '', detail: '' }), null);
  await assertStatus(service.resolveAddress({ provinceCode: '01', wardCode: '00001' }), 400);
  await assertStatus(service.resolveAddress(completeInput({ detail: '' }), { required: true }), 400);
  await assertStatus(service.resolveAddress(crossProvinceInput, { required: true }), 400);
  await assertStatus(service.resolveAddress(completeInput({ streetRef: 'mismatched-ref' }), { required: true }), 400);
  await assertStatus(service.resolveAddress(completeInput({ streetRef: 'invalid-ref' }), { required: true }), 400);
  await assertStatus(service.resolveAddress(completeInput(), { required: true }), 400);
  assert.equal(providerCalls, 3);
});

test('resolveAddress enforces canonical formatted minimum length', async () => {
  const compactDataset = {
    provinces: [{ code: '01', name: 'P', type: 'tỉnh' }],
    wards: [{ code: '00001', provinceCode: '01', name: 'W', type: 'xã' }]
  };
  const service = makeService({
    fixture: compactDataset,
    provider: {
      searchStreets: async () => [],
      resolveStreet: async () => ({ ref: 'r', name: 'S', displayName: 'S, W, P', provinceCode: '01', wardCode: '00001' })
    }
  });

  await assert.rejects(service.resolveAddress({ provinceCode: '01', wardCode: '00001', streetRef: 'r', detail: '12' }, { required: true }), (error) => {
    assert.equal(error.status, 400);
    assert.equal(error.statusCode, 400);
    assert.equal(error.message, 'Địa chỉ phải có ít nhất 12 ký tự.');
    return true;
  });
  assert.equal((await service.resolveAddress({ provinceCode: '01', wardCode: '00001', streetRef: 'r', detail: '123' }, { required: true })).detail, '123');
});

test('resolveAddress preserves optional emptiness and exposes exact field guidance before provider calls', async () => {
  let providerCalls = 0;
  const service = makeService({ provider: {
    searchStreets: async () => [],
    resolveStreet: async () => {
      providerCalls += 1;
      return { ...canonicalStreet };
    }
  } });
  const requiredErrors = [
    { field: 'provinceCode', message: 'Vui lòng chọn Tỉnh/Thành phố.' },
    { field: 'wardCode', message: 'Vui lòng chọn Phường/Xã.' },
    { field: 'streetRef', message: 'Vui lòng chọn Đường/Phố.' },
    { field: 'detail', message: 'Vui lòng nhập số nhà/ngõ/ngách hoặc thông tin chi tiết.' }
  ];

  assert.equal(await service.resolveAddress(null), null);
  assert.equal(await service.resolveAddress({ provinceCode: '', wardCode: '', streetRef: '', detail: '' }), null);
  await assert.rejects(service.resolveAddress(null, { required: true }), (error) => {
    assert.equal(error.status, 400);
    assert.equal(error.statusCode, 400);
    assert.equal(error.message, requiredErrors[0].message);
    assert.deepEqual(error.errors, requiredErrors);
    return true;
  });
  await assert.rejects(service.resolveAddress({ provinceCode: '01' }), (error) => {
    assert.equal(error.message, requiredErrors[1].message);
    assert.deepEqual(error.errors, requiredErrors.slice(1));
    return true;
  });
  await assert.rejects(service.resolveAddress(completeInput({ provinceCode: 1 })), (error) => {
    assert.equal(error.message, 'Địa chỉ không hợp lệ.');
    assert.deepEqual(error.errors, [{ field: 'provinceCode', message: 'Địa chỉ không hợp lệ.' }]);
    return true;
  });
  await assert.rejects(service.resolveAddress('not an address'), (error) => {
    assert.equal(error.message, 'Địa chỉ không hợp lệ.');
    assert.deepEqual(error.errors, [{ field: 'address', message: 'Địa chỉ không hợp lệ.' }]);
    return true;
  });
  await assertStatus(service.resolveAddress(completeInput({ wardCode: '00002' }), { required: true }), 400);
  assert.equal(providerCalls, 0);
});

test('street and resolved-street caches honor TTL and entry bounds', async () => {
  let now = 0;
  let searchCalls = 0;
  let resolveCalls = 0;
  const service = makeService({
    now: () => now,
    cacheTtlMs: 10,
    maxCacheEntries: 1,
    provider: {
      searchStreets: async ({ query }) => {
        searchCalls += 1;
        return [{ ref: canonicalStreet.ref, name: query, displayName: `${query}, ward` }];
      },
      resolveStreet: async (ref) => {
        resolveCalls += 1;
        return { ...canonicalStreet, ref };
      }
    }
  });
  const lookup = (query) => service.searchStreets({ provinceCode: '01', wardCode: '00001', query });

  await lookup('Main');
  await lookup('main');
  assert.equal(searchCalls, 1);
  await lookup('Other');
  await lookup('Main');
  assert.equal(searchCalls, 3);

  await service.resolveAddress(completeInput({ streetRef: 'ref-1' }), { required: true });
  await service.resolveAddress(completeInput({ streetRef: 'ref-1' }), { required: true });
  assert.equal(resolveCalls, 1);
  await service.resolveAddress(completeInput({ streetRef: 'ref-2' }), { required: true });
  await service.resolveAddress(completeInput({ streetRef: 'ref-1' }), { required: true });
  assert.equal(resolveCalls, 3);

  now = 10;
  await lookup('Main');
  await service.resolveAddress(completeInput({ streetRef: 'ref-1' }), { required: true });
  assert.equal(searchCalls, 4);
  assert.equal(resolveCalls, 4);
});

test('street and resolve provider outages return safe retryable errors', async () => {
  const service = makeService({ provider: {
    searchStreets: async () => { throw new Error('VIETMAP_API_KEY=private-secret'); },
    resolveStreet: async () => { throw new Error('VIETMAP_API_KEY=private-secret'); }
  } });

  await assert.rejects(service.searchStreets({ provinceCode: '01', wardCode: '00001', query: 'Main' }), (error) => {
    assert.equal(error.status, 503);
    assert.equal(error.statusCode, 503);
    assert.doesNotMatch(error.message, /private-secret|VIETMAP_API_KEY/);
    return true;
  });
  await assert.rejects(service.resolveAddress(completeInput(), { required: true }), (error) => {
    assert.equal(error.status, 503);
    assert.equal(error.statusCode, 503);
    assert.doesNotMatch(error.message, /private-secret|VIETMAP_API_KEY/);
    return true;
  });
});