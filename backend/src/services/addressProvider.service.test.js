'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const addressProviderService = require('./addressProvider.service');
const { createAddressProvider } = addressProviderService;

const providerDataset = {
  metadata: { source: 'test fixture', version: '1', effectiveDate: '2025-01-01', lastUpdated: '2025-01-01' },
  provinces: [{ code: '79', name: 'Thành phố Hồ Chí Minh', type: 'municipality' }],
  wards: [{ code: '00001', provinceCode: '79', name: 'Phường Chợ Quán', type: 'ward' }],
};

const documentedPlace = {
  display: '197 Đường Trần Phú,Phường Chợ Quán,Thành Phố Hồ Chí Minh',
  name: '',
  hs_num: '197',
  street: 'Đường Trần Phú',
  address: '197 Đường Trần Phú',
  city_id: 12,
  city: 'Thành Phố Hồ Chí Minh',
  district_id: 0,
  district: '',
  ward_id: 18700,
  ward: 'Phường Chợ Quán',
  lat: 10.759222947000069,
  lng: 106.67590269100003,
};

const documentedGeocode = (ref = 'geocode:documented_fixture-ref', oldDisplay = null) => ({
  ref_id: ref,
  display: '197 Trần Phú Phường Chợ Quán,Thành Phố Hồ Chí Minh',
  boundaries: [
    { type: 2, full_name: 'Phường Chợ Quán' },
    { type: 0, full_name: 'Thành Phố Hồ Chí Minh' },
  ],
  categories: [],
  data_old: oldDisplay ? { display: oldDisplay } : null,
});

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' },
});

const providerWith = (fetchImpl, options = {}) => createAddressProvider({
  fetchImpl,
  env: { VIETMAP_API_KEY: 'test-only-key' },
  dataset: providerDataset,
  ...options,
});

test('legacy address matching is exported and verifies exact current and old display mappings', async (t) => {
  assert.equal(typeof addressProviderService.matchLegacyAddress, 'function');

  const expected = {
    provinceCode: '79',
    provinceName: 'Thành phố Hồ Chí Minh',
    wardCode: '00001',
    wardName: 'Phường Chợ Quán',
    detail: '197 Đường Trần Phú',
  };
  const oldDisplay = '197 Trần Phú Phường 4,Quận 5,Thành Phố Hồ Chí Minh';
  for (const [label, legacyText, result] of [
    [
      'current display',
      ' 197   Tra\u0302\u0300n Phu\u0301 Phường Chợ Quán , THÀNH PHỐ HỒ CHÍ MINH ',
      documentedGeocode(),
    ],
    [
      'paired old display',
      '197 Trần Phú Phường 4, Quận 5, Thành Phố Hồ Chí Minh',
      documentedGeocode('geocode:documented_fixture-ref', oldDisplay),
    ],
  ]) {
    await t.test(label, async () => {
      const requests = [];
      const provider = providerWith(async (url) => {
        const requestUrl = new URL(url);
        requests.push(requestUrl);
        if (requestUrl.pathname === '/api/search/v4') return jsonResponse([result]);
        assert.equal(requestUrl.pathname, '/api/place/v4');
        assert.equal(requestUrl.searchParams.get('refid'), 'geocode:documented_fixture-ref');
        return jsonResponse(documentedPlace);
      });

      assert.deepEqual(await provider.matchLegacyAddress(legacyText), {
        status: 'matched',
        address: expected,
      });
      assert.equal(requests.length, 2);
      assert.equal(requests[0].searchParams.get('layers'), 'ADDRESS');
      assert.equal(requests[0].searchParams.get('display_type'), '5');
      assert.equal(requests[0].searchParams.get('text'), legacyText.normalize('NFC').trim().replace(/\s+/gu, ' '));
      assert.equal(requests[1].pathname, '/api/place/v4');
    });
  }
});

