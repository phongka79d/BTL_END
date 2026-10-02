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
  validateAddress,
  formatVietnamAddress,
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


  const resolveAddress = async (input, { required = false } = {}) => {
    if (input === null || input === undefined) {
      if (!required) return null;
      failValidation(validator({}, { required }));
    }
    if (!isRecord(input)) {
      failValidation(validator(input, { required }));
    }

    const validationInput = {};
    for (const field of ['provinceCode', 'wardCode', 'detail']) {
      if (Object.prototype.hasOwnProperty.call(input, field)) validationInput[field] = input[field];
    }
    const validationErrors = validator(validationInput, { required });
    if (isRecord(validationErrors) && Object.keys(validationErrors).length > 0) {
      failValidation(validationErrors);
    }
    const hasAddressValue = ['provinceCode', 'wardCode', 'detail'].some((field) => isNonEmptyString(input[field]));
    if (!hasAddressValue && !required) return null;

    const province = typeof input.provinceCode === 'string' ? provincesByCode.get(input.provinceCode) : null;
    if (!province) {
      failValidation({ provinceCode: 'Tỉnh/thành phố không hợp lệ' });
    }
    const ward = typeof input.wardCode === 'string' ? wardsByCode.get(input.wardCode) : null;
    if (!ward || ward.provinceCode !== province.code) {
      failValidation({ wardCode: 'Phường/xã không thuộc tỉnh/thành phố đã chọn' });
    }

    const address = {
      provinceCode: province.code,
      provinceName: province.name,
      wardCode: ward.code,
      wardName: ward.name,
      detail: input.detail.trim()
    };
    const formatted = formatter(address);
    if (typeof formatted !== 'string' || formatted.trim().length < 12) {
      throw makeAddressError(400, 'Địa chỉ phải có ít nhất 12 ký tự.', [
        { field: 'address', message: 'Địa chỉ phải có ít nhất 12 ký tự.' }
      ]);
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
        addressDetail: null
      };
    }
    return {
      address: formatter(address),
      addressProvinceCode: address.provinceCode,
      addressProvinceName: address.provinceName,
      addressWardCode: address.wardCode,
      addressWardName: address.wardName,
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
        shippingAddressDetail: null
      };
    }
    return {
      shippingAddress: formatter(address),
      shippingProvinceCode: address.provinceCode,
      shippingProvinceName: address.provinceName,
      shippingWardCode: address.wardCode,
      shippingWardName: address.wardName,
      shippingAddressDetail: address.detail
    };
  };

  return { listProvinces, listWards, resolveAddress, toUserAddressFields, toOrderAddressFields };
};


let defaultService;
const getDefaultService = () => {
  if (!defaultService) {
    const dataset = require('../data/vietnamAdministrativeUnits.json');
    defaultService = createAddressService({ dataset });
  }
  return defaultService;
};

module.exports = {
  createAddressService,
  listProvinces: (...args) => getDefaultService().listProvinces(...args),
  listWards: (...args) => getDefaultService().listWards(...args),
  resolveAddress: (...args) => getDefaultService().resolveAddress(...args),
  toUserAddressFields: (...args) => getDefaultService().toUserAddressFields(...args),
  toOrderAddressFields: (...args) => getDefaultService().toOrderAddressFields(...args)
};