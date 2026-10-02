const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 512;

const makeAddressError = (status, message, errors) => {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  if (Array.isArray(errors)) error.errors = errors;
  return error;
};

const makeValidationError = (validationErrors) => {
  const errors = Object.entries(validationErrors).map(([field, message]) => ({ field, message }));
  return makeAddressError(400, errors[0]?.message || 'Địa chỉ không hợp lệ.', errors);
};

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const createAddressService = ({
  dataset,
  provider,
  validateAddress,
  formatVietnamAddress,
  now = Date.now,
  cacheTtlMs = CACHE_TTL_MS,
  maxCacheEntries = MAX_CACHE_ENTRIES
} = {}) => {
  if (!dataset || !Array.isArray(dataset.provinces) || !Array.isArray(dataset.wards)) {
    throw new TypeError('Vietnam administrative unit data is unavailable');
  }

  const validator = validateAddress || require('../utils/addressValidation').validateAddress;
  const formatter = formatVietnamAddress || require('../utils/addressFormatter').formatVietnamAddress;
  const failValidation = (validationErrors) => {
    throw makeValidationError(validationErrors);
  };
  const provincesByCode = new Map();
  const wardsByCode = new Map();
  for (const province of dataset.provinces) {
    if (isRecord(province) && typeof province.code === 'string' && typeof province.name === 'string') {
      provincesByCode.set(province.code, province);
    }
  }
  for (const ward of dataset.wards) {
    if (isRecord(ward) && typeof ward.code === 'string' && typeof ward.provinceCode === 'string' && typeof ward.name === 'string') {
      wardsByCode.set(ward.code, ward);
    }
  }

  const boundedCacheSize = Number.isInteger(maxCacheEntries) && maxCacheEntries > 0
    ? maxCacheEntries
    : MAX_CACHE_ENTRIES;
  const ttl = Number.isFinite(cacheTtlMs) && cacheTtlMs > 0 ? cacheTtlMs : CACHE_TTL_MS;
  const streetSearchCache = new Map();
  const resolvedStreetCache = new Map();

  const cacheGet = (cache, key) => {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= now()) {
      cache.delete(key);
      return undefined;
    }
    cache.delete(key);
    cache.set(key, entry);
    return entry.value;
  };

  const cacheSet = (cache, key, value) => {
    const time = now();
    for (const [cachedKey, entry] of cache) {
      if (entry.expiresAt <= time) cache.delete(cachedKey);
    }
    cache.delete(key);
    while (cache.size >= boundedCacheSize) {
      cache.delete(cache.keys().next().value);
    }
    cache.set(key, { value, expiresAt: time + ttl });
  };

  const requireProviderMethod = (method) => {
    if (!provider || typeof provider[method] !== 'function') {
      throw makeAddressError(503, 'Dịch vụ tra cứu địa chỉ hiện không khả dụng. Vui lòng thử lại.');
    }
    return provider[method].bind(provider);
  };

  const listProvinces = () => dataset.provinces
    .filter((province) => isRecord(province) && typeof province.code === 'string' && typeof province.name === 'string')
    .map(({ code, name, type }) => ({ code, name, ...(typeof type === 'string' ? { type } : {}) }));

  const listWards = (provinceCode) => {
    if (!isNonEmptyString(provinceCode) || !provincesByCode.has(provinceCode)) {
      throw makeAddressError(400, 'Mã tỉnh/thành phố không hợp lệ');
    }
    return dataset.wards
      .filter((ward) => ward.provinceCode === provinceCode && typeof ward.code === 'string' && typeof ward.name === 'string')
      .map(({ code, provinceCode: parentCode, name, type }) => ({
        code,
        provinceCode: parentCode,
        name,
        ...(typeof type === 'string' ? { type } : {})
      }));
  };

  const searchStreets = async (input = {}) => {
    if (!isRecord(input)) throw makeAddressError(400, 'Thông tin tra cứu đường/phố không hợp lệ');
    const { provinceCode, wardCode, query } = input;
    if (!isNonEmptyString(provinceCode) || !provincesByCode.has(provinceCode)) {
      throw makeAddressError(400, 'Mã tỉnh/thành phố không hợp lệ');
    }
    const ward = typeof wardCode === 'string' ? wardsByCode.get(wardCode) : null;
    if (!ward || ward.provinceCode !== provinceCode) {
      throw makeAddressError(400, 'Phường/xã không thuộc tỉnh/thành phố đã chọn');
    }
    if (typeof query !== 'string') {
      throw makeAddressError(400, 'Từ khóa tìm đường phải là chuỗi');
    }
    const normalizedQuery = query.normalize('NFC').trim().replace(/\s+/gu, ' ');
    if (normalizedQuery.length < 2 || normalizedQuery.length > 100) {
      throw makeAddressError(400, 'Từ khóa tìm đường phải có từ 2 đến 100 ký tự');
    }

    const cacheKey = `${provinceCode}\u0000${wardCode}\u0000${normalizedQuery.toLocaleLowerCase('vi')}`;
    const cached = cacheGet(streetSearchCache, cacheKey);
    if (cached !== undefined) return cached.map((street) => ({ ...street }));

    let results;
    try {
      results = await requireProviderMethod('searchStreets')({ provinceCode, wardCode, query: normalizedQuery });
    } catch (_error) {
      throw makeAddressError(503, 'Không thể tra cứu tên đường lúc này. Vui lòng thử lại.');
    }
    if (!Array.isArray(results)) {
      throw makeAddressError(503, 'Không thể tra cứu tên đường lúc này. Vui lòng thử lại.');
    }

    const safeResults = results
      .filter((street) => isRecord(street) && isNonEmptyString(street.ref) && isNonEmptyString(street.name) && isNonEmptyString(street.displayName))
      .map((street) => ({
        ref: street.ref.trim(),
        name: street.name.trim(),
        displayName: street.displayName.trim()
      }));
    cacheSet(streetSearchCache, cacheKey, safeResults);
    return safeResults.map((street) => ({ ...street }));
  };

  const resolveAddress = async (input, { required = false } = {}) => {
    if (input === null || input === undefined) {
      if (!required) return null;
      failValidation(validator({}, { required }));
    }
    if (!isRecord(input)) {
      failValidation(validator(input, { required }));
    }

    const validationInput = {};
    for (const field of ['provinceCode', 'wardCode', 'streetRef', 'detail']) {
      if (Object.prototype.hasOwnProperty.call(input, field)) validationInput[field] = input[field];
    }
    const validationErrors = validator(validationInput, { required });
    if (isRecord(validationErrors) && Object.keys(validationErrors).length > 0) {
      failValidation(validationErrors);
    }
    const hasAddressValue = ['provinceCode', 'wardCode', 'streetRef', 'detail'].some((field) => isNonEmptyString(input[field]));
    if (!hasAddressValue && !required) return null;

    const province = typeof input.provinceCode === 'string' ? provincesByCode.get(input.provinceCode) : null;
    if (!province) throw makeAddressError(400, 'Tỉnh/thành phố không hợp lệ');
    const ward = typeof input.wardCode === 'string' ? wardsByCode.get(input.wardCode) : null;
    if (!ward || ward.provinceCode !== province.code) {
      throw makeAddressError(400, 'Phường/xã không thuộc tỉnh/thành phố đã chọn');
    }
    if (!isNonEmptyString(input.streetRef)) {
      throw makeAddressError(400, 'Đường/phố phải được chọn từ danh sách tra cứu');
    }

    const streetRef = input.streetRef.trim();
    let street = cacheGet(resolvedStreetCache, streetRef);
    if (street === undefined) {
      try {
        street = await requireProviderMethod('resolveStreet')(streetRef);
      } catch (error) {
        const status = error && (error.statusCode || error.status);
        if (status === 400 || status === 404 || status === 422) {
          throw makeAddressError(400, 'Đường/phố đã chọn không hợp lệ; vui lòng tra cứu lại');
        }
        throw makeAddressError(503, 'Không thể xác thực địa chỉ lúc này. Vui lòng thử lại.');
      }
      if (!isRecord(street)) {
        throw makeAddressError(400, 'Đường/phố đã chọn không hợp lệ; vui lòng tra cứu lại');
      }
      const canonicalStreetName = isNonEmptyString(street.name) ? street.name.trim() : '';
      if (
        street.ref !== streetRef ||
        !canonicalStreetName ||
        street.provinceCode !== province.code ||
        street.wardCode !== ward.code
      ) {
        throw makeAddressError(400, 'Đường/phố không thuộc phường/xã đã chọn');
      }
      street = { ref: streetRef, name: canonicalStreetName, provinceCode: street.provinceCode, wardCode: street.wardCode };
      cacheSet(resolvedStreetCache, streetRef, street);
    } else if (street.provinceCode !== province.code || street.wardCode !== ward.code) {
      throw makeAddressError(400, 'Đường/phố không thuộc phường/xã đã chọn');
    }

    const address = {
      provinceCode: province.code,
      provinceName: province.name,
      wardCode: ward.code,
      wardName: ward.name,
      streetRef: street.ref,
      streetName: street.name,
      detail: input.detail.trim()
    };
    const formatted = formatter(address);
    if (typeof formatted !== 'string' || formatted.trim().length < 12) {
      throw makeAddressError(400, 'Địa chỉ phải có ít nhất 12 ký tự.');
    }
    return address;
  };

  const toUserAddressFields = (address) => {
    if (address === null || address === undefined) {
      return {
        address: null,
        addressProvinceCode: null,
        addressProvinceName: null,
        addressWardCode: null,
        addressWardName: null,
        addressStreetRef: null,
        addressStreetName: null,
        addressDetail: null
      };
    }
    const canonicalAddress = formatter(address);
    return {
      address: canonicalAddress,
      addressProvinceCode: address.provinceCode,
      addressProvinceName: address.provinceName,
      addressWardCode: address.wardCode,
      addressWardName: address.wardName,
      addressStreetRef: address.streetRef,
      addressStreetName: address.streetName,
      addressDetail: address.detail
    };
  };

  const toOrderAddressFields = (address) => {
    if (address === null || address === undefined) {
      return {
        shippingAddress: null,
        shippingProvinceCode: null,
        shippingProvinceName: null,
        shippingWardCode: null,
        shippingWardName: null,
        shippingStreetRef: null,
        shippingStreetName: null,
        shippingAddressDetail: null
      };
    }
    const canonicalAddress = formatter(address);
    return {
      shippingAddress: canonicalAddress,
      shippingProvinceCode: address.provinceCode,
      shippingProvinceName: address.provinceName,
      shippingWardCode: address.wardCode,
      shippingWardName: address.wardName,
      shippingStreetRef: address.streetRef,
      shippingStreetName: address.streetName,
      shippingAddressDetail: address.detail
    };
  };

  return { listProvinces, listWards, searchStreets, resolveAddress, toUserAddressFields, toOrderAddressFields };
};

let defaultService;
const getDefaultService = () => {
  if (!defaultService) {
    const dataset = require('../data/vietnamAdministrativeUnits.json');
    const provider = require('./addressProvider.service');
    defaultService = createAddressService({ dataset, provider });
  }
  return defaultService;
};

module.exports = {
  createAddressService,
  listProvinces: (...args) => getDefaultService().listProvinces(...args),
  listWards: (...args) => getDefaultService().listWards(...args),
  searchStreets: (...args) => getDefaultService().searchStreets(...args),
  resolveAddress: (...args) => getDefaultService().resolveAddress(...args),
  toUserAddressFields: (...args) => getDefaultService().toUserAddressFields(...args),
  toOrderAddressFields: (...args) => getDefaultService().toOrderAddressFields(...args)
};