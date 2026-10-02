'use strict';

const vietnamAdministrativeUnits = require('../data/vietnamAdministrativeUnits.json');

const API_ORIGIN = 'https://maps.vietmap.vn';
const MAX_REF_LENGTH = 520;
const MAX_LEGACY_ADDRESS_LENGTH = 512;
const MAX_RESPONSE_BYTES = 256 * 1024;
const MAX_RESULTS = 10;
const REQUEST_TIMEOUT_MS = 5000;
const PROVIDER_ERROR = 'Vietnam address provider is unavailable.';
const INVALID_ADDRESS_ERROR = 'Address is invalid or does not identify a current address.';

function addressError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  return error;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizedName(value) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('vi');
}

// VietMap and the bundled dataset spell some names differently: old vs new tone-mark
// placement ("Hoà"/"Hòa"), hyphen spacing, and unit type after reclassification
// ("Thành phố Quảng Ninh"/"Tỉnh Quảng Ninh", "Phường Kép"/"Xã Kép").
const TONE_PLACEMENT = [
  ['oà', 'òa'], ['oá', 'óa'], ['oả', 'ỏa'], ['oã', 'õa'], ['oạ', 'ọa'],
  ['oè', 'òe'], ['oé', 'óe'], ['oẻ', 'ỏe'], ['oẽ', 'õe'], ['oẹ', 'ọe'],
  ['uỳ', 'ùy'], ['uý', 'úy'], ['uỷ', 'ủy'], ['uỹ', 'ũy'], ['uỵ', 'ụy'],
];
const PROVINCE_TYPE_PREFIX = /^(?:tỉnh|thành phố)\s+/u;
const WARD_TYPE_PREFIX = /^(?:phường|xã|đặc khu|thị trấn)\s+/u;

function canonicalAdminName(value) {
  let name = normalizedName(value);
  for (const [oldStyle, newStyle] of TONE_PLACEMENT) name = name.replaceAll(oldStyle, newStyle);
  return name.replace(/\s*-\s*/gu, '-');
}


async function readJsonResponse(response) {
  const contentLength = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
    throw new Error('Response too large');
  }

  if (response.body?.getReader) {
    const reader = response.body.getReader();
    const chunks = [];
    let byteLength = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        byteLength += value.byteLength;
        if (byteLength > MAX_RESPONSE_BYTES) {
          await reader.cancel();
          throw new Error('Response too large');
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock?.();
    }

    const bytes = new Uint8Array(byteLength);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  const text = await response.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_RESPONSE_BYTES) {
    throw new Error('Response too large');
  }
  return JSON.parse(text);
}

