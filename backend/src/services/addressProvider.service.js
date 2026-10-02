'use strict';

const vietnamAdministrativeUnits = require('../data/vietnamAdministrativeUnits.json');

const API_ORIGIN = 'https://maps.vietmap.vn';
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;
const MAX_QUERY_LENGTH = 120;
const MAX_REF_LENGTH = 520;
const MAX_LEGACY_ADDRESS_LENGTH = 512;
const MAX_RESPONSE_BYTES = 256 * 1024;
const MAX_RESULTS = 10;
const REQUEST_TIMEOUT_MS = 5000;
const PROVIDER_ERROR = 'Vietnam address provider is unavailable.';
const INVALID_STREET_ERROR = 'Street reference is invalid or does not identify a current street address.';

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

function cloneStreet(street) {
  return { ...street };
}

function cacheGet(cache, key, now) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    cache.delete(key);
    return null;
  }

  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function cacheSet(cache, key, value, now) {
  cache.delete(key);
  cache.set(key, { value, expiresAt: now() + CACHE_TTL_MS });
  if (cache.size > CACHE_MAX_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
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
  now = Date.now,
  dataset = vietnamAdministrativeUnits,
} = {}) {
  const provinces = Array.isArray(dataset?.provinces) ? dataset.provinces : [];
  const wards = Array.isArray(dataset?.wards) ? dataset.wards : [];
  const searchCache = new Map();
  const resolvedCache = new Map();

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

  function selectedArea(provinceCode, wardCode) {
    const province = provinceByCode(provinceCode);
    const ward = wardByCode(wardCode, provinceCode);
    if (!province || !ward) throw addressError(400, 'Province or ward is invalid.');
    return { province, ward };
  }

  function uniqueByName(units, fullName) {
    const key = normalizedName(fullName);
    if (!key) return null;
    const matches = units.filter((unit) => normalizedName(unit?.name) === key);
    return matches.length === 1 ? matches[0] : null;
  }

  function mapNewBoundaries(boundaries) {
    if (!Array.isArray(boundaries) || boundaries.length !== 2) return null;
    const wardBoundaries = boundaries.filter((boundary) => boundary?.type === 2);
    const provinceBoundaries = boundaries.filter((boundary) => boundary?.type === 0);
    if (wardBoundaries.length !== 1 || provinceBoundaries.length !== 1) return null;

    const province = uniqueByName(provinces, provinceBoundaries[0].full_name);
    if (!province || typeof province.code !== 'string') return null;
    const ward = uniqueByName(
      wards.filter((unit) => unit?.provinceCode === province.code),
      wardBoundaries[0].full_name
    );
    if (!ward || typeof ward.code !== 'string') return null;
    return { provinceCode: province.code, wardCode: ward.code };
  }

  function mapPlaceArea(place) {
    if (place.district_id !== 0 || place.district !== '') return null;
    const province = uniqueByName(provinces, place.city);
    if (!province || typeof province.code !== 'string') return null;
    const ward = uniqueByName(
      wards.filter((unit) => unit?.provinceCode === province.code),
      place.ward
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

  async function loadCurrentStreetPlace(ref) {
    const place = await requestJson('/api/place/v4', { refid: ref });
    if (!isRecord(place)
      || typeof place.street !== 'string'
      || !place.street.trim()
      || place.street.trim().length > 256
      || typeof place.name !== 'string'
      || place.name.trim() !== '') {
      throw addressError(400, INVALID_STREET_ERROR);
    }

    const area = mapPlaceArea(place);
    if (!area) throw addressError(400, INVALID_STREET_ERROR);
    const displayName = typeof place.display === 'string' && place.display.trim()
      ? place.display.trim().slice(0, 512)
      : place.street.trim();
    return { place, area, streetName: place.street.trim(), displayName };
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
        current = await loadCurrentStreetPlace(candidate.ref_id);
      } catch (error) {
        if (error.statusCode === 400) continue;
        throw error;
      }
      if (current.area.provinceCode !== boundaryArea.provinceCode
        || current.area.wardCode !== boundaryArea.wardCode) continue;

      const detail = typeof current.place.hs_num === 'string' ? current.place.hs_num.trim() : '';
      if (!detail) continue;
      const province = provinceByCode(current.area.provinceCode);
      const ward = wardByCode(current.area.wardCode, current.area.provinceCode);
      if (!province || !ward) continue;
      const composedDisplay = `${detail} ${current.streetName},${ward.name},${province.name}`;
      if (normalizedAddress(current.place.display) !== normalizedAddress(composedDisplay)) continue;

      matches.set(candidate.ref_id, {
        provinceCode: province.code,
        provinceName: province.name,
        wardCode: ward.code,
        wardName: ward.name,
        streetRef: candidate.ref_id,
        streetName: current.streetName,
        detail,
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
          throw addressError(400, INVALID_STREET_ERROR);
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

  async function resolveStreet(ref) {
    apiKey();
    if (!validRef(ref)) throw addressError(400, INVALID_STREET_ERROR);

    const cached = cacheGet(resolvedCache, ref, now);
    if (cached) return cloneStreet(cached);

    const current = await loadCurrentStreetPlace(ref);
    const resolved = {
      ref,
      name: current.streetName,
      displayName: current.displayName,
      provinceCode: current.area.provinceCode,
      wardCode: current.area.wardCode,
    };
    cacheSet(resolvedCache, ref, resolved, now);
    return cloneStreet(resolved);
  }

  async function searchStreets(input) {
    apiKey();
    if (!isRecord(input)) throw addressError(400, 'Street search input is invalid.');
    const { provinceCode, wardCode } = input;
    const { province, ward } = selectedArea(provinceCode, wardCode);
    if (typeof input.query !== 'string') throw addressError(400, 'Street query is invalid.');
    const query = input.query.normalize('NFC').trim().replace(/\s+/gu, ' ');
    if (query.length < 2 || query.length > MAX_QUERY_LENGTH) {
      throw addressError(400, 'Street query is invalid.');
    }

    const cacheKey = `${provinceCode}\u0000${wardCode}\u0000${normalizedName(query)}`;
    const cached = cacheGet(searchCache, cacheKey, now);
    if (cached) return cached.map(cloneStreet);

    const contextualQuery = `${query}, ${ward.name}, ${province.name}`;
    const suggestions = await requestJson('/api/autocomplete/v4', {
      text: contextualQuery,
      display_type: '1',
      layers: 'STREET',
    });
    if (!Array.isArray(suggestions)) throw addressError(503, PROVIDER_ERROR);

    const verified = [];
    const seenRefs = new Set();
    for (const suggestion of suggestions.slice(0, MAX_RESULTS)) {
      if (!isRecord(suggestion) || !validRef(suggestion.ref_id) || seenRefs.has(suggestion.ref_id)) continue;
      const boundaryArea = mapNewBoundaries(suggestion.boundaries);
      if (!boundaryArea
        || boundaryArea.provinceCode !== provinceCode
        || boundaryArea.wardCode !== wardCode) continue;

      seenRefs.add(suggestion.ref_id);
      let resolved;
      try {
        resolved = await resolveStreet(suggestion.ref_id);
      } catch (error) {
        if (error.statusCode === 400) continue;
        throw error;
      }
      if (resolved.provinceCode !== provinceCode || resolved.wardCode !== wardCode) continue;
      verified.push({ ref: resolved.ref, name: resolved.name, displayName: resolved.displayName });
    }

    cacheSet(searchCache, cacheKey, verified, now);
    return verified.map(cloneStreet);
  }

  return { searchStreets, resolveStreet, matchLegacyAddress };
}

const productionProvider = createAddressProvider();

module.exports = {
  createAddressProvider,
  searchStreets: (input) => productionProvider.searchStreets(input),
  resolveStreet: (ref) => productionProvider.resolveStreet(ref),
  matchLegacyAddress: (legacyText) => productionProvider.matchLegacyAddress(legacyText),
};

