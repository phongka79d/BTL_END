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

const documentedAutocomplete = (ref = 'auto:documented_fixture-ref') => ([{
  ref_id: ref,
  distance: 0.05,
  address: 'Phường Chợ Quán,Thành Phố Hồ Chí Minh',
  name: '197 Trần Phú',
  display: '197 Trần Phú Phường Chợ Quán,Thành Phố Hồ Chí Minh',
  boundaries: [
    { type: 2, id: 18700, name: 'Chợ Quán', prefix: 'Phường', full_name: 'Phường Chợ Quán' },
    { type: 0, id: 12, name: 'Hồ Chí Minh', prefix: 'Thành Phố', full_name: 'Thành Phố Hồ Chí Minh' },
  ],
  categories: [],
  entry_points: [],
}]);

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
  boundaries: documentedAutocomplete()[0].boundaries,
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
    streetRef: 'geocode:documented_fixture-ref',
    streetName: 'Đường Trần Phú',
    detail: '197',
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
        assert.equal(requestUrl.searchParams.get('refid'), expected.streetRef);
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

test('search contextualizes v4 STREET results and returns only Place-verified local area matches', async () => {
  const requests = [];
  const fetchImpl = async (url) => {
    const requestUrl = new URL(url);
    requests.push(requestUrl);
    if (requestUrl.pathname.endsWith('/autocomplete/v4')) {
      const mismatched = documentedAutocomplete('auto:wrong_area')[0];
      mismatched.boundaries[0].full_name = 'Phường Tân Định';
      const legacy = documentedAutocomplete('auto:legacy_area')[0];
      legacy.boundaries.splice(1, 0, {
        type: 1, id: 1292, name: '5', prefix: 'Quận', full_name: 'Quận 5',
      });
      return jsonResponse([...documentedAutocomplete(), mismatched, legacy]);
    }
    assert.equal(requestUrl.pathname, '/api/place/v4');
    assert.equal(requestUrl.searchParams.get('refid'), 'auto:documented_fixture-ref');
    return jsonResponse(documentedPlace);
  };

  const provider = providerWith(fetchImpl);
  const results = await provider.searchStreets({ provinceCode: '79', wardCode: '00001', query: '  tran phu  ' });

  assert.deepEqual(results, [{
    ref: 'auto:documented_fixture-ref',
    name: 'Đường Trần Phú',
    displayName: documentedPlace.display,
  }]);
  assert.equal(requests.length, 2);
  const autocomplete = requests[0];
  assert.equal(autocomplete.searchParams.get('display_type'), '1');
  assert.equal(autocomplete.searchParams.get('layers'), 'STREET');
  assert.equal(autocomplete.searchParams.get('text'), 'tran phu, Phường Chợ Quán, Thành phố Hồ Chí Minh');
  assert.equal(autocomplete.searchParams.has('cityId'), false);
  assert.equal(autocomplete.searchParams.has('wardId'), false);
  assert.equal(autocomplete.searchParams.get('apikey'), 'test-only-key');
});

test('Place v4 cannot validate forged or old-format refs and POIs are rejected', async (t) => {
  await t.test('mismatched Place boundary names fail with a safe client error', async () => {
    const provider = providerWith(async () => jsonResponse({
      ...documentedPlace,
      city: 'Thành phố Hà Nội',
    }));
    await assert.rejects(provider.resolveStreet('auto:forged-ref'), (error) => {
      assert.equal(error.status, 400);
      assert.equal(error.statusCode, 400);
      return true;
    });
  });

  await t.test('old district format is rejected', async () => {
    const provider = providerWith(async () => jsonResponse({
      ...documentedPlace,
      district_id: 1292,
      district: 'Quận 5',
    }));
    await assert.rejects(provider.resolveStreet('auto:old-format-ref'), (error) => error.statusCode === 400);
  });

  await t.test('a POI result is not accepted as a street', async () => {
    const provider = providerWith(async () => jsonResponse({ ...documentedPlace, name: 'Cửa hàng' }));
    await assert.rejects(provider.resolveStreet('auto:poi-ref'), (error) => error.statusCode === 400);
  });
});

test('ambiguous local boundary mapping is rejected without resolving any candidate ref', async () => {
  let requests = 0;
  const duplicateWardDataset = {
    ...providerDataset,
    wards: [
      ...providerDataset.wards,
      { code: '00002', provinceCode: '79', name: 'Phường Chợ Quán', type: 'ward' },
    ],
  };
  const provider = providerWith(async () => {
    requests += 1;
    return jsonResponse(documentedAutocomplete());
  }, { dataset: duplicateWardDataset });

  assert.deepEqual(await provider.searchStreets({ provinceCode: '79', wardCode: '00001', query: 'le loi' }), []);
  assert.equal(requests, 1);
});

