const CHECKOUT_FULL_NAME_MESSAGE = 'Họ và tên phải có từ 10 đến 50 ký tự.';

const validateCheckoutFullName = (value) => {
  if (typeof value !== 'string') {
    return CHECKOUT_FULL_NAME_MESSAGE;
  }

  const length = Array.from(value.trim()).length;
  return length < 10 || length > 50 ? CHECKOUT_FULL_NAME_MESSAGE : null;
};

module.exports = {
  CHECKOUT_FULL_NAME_MESSAGE,
  validateCheckoutFullName,
};