test('legacy address matching deduplicates refs and reports distinct exact refs as ambiguous', async (t) => {
  await t.test('duplicate results for the same ref resolve once', async () => {
    let placeCalls = 0;
    const candidate = documentedGeocode();
    const provider = providerWith(async (url) => {
      const requestUrl = new URL(url);
      if (requestUrl.pathname === '/api/search/v4') return jsonResponse([candidate, { ...candidate }]);
      placeCalls += 1;
      return jsonResponse(documentedPlace);
    });

    assert.equal((await provider.matchLegacyAddress(candidate.display)).status, 'matched');
    assert.equal(placeCalls, 1);
  });

  await t.test('different refs with the same exact display are ambiguous', async () => {
    let placeCalls = 0;
    const provider = providerWith(async (url) => {
      const requestUrl = new URL(url);
      if (requestUrl.pathname === '/api/search/v4') {
        return jsonResponse([
          documentedGeocode('geocode:first_exact-ref'),
          documentedGeocode('geocode:second_exact-ref'),
        ]);
      }
      placeCalls += 1;
      return jsonResponse(documentedPlace);
    });

    assert.deepEqual(await provider.matchLegacyAddress('197 Trần Phú Phường Chợ Quán, Thành Phố Hồ Chí Minh'), {
      status: 'ambiguous',
    });
    assert.equal(placeCalls, 2);
  });
});

test('legacy address matching rejects uncertain, POI, mismatched, and incomplete candidates', async (t) => {
  await t.test('accent loss and partial input are not exact matches', async () => {
    let placeCalls = 0;
    const candidate = documentedGeocode();
    const provider = providerWith(async (url) => {
      const requestUrl = new URL(url);
      if (requestUrl.pathname === '/api/search/v4') return jsonResponse([candidate]);
      placeCalls += 1;
      return jsonResponse(documentedPlace);
    });

    assert.deepEqual(await provider.matchLegacyAddress('197 Tran Phu Phuong Cho Quan, Thanh Pho Ho Chi Minh'), {
      status: 'unmatched',
    });
    assert.deepEqual(await provider.matchLegacyAddress('197 Trần Phũ Phường Chợ Quán, Thành Phố Hồ Chí Minh'), {
      status: 'unmatched',
    });
    assert.deepEqual(await provider.matchLegacyAddress('197 Trần Phú Phường Chợ Quán, TP.HCM'), {
      status: 'unmatched',
    });
    assert.deepEqual(await provider.matchLegacyAddress('197 Trần Phú'), { status: 'unmatched' });
    assert.equal(placeCalls, 0);
  });

  await t.test('Place POIs are rejected', async () => {
    const candidate = documentedGeocode();
    const provider = providerWith(async (url) => (
      new URL(url).pathname === '/api/search/v4'
        ? jsonResponse([candidate])
        : jsonResponse({ ...documentedPlace, name: 'Cửa hàng' })
    ));
    assert.deepEqual(await provider.matchLegacyAddress(candidate.display), { status: 'unmatched' });
  });
  await t.test('category-bearing POIs are rejected before Place lookup', async () => {
    let placeCalls = 0;
    const candidate = { ...documentedGeocode(), categories: [{ id: 1002, name: 'Restaurant' }] };
    const provider = providerWith(async (url) => {
      if (new URL(url).pathname === '/api/search/v4') return jsonResponse([candidate]);
      placeCalls += 1;
      return jsonResponse(documentedPlace);
    });
    assert.deepEqual(await provider.matchLegacyAddress(candidate.display), { status: 'unmatched' });
    assert.equal(placeCalls, 0);
  });

  await t.test('candidate and Place current ward hierarchy must agree', async () => {
    const dataset = {
      ...providerDataset,
      wards: [
        ...providerDataset.wards,
        { code: '00002', provinceCode: '79', name: 'Phường Tân Định', type: 'ward' },
      ],
    };
    const candidate = documentedGeocode();
    const provider = providerWith(async (url) => (
      new URL(url).pathname === '/api/search/v4'
        ? jsonResponse([candidate])
        : jsonResponse({
          ...documentedPlace,
          ward: 'Phường Tân Định',
          display: '197 Đường Trần Phú,Phường Tân Định,Thành Phố Hồ Chí Minh',
        })
    ), { dataset });
    assert.deepEqual(await provider.matchLegacyAddress(candidate.display), { status: 'unmatched' });
  });

  await t.test('missing house detail is rejected', async () => {
    const candidate = documentedGeocode();
    const provider = providerWith(async (url) => (
      new URL(url).pathname === '/api/search/v4'
        ? jsonResponse([candidate])
        : jsonResponse({ ...documentedPlace, hs_num: '' })
    ));
    assert.deepEqual(await provider.matchLegacyAddress(candidate.display), { status: 'unmatched' });
  });

  await t.test('Place display must agree with composed current address', async () => {
    const candidate = documentedGeocode();
    const provider = providerWith(async (url) => (
      new URL(url).pathname === '/api/search/v4'
        ? jsonResponse([candidate])
        : jsonResponse({ ...documentedPlace, display: '198 Đường Trần Phú,Phường Chợ Quán,Thành Phố Hồ Chí Minh' })
    ));
    assert.deepEqual(await provider.matchLegacyAddress(candidate.display), { status: 'unmatched' });
  });
});