test('provider outages and missing credentials fail closed without exposing credentials', async () => {
  const secret = 'secret-vietmap-key-do-not-leak';
  const unavailable = providerWith(async () => {
    throw new Error(`request failed for apikey=${secret}`);
  }, { env: { VIETMAP_API_KEY: secret } });
  await assert.rejects(unavailable.searchStreets({ provinceCode: '79', wardCode: '00001', query: 'le loi' }), (error) => {
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
  await assert.rejects(missingKey.resolveStreet('auto:valid-looking-ref'), (error) => {
    assert.equal(error.statusCode, 503);
    assert.doesNotMatch(error.message, /apikey|test-only-key/i);
    return true;
  });
  assert.equal(fetchCalls, 0);
});

test('provider configuration defaults empty values and rejects unsupported values', async (t) => {
  const secret = 'secret-provider-configuration-key';
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
      await assert.rejects(provider.resolveStreet('auto:valid-looking-ref'), (error) => {
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
    return jsonResponse(documentedPlace);
  }, { env: { ADDRESS_PROVIDER: '  ', VIETMAP_API_KEY: secret } });
  assert.deepEqual(await emptyConfig.resolveStreet('auto:empty-provider-config'), {
    ref: 'auto:empty-provider-config',
    name: 'Đường Trần Phú',
    displayName: documentedPlace.display,
    provinceCode: '79',
    wardCode: '00001',
  });
  assert.equal(requestUrl.origin, 'https://maps.vietmap.vn');
});

test('Place v4 maps nonexistent valid-looking refs to safe client errors', async (t) => {
  const secret = 'secret-vietmap-key-for-place-error';
  for (const status of [400, 404]) {
    await t.test(`Place status ${status}`, async () => {
      let requestUrl;
      const provider = providerWith(async (url) => {
        requestUrl = new URL(url);
        return jsonResponse({ error: `request failed with apikey=${secret}` }, status);
      }, { env: { ADDRESS_PROVIDER: 'vietmap', VIETMAP_API_KEY: secret } });

      await assert.rejects(provider.resolveStreet('auto:valid-looking-ref'), (error) => {
        assert.equal(error.status, 400);
        assert.equal(error.statusCode, 400);
        assert.equal(error.message, 'Street reference is invalid or does not identify a current street address.');
        assert.doesNotMatch(`${error.message}\n${error.stack}`, /secret-vietmap-key-for-place-error|apikey|maps\.vietmap\.vn/);
        return true;
      });
      assert.equal(requestUrl.pathname, '/api/place/v4');
      assert.equal(requestUrl.searchParams.get('refid'), 'auto:valid-looking-ref');
    });
  }
});

test('authentication, rate-limit, and provider failures remain safe outages', async (t) => {
  const secret = 'secret-vietmap-provider-outage';
  for (const status of [401, 429, 500]) {
    await t.test(`provider status ${status}`, async () => {
      const provider = providerWith(async () => jsonResponse({ error: `apikey=${secret}` }, status), {
        env: { ADDRESS_PROVIDER: 'vietmap', VIETMAP_API_KEY: secret },
      });
      await assert.rejects(provider.resolveStreet('auto:valid-looking-ref'), (error) => {
        assert.equal(error.status, 503);
        assert.equal(error.statusCode, 503);
        assert.equal(error.message, 'Vietnam address provider is unavailable.');
        assert.doesNotMatch(`${error.message}\n${error.stack}`, /secret-vietmap-provider-outage|apikey/);
        return true;
      });
    });
  }
});

test('search and resolved-ref caches are bounded by the 30-minute TTL', async () => {
  let currentTime = 1_000;
  let autocompleteCalls = 0;
  let placeCalls = 0;
  const fetchImpl = async (url) => {
    const pathname = new URL(url).pathname;
    if (pathname.endsWith('/autocomplete/v4')) {
      autocompleteCalls += 1;
      return jsonResponse(documentedAutocomplete());
    }
    placeCalls += 1;
    return jsonResponse(documentedPlace);
  };
  const provider = providerWith(fetchImpl, { now: () => currentTime });

  const initial = await provider.searchStreets({ provinceCode: '79', wardCode: '00001', query: 'le loi' });
  initial[0].name = 'caller mutation';
  assert.deepEqual(await provider.searchStreets({ provinceCode: '79', wardCode: '00001', query: 'le loi' }), [{
    ref: 'auto:documented_fixture-ref',
    name: 'Đường Trần Phú',
    displayName: documentedPlace.display,
  }]);
  await provider.searchStreets({ provinceCode: '79', wardCode: '00001', query: 'tran phu' });
  assert.equal(autocompleteCalls, 2);
  assert.equal(placeCalls, 1);

  currentTime += 30 * 60 * 1000 + 1;
  await provider.searchStreets({ provinceCode: '79', wardCode: '00001', query: 'le loi' });
  assert.equal(autocompleteCalls, 3);
  assert.equal(placeCalls, 2);
});

