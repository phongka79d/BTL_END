export const CHECKOUT_FULL_NAME_MESSAGE = 'Họ và tên phải có từ 10 đến 50 ký tự.';

export const validateCheckoutFullName = (value) => {
  if (typeof value !== 'string') {
    return CHECKOUT_FULL_NAME_MESSAGE;
  }

  const name = value.trim();
  return name.length >= 10 && name.length <= 50
    ? null
    : CHECKOUT_FULL_NAME_MESSAGE;
};
