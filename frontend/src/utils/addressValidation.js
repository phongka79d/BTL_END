import { formatVietnamAddress } from './addressFormatter.js';

const REQUIRED_FIELD_MESSAGES = {
  provinceCode: 'Vui lòng chọn Tỉnh/Thành phố.',
  wardCode: 'Vui lòng chọn Phường/Xã.',
  streetRef: 'Vui lòng chọn Đường/Phố.'
};
const DETAIL_REQUIRED_MESSAGE = 'Vui lòng nhập số nhà/ngõ/ngách hoặc thông tin chi tiết.';
const ADDRESS_TOO_SHORT_MESSAGE = 'Địa chỉ phải có ít nhất 12 ký tự.';
export const ADDRESS_INVALID_MESSAGE = 'Địa chỉ không hợp lệ.';

const ADDRESS_FIELDS = [
  'provinceCode',
  'provinceName',
  'wardCode',
  'wardName',
  'streetRef',
  'streetName',
  'detail'
];
const REQUIRED_FIELDS = ['provinceCode', 'wardCode', 'streetRef'];
const isBlank = (value) => value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

const getRequiredErrors = () => ({
  ...REQUIRED_FIELD_MESSAGES,
  detail: DETAIL_REQUIRED_MESSAGE
});

export const validateAddress = (address, { required = false } = {}) => {
  if (address === null || address === undefined) {
    return required ? getRequiredErrors() : {};
  }

  if (typeof address !== 'object' || Array.isArray(address)) {
    return { address: ADDRESS_INVALID_MESSAGE };
  }

  const hasAddressValue = ADDRESS_FIELDS.some((field) => !isBlank(address[field]));
  if (!hasAddressValue) {
    return required ? getRequiredErrors() : {};
  }

  if (ADDRESS_FIELDS.some((field) => !isBlank(address[field]) && typeof address[field] !== 'string')) {
    return { address: ADDRESS_INVALID_MESSAGE };
  }

  const errors = {};
  REQUIRED_FIELDS.forEach((field) => {
    if (isBlank(address[field])) {
      errors[field] = REQUIRED_FIELD_MESSAGES[field];
    }
  });
  if (isBlank(address.detail)) {
    errors.detail = DETAIL_REQUIRED_MESSAGE;
  }

  const hasCanonicalNames = ['streetName', 'wardName', 'provinceName']
    .every((field) => typeof address[field] === 'string' && address[field].trim() !== '');
  if (Object.keys(errors).length === 0 && hasCanonicalNames && formatVietnamAddress(address).length < 12) {
    errors.address = ADDRESS_TOO_SHORT_MESSAGE;
  }

  return errors;
};