test('legacy address matching treats malformed responses and provider failures as safe outages', async (t) => {
  const secret = 'legacy-matcher-secret-key';

  await t.test('malformed search payload is an outage, not unmatched', async () => {
    const provider = providerWith(async () => jsonResponse({ results: [] }));
    await assert.rejects(provider.matchLegacyAddress('197 Trần Phú'), (error) => {
      assert.equal(error.status, 503);
      assert.equal(error.statusCode, 503);
      assert.equal(error.message, 'Vietnam address provider is unavailable.');
      return true;
    });
  });

  await t.test('malformed Place payload is an outage, not unmatched', async () => {
    const candidate = documentedGeocode();
    const provider = providerWith(async (url) => (
      new URL(url).pathname === '/api/search/v4'
        ? jsonResponse([candidate])
        : new Response('{ malformed json', { status: 200 })
    ), { env: { VIETMAP_API_KEY: secret } });
    await assert.rejects(provider.matchLegacyAddress(candidate.display), (error) => {
      assert.equal(error.statusCode, 503);
      assert.equal(error.message, 'Vietnam address provider is unavailable.');
      assert.doesNotMatch(`${error.message}\n${error.stack}`, /legacy-matcher-secret-key|apikey|maps\.vietmap\.vn/);
      return true;
    });
  });

  await t.test('missing key fails safely before making a request', async () => {
    let fetchCalls = 0;
    const provider = providerWith(async () => {
      fetchCalls += 1;
      return jsonResponse([]);
    }, { env: {} });
    await assert.rejects(provider.matchLegacyAddress('197 Trần Phú'), (error) => {
      assert.equal(error.status, 503);
      assert.equal(error.statusCode, 503);
      assert.doesNotMatch(`${error.message}\n${error.stack}`, /apikey|maps\.vietmap\.vn/);
      return true;
    });
    assert.equal(fetchCalls, 0);
  });

  await t.test('search and Place outages remain safe 503s', async () => {
    const searchFailure = providerWith(async () => jsonResponse({ error: `apikey=${secret}` }, 429), {
      env: { VIETMAP_API_KEY: secret },
    });
    await assert.rejects(searchFailure.matchLegacyAddress('197 Trần Phú'), (error) => {
      assert.equal(error.statusCode, 503);
      assert.doesNotMatch(`${error.message}\n${error.stack}`, /legacy-matcher-secret-key|apikey|maps\.vietmap\.vn/);
      return true;
    });

    const candidate = documentedGeocode();
    const placeFailure = providerWith(async (url) => (
      new URL(url).pathname === '/api/search/v4'
        ? jsonResponse([candidate])
        : jsonResponse({ error: `apikey=${secret}` }, 500)
    ), { env: { VIETMAP_API_KEY: secret } });
    await assert.rejects(placeFailure.matchLegacyAddress(candidate.display), (error) => {
      assert.equal(error.statusCode, 503);
      assert.doesNotMatch(`${error.message}\n${error.stack}`, /legacy-matcher-secret-key|apikey|maps\.vietmap\.vn/);
      return true;
    });
  });
});