function createAddressProvider({
  fetchImpl = globalThis.fetch,
  env = process.env,
  dataset = vietnamAdministrativeUnits,
} = {}) {
  const provinces = Array.isArray(dataset?.provinces) ? dataset.provinces : [];
  const wards = Array.isArray(dataset?.wards) ? dataset.wards : [];

  function apiKey() {
    const configuredProvider = env?.ADDRESS_PROVIDER;
    if (configuredProvider !== undefined) {
      if (typeof configuredProvider !== 'string') throw addressError(503, PROVIDER_ERROR);
      const provider = configuredProvider.trim();
      if (provider && provider !== 'vietmap') throw addressError(503, PROVIDER_ERROR);
    }

    const key = typeof env?.VIETMAP_API_KEY === 'string' ? env.VIETMAP_API_KEY.trim() : '';
    if (!key) throw addressError(503, PROVIDER_ERROR);
    return key;
  }

  function provinceByCode(code) {
    if (typeof code !== 'string' || !code) return null;
    const matches = provinces.filter((province) => province?.code === code && typeof province.name === 'string');
    return matches.length === 1 ? matches[0] : null;
  }

  function wardByCode(code, provinceCode) {
    if (typeof code !== 'string' || !code) return null;
    const matches = wards.filter((ward) => ward?.code === code
      && ward?.provinceCode === provinceCode
      && typeof ward.name === 'string');
    return matches.length === 1 ? matches[0] : null;
  }


  // Exact canonical match first; otherwise ignore the unit type, but only when that is unambiguous.
  function uniqueByName(units, fullName, typePrefix) {
    const key = canonicalAdminName(fullName);
    if (!key) return null;
    const exact = units.filter((unit) => canonicalAdminName(unit?.name) === key);
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) return null;
    const bareKey = key.replace(typePrefix, '');
    const loose = units.filter((unit) => canonicalAdminName(unit?.name).replace(typePrefix, '') === bareKey);
    return loose.length === 1 ? loose[0] : null;
  }

  function mapNewBoundaries(boundaries) {
    if (!Array.isArray(boundaries) || boundaries.length !== 2) return null;
    const wardBoundaries = boundaries.filter((boundary) => boundary?.type === 2);
    const provinceBoundaries = boundaries.filter((boundary) => boundary?.type === 0);
    if (wardBoundaries.length !== 1 || provinceBoundaries.length !== 1) return null;

    const province = uniqueByName(provinces, provinceBoundaries[0].full_name, PROVINCE_TYPE_PREFIX);
    if (!province || typeof province.code !== 'string') return null;
    const ward = uniqueByName(
      wards.filter((unit) => unit?.provinceCode === province.code),
      wardBoundaries[0].full_name,
      WARD_TYPE_PREFIX
    );
    if (!ward || typeof ward.code !== 'string') return null;
    return { provinceCode: province.code, wardCode: ward.code };
  }

  function mapPlaceArea(place) {
    if (place.district_id !== 0 || place.district !== '') return null;
    const province = uniqueByName(provinces, place.city, PROVINCE_TYPE_PREFIX);
    if (!province || typeof province.code !== 'string') return null;
    const ward = uniqueByName(
      wards.filter((unit) => unit?.provinceCode === province.code),
      place.ward,
      WARD_TYPE_PREFIX
    );
    if (!ward || typeof ward.code !== 'string') return null;
    return { provinceCode: province.code, wardCode: ward.code };
  }

  function normalizedAddress(value) {
    if (typeof value !== 'string') return '';
    return value.normalize('NFC')
      .trim()
      .replace(/\s*,\s*/gu, ',')
      .replace(/\s+/gu, ' ')
      .toLocaleLowerCase('vi');
  }

  async function loadCurrentAddressPlace(ref) {
    const place = await requestJson('/api/place/v4', { refid: ref });
    if (!isRecord(place)
      || typeof place.street !== 'string'
      || !place.street.trim()
      || place.street.trim().length > 256
      || typeof place.name !== 'string'
      || place.name.trim() !== '') {
      throw addressError(400, INVALID_ADDRESS_ERROR);
    }

    const area = mapPlaceArea(place);
    const houseNumber = typeof place.hs_num === 'string' ? place.hs_num.trim() : '';
    if (!area || !houseNumber) throw addressError(400, INVALID_ADDRESS_ERROR);
    return { place, area, detail: `${houseNumber} ${place.street.trim()}` };
  }

  async function matchLegacyAddress(legacyText) {
    apiKey();
    if (typeof legacyText !== 'string') return { status: 'unmatched' };
    const query = legacyText.normalize('NFC').trim().replace(/\s+/gu, ' ');
    const queryKey = normalizedAddress(query);
    if (!queryKey || query.length > MAX_LEGACY_ADDRESS_LENGTH) return { status: 'unmatched' };

    const results = await requestJson('/api/search/v4', {
      text: query,
      layers: 'ADDRESS',
      display_type: '5',
    });
    if (!Array.isArray(results)) throw addressError(503, PROVIDER_ERROR);

    const matches = new Map();
    const seenRefs = new Set();
    for (const candidate of results.slice(0, MAX_RESULTS)) {
      if (!isRecord(candidate)
        || typeof candidate.display !== 'string'
        || !candidate.display.trim()
        || !Array.isArray(candidate.categories)
        || candidate.categories.length !== 0
        || (queryKey !== normalizedAddress(candidate.display)
          && queryKey !== normalizedAddress(candidate.data_old?.display))
        || !validRef(candidate.ref_id)
        || seenRefs.has(candidate.ref_id)) continue;

      const boundaryArea = mapNewBoundaries(candidate.boundaries);
      if (!boundaryArea) continue;

      let current;
      try {
        current = await loadCurrentAddressPlace(candidate.ref_id);
      } catch (error) {
        if (error.statusCode === 400) continue;
        throw error;
      }
      if (current.area.provinceCode !== boundaryArea.provinceCode
        || current.area.wardCode !== boundaryArea.wardCode) continue;

      const province = provinceByCode(current.area.provinceCode);
      const ward = wardByCode(current.area.wardCode, current.area.provinceCode);
      if (!province || !ward) continue;
      const composedDisplay = `${current.detail},${ward.name},${province.name}`;
      if (normalizedAddress(current.place.display) !== normalizedAddress(composedDisplay)) continue;

      matches.set(candidate.ref_id, {
        provinceCode: province.code,
        provinceName: province.name,
        wardCode: ward.code,
        wardName: ward.name,
        detail: current.detail,
      });
      seenRefs.add(candidate.ref_id);
    }

    if (matches.size > 1) return { status: 'ambiguous' };
    if (matches.size === 0) return { status: 'unmatched' };
    return { status: 'matched', address: matches.values().next().value };
  }

  async function requestJson(path, params) {
    const key = apiKey();
    if (typeof fetchImpl !== 'function') throw addressError(503, PROVIDER_ERROR);

    const url = new URL(path, API_ORIGIN);
    url.searchParams.set('apikey', key);
    for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    timeout.unref?.();
    try {
      let response;
      try {
        response = await fetchImpl(url.toString(), { method: 'GET', signal: controller.signal });
      } catch {
        throw addressError(503, PROVIDER_ERROR);
      }

      let status;
      let ok;
      try {
        status = response?.status;
        ok = response?.ok;
      } catch {
        throw addressError(503, PROVIDER_ERROR);
      }
      if (!ok) {
        if (path === '/api/place/v4' && (status === 400 || status === 404)) {
          throw addressError(400, INVALID_ADDRESS_ERROR);
        }
        throw addressError(503, PROVIDER_ERROR);
      }

      try {
        return await readJsonResponse(response);
      } catch {
        throw addressError(503, PROVIDER_ERROR);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  function validRef(ref) {
    return typeof ref === 'string'
      && ref.length <= MAX_REF_LENGTH
      && /^(?:auto|geocode):[A-Za-z0-9_-]{1,512}$/u.test(ref);
  }


  return { matchLegacyAddress };
}

const productionProvider = createAddressProvider();

module.exports = {
  createAddressProvider,
  matchLegacyAddress: (legacyText) => productionProvider.matchLegacyAddress(legacyText),
};

