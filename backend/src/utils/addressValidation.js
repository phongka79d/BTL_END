const { formatVietnamAddress } = require('./addressFormatter');

const ADDRESS_PROVINCE_REQUIRED_MESSAGE = 'Vui lòng chọn Tỉnh/Thành phố.';
const ADDRESS_WARD_REQUIRED_MESSAGE = 'Vui lòng chọn Phường/Xã.';
const ADDRESS_STREET_REQUIRED_MESSAGE = 'Vui lòng chọn Đường/Phố.';
const ADDRESS_DETAIL_REQUIRED_MESSAGE = 'Vui lòng nhập số nhà/ngõ/ngách hoặc thông tin chi tiết.';
const ADDRESS_INVALID_MESSAGE = 'Địa chỉ không hợp lệ.';
const ADDRESS_MIN_LENGTH_MESSAGE = 'Địa chỉ phải có ít nhất 12 ký tự.';
const ADDRESS_MIN_LENGTH = 12;
const ADDRESS_SELECTION_FIELDS = ['provinceCode', 'wardCode', 'streetRef'];
const ADDRESS_STRING_FIELDS = [
  ...ADDRESS_SELECTION_FIELDS,
  'detail',
  'provinceName',
  'wardName',
  'streetName',
];
const ADDRESS_REQUIRED_FIELDS = [...ADDRESS_SELECTION_FIELDS, 'detail'];
const ADDRESS_FIELD_REQUIRED_MESSAGES = {
  provinceCode: ADDRESS_PROVINCE_REQUIRED_MESSAGE,
  wardCode: ADDRESS_WARD_REQUIRED_MESSAGE,
  streetRef: ADDRESS_STREET_REQUIRED_MESSAGE,
  detail: ADDRESS_DETAIL_REQUIRED_MESSAGE,
};
const hasValue = (value) => typeof value === 'string' && value.trim().length > 0;

const validateAddress = (address, { required = false } = {}) => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return { address: ADDRESS_INVALID_MESSAGE };
  }

  const errors = {};
  for (const field of ADDRESS_STRING_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(address, field) && typeof address[field] !== 'string') {
      errors[field === 'provinceName' || field === 'wardName' || field === 'streetName' ? 'address' : field] =
        ADDRESS_INVALID_MESSAGE;
    }
  }

  const hasInvalidFieldType = ADDRESS_STRING_FIELDS.some(
    (field) => Object.prototype.hasOwnProperty.call(address, field) && typeof address[field] !== 'string',
  );
  const hasPartialAddress =
    hasInvalidFieldType || ADDRESS_STRING_FIELDS.some((field) => hasValue(address[field]));
  if (!required && !hasPartialAddress) {
    return {};
  }

  for (const field of ADDRESS_REQUIRED_FIELDS) {
    const hasInvalidType = Object.prototype.hasOwnProperty.call(address, field)
      && typeof address[field] !== 'string';
    if (!hasValue(address[field]) && !hasInvalidType) {
      errors[field] = ADDRESS_FIELD_REQUIRED_MESSAGES[field];
    }
  }

  const hasAllCanonicalNames = ['provinceName', 'wardName', 'streetName']
    .every((field) => hasValue(address[field]));
  if (hasAllCanonicalNames) {
    const formattedAddress = formatVietnamAddress(address);
    if (Array.from(formattedAddress).length < ADDRESS_MIN_LENGTH) {
      errors.address = ADDRESS_MIN_LENGTH_MESSAGE;
    }
  }

  return errors;
};

module.exports = {
  ADDRESS_DETAIL_REQUIRED_MESSAGE,
  ADDRESS_INVALID_MESSAGE,
  ADDRESS_MIN_LENGTH,
  ADDRESS_MIN_LENGTH_MESSAGE,
  ADDRESS_PROVINCE_REQUIRED_MESSAGE,
  ADDRESS_STREET_REQUIRED_MESSAGE,
  ADDRESS_WARD_REQUIRED_MESSAGE,
  validateAddress,
};
