const ADDRESS_PROVINCE_REQUIRED_MESSAGE = 'Vui lòng chọn Tỉnh/Thành phố.';
const ADDRESS_WARD_REQUIRED_MESSAGE = 'Vui lòng chọn Phường/Xã.';
const ADDRESS_DETAIL_REQUIRED_MESSAGE = 'Vui lòng nhập số nhà, ngõ/ngách và tên đường.';
const ADDRESS_INVALID_MESSAGE = 'Địa chỉ không hợp lệ.';
const ADDRESS_MIN_LENGTH_MESSAGE = 'Địa chỉ phải có ít nhất 12 ký tự.';
const ADDRESS_MIN_LENGTH = 12;
const ADDRESS_REQUIRED_FIELDS = ['provinceCode', 'wardCode', 'detail'];
const ADDRESS_FIELD_REQUIRED_MESSAGES = {
  provinceCode: ADDRESS_PROVINCE_REQUIRED_MESSAGE,
  wardCode: ADDRESS_WARD_REQUIRED_MESSAGE,
  detail: ADDRESS_DETAIL_REQUIRED_MESSAGE,
};
const hasValue = (value) => typeof value === 'string' && value.trim().length > 0;

const validateAddress = (address, { required = false } = {}) => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return { address: ADDRESS_INVALID_MESSAGE };
  }

  const errors = {};
  for (const field of ADDRESS_REQUIRED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(address, field) && typeof address[field] !== 'string') {
      errors[field] = ADDRESS_INVALID_MESSAGE;
    }
  }

  const hasPartialAddress = ADDRESS_REQUIRED_FIELDS.some(
    (field) => (Object.prototype.hasOwnProperty.call(address, field) && typeof address[field] !== 'string')
      || hasValue(address[field]),
  );
  if (!required && !hasPartialAddress) return {};

  for (const field of ADDRESS_REQUIRED_FIELDS) {
    const hasInvalidType = Object.prototype.hasOwnProperty.call(address, field)
      && typeof address[field] !== 'string';
    if (!hasValue(address[field]) && !hasInvalidType) {
      errors[field] = ADDRESS_FIELD_REQUIRED_MESSAGES[field];
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
  ADDRESS_WARD_REQUIRED_MESSAGE,
  validateAddress,
};
