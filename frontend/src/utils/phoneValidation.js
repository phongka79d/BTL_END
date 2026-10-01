export const PHONE_VALIDATION_MESSAGE = 'Số điện thoại chỉ được chứa chữ số.';
export const PHONE_REQUIRED_MESSAGE = 'Số điện thoại không được để trống.';

export const validatePhone = (value, { required = false } = {}) => {
  const isEmpty = value === '' || value === null || value === undefined;

  if (isEmpty) {
    return required ? PHONE_REQUIRED_MESSAGE : null;
  }

  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) {
    return PHONE_VALIDATION_MESSAGE;
  }

  return null;
};