test('legacy matching accepts administrative-name spelling variants only when unambiguous', async (t) => {
  const cases = [
    {
      label: 'tone placement',
      dataset: { province: 'Tỉnh Thanh Hoá', ward: 'Xã Hoà Lộc' },
      vietmap: { province: 'Tỉnh Thanh Hóa', ward: 'Xã Hòa Lộc' },
    },
    {
      label: 'hyphen spacing',
      dataset: { province: 'Thành phố Hà Nội', ward: 'Phường Văn Miếu - Quốc Tử Giám' },
      vietmap: { province: 'Thành phố Hà Nội', ward: 'Phường Văn Miếu-Quốc Tử Giám' },
    },
    {
      label: 'reclassified unit types',
      dataset: { province: 'Thành phố Bắc Ninh', ward: 'Phường Kép' },
      vietmap: { province: 'Tỉnh Bắc Ninh', ward: 'Xã Kép' },
    },
  ];

  for (const { label, dataset, vietmap } of cases) {
    await t.test(label, async () => {
      const candidate = {
        ...documentedGeocode(),
        boundaries: [
          { type: 2, full_name: vietmap.ward },
          { type: 0, full_name: vietmap.province },
        ],
      };
      const place = {
        ...documentedPlace,
        city: vietmap.province,
        ward: vietmap.ward,
        display: `${documentedPlace.hs_num} ${documentedPlace.street},${dataset.ward},${dataset.province}`,
      };
      const provider = providerWith(async (url) => (
        new URL(url).pathname === '/api/search/v4'
          ? jsonResponse([candidate])
          : jsonResponse(place)
      ), {
        dataset: {
          ...providerDataset,
          provinces: [{ code: '38', name: dataset.province, type: 'province' }],
          wards: [{ code: '00002', provinceCode: '38', name: dataset.ward, type: 'commune' }],
        },
      });

      assert.deepEqual(await provider.matchLegacyAddress(candidate.display), {
        status: 'matched',
        address: {
          provinceCode: '38',
          provinceName: dataset.province,
          wardCode: '00002',
          wardName: dataset.ward,
          detail: '197 Đường Trần Phú',
        },
      });
    });
  }

  await t.test('a unit type is not ignored when the bare name is ambiguous', async () => {
    let placeCalls = 0;
    const candidate = {
      ...documentedGeocode(),
      boundaries: [
        { type: 2, full_name: 'Thị trấn Kép' },
        { type: 0, full_name: 'Tỉnh Bắc Ninh' },
      ],
    };
    const provider = providerWith(async (url) => {
      if (new URL(url).pathname === '/api/search/v4') return jsonResponse([candidate]);
      placeCalls += 1;
      return jsonResponse(documentedPlace);
    }, {
      dataset: {
        ...providerDataset,
        provinces: [{ code: '24', name: 'Thành phố Bắc Ninh', type: 'province' }],
        wards: [
          { code: '00010', provinceCode: '24', name: 'Phường Kép', type: 'ward' },
          { code: '00011', provinceCode: '24', name: 'Xã Kép', type: 'commune' },
        ],
      },
    });
    assert.deepEqual(await provider.matchLegacyAddress(candidate.display), { status: 'unmatched' });
    assert.equal(placeCalls, 0);
  });
});

test('provider outages and missing credentials fail closed without exposing credentials', async () => {
  const secret = 'secret-vietmap-key-do-not-leak';
  const legacyText = documentedGeocode().display;
  const unavailable = providerWith(async () => {
    throw new Error(`request failed for apikey=${secret}`);
  }, { env: { VIETMAP_API_KEY: secret } });
  await assert.rejects(unavailable.matchLegacyAddress(legacyText), (error) => {
    assert.equal(error.status, 503);
    assert.equal(error.statusCode, 503);
    assert.doesNotMatch(error.message, /secret-vietmap-key-do-not-leak/);
    return true;
  });

  let fetchCalls = 0;
  const missingKey = providerWith(async () => {
    fetchCalls += 1;
    return jsonResponse([]);
  }, { env: {} });
  await assert.rejects(missingKey.matchLegacyAddress(legacyText), (error) => {
    assert.equal(error.statusCode, 503);
    assert.doesNotMatch(error.message, /apikey|test-only-key/i);
    return true;
  });
  assert.equal(fetchCalls, 0);
});

