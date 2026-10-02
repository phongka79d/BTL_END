const PHONE_VALIDATION_MESSAGE = 'Số điện thoại chỉ được chứa chữ số.';
const PHONE_REQUIRED_MESSAGE = 'Số điện thoại không được để trống.';
const PHONE_LENGTH_MESSAGE = 'Số điện thoại phải gồm từ 9 đến 11 chữ số.';

const validatePhone = (value, { required = false } = {}) => {
  const isEmpty = value === '' || value === null || value === undefined;

  if (isEmpty) {
    return required ? PHONE_REQUIRED_MESSAGE : null;
  }

  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) {
    return PHONE_VALIDATION_MESSAGE;
  }

  if (value.length < 9 || value.length > 11) {
    return PHONE_LENGTH_MESSAGE;
  }

  return null;
};

module.exports = {
  PHONE_LENGTH_MESSAGE,
  PHONE_REQUIRED_MESSAGE,
  PHONE_VALIDATION_MESSAGE,
  validatePhone,
};