test('provider configuration defaults empty values and rejects unsupported values', async (t) => {
  const secret = 'secret-provider-configuration-key';
  const legacyText = documentedGeocode().display;
  let fetchCalls = 0;
  for (const [label, configuredProvider] of [
    ['unsupported provider', 'other-provider'],
    ['numeric provider', 12],
    ['null provider', null],
  ]) {
    await t.test(label, async () => {
      const provider = providerWith(async () => {
        fetchCalls += 1;
        return jsonResponse(documentedPlace);
      }, { env: { ADDRESS_PROVIDER: configuredProvider, VIETMAP_API_KEY: secret } });
      await assert.rejects(provider.matchLegacyAddress(legacyText), (error) => {
        assert.equal(error.status, 503);
        assert.equal(error.statusCode, 503);
        assert.equal(error.message, 'Vietnam address provider is unavailable.');
        assert.doesNotMatch(`${error.message}\n${error.stack}`, /secret-provider-configuration-key/);
        return true;
      });
    });
  }
  assert.equal(fetchCalls, 0);

  let requestUrl;
  const emptyConfig = providerWith(async (url) => {
    requestUrl = new URL(url);
    return requestUrl.pathname === '/api/search/v4'
      ? jsonResponse([documentedGeocode()])
      : jsonResponse(documentedPlace);
  }, { env: { ADDRESS_PROVIDER: '  ', VIETMAP_API_KEY: secret } });
  assert.deepEqual(await emptyConfig.matchLegacyAddress(legacyText), {
    status: 'matched',
    address: {
      provinceCode: '79',
      provinceName: 'Thành phố Hồ Chí Minh',
      wardCode: '00001',
      wardName: 'Phường Chợ Quán',
      detail: '197 Đường Trần Phú',
    },
  });
  assert.equal(requestUrl.origin, 'https://maps.vietmap.vn');
});

test('Place v4 maps nonexistent valid-looking legacy candidates to unmatched results', async (t) => {
  const secret = 'secret-vietmap-key-for-place-error';
  const candidate = documentedGeocode();
  for (const status of [400, 404]) {
    await t.test(`Place status ${status}`, async () => {
      let requestUrl;
      const provider = providerWith(async (url) => {
        requestUrl = new URL(url);
        return requestUrl.pathname === '/api/search/v4'
          ? jsonResponse([candidate])
          : jsonResponse({ error: `request failed with apikey=${secret}` }, status);
      }, { env: { ADDRESS_PROVIDER: 'vietmap', VIETMAP_API_KEY: secret } });

      assert.deepEqual(await provider.matchLegacyAddress(candidate.display), { status: 'unmatched' });
      assert.equal(requestUrl.pathname, '/api/place/v4');
      assert.equal(requestUrl.searchParams.get('refid'), 'geocode:documented_fixture-ref');
    });
  }
});

test('authentication, rate-limit, and provider failures remain safe outages', async (t) => {
  const secret = 'secret-vietmap-provider-outage';
  const legacyText = documentedGeocode().display;
  for (const status of [401, 429, 500]) {
    await t.test(`provider status ${status}`, async () => {
      const provider = providerWith(async () => jsonResponse({ error: `apikey=${secret}` }, status), {
        env: { ADDRESS_PROVIDER: 'vietmap', VIETMAP_API_KEY: secret },
      });
      await assert.rejects(provider.matchLegacyAddress(legacyText), (error) => {
        assert.equal(error.status, 503);
        assert.equal(error.statusCode, 503);
        assert.equal(error.message, 'Vietnam address provider is unavailable.');
        assert.doesNotMatch(`${error.message}\n${error.stack}`, /secret-vietmap-provider-outage|apikey/);
        return true;
      });
    });
  }
});
