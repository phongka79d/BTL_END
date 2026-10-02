const PASSWORD_POLICY_MESSAGE = 'Mật khẩu phải có ít nhất 12 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
// bcrypt chỉ dùng 72 byte UTF-8 đầu tiên: mật khẩu dài hơn sẽ trùng với phần đầu của nó.
const PASSWORD_MAX_BYTES = 72;
const PASSWORD_TOO_LONG_MESSAGE = `Mật khẩu không được dài quá ${PASSWORD_MAX_BYTES} byte (khoảng 72 ký tự không dấu)`;

const validatePasswordPolicy = (password) => {
  const value = typeof password === 'string' ? password : '';
  if (Buffer.byteLength(value, 'utf8') > PASSWORD_MAX_BYTES) {
    return { isValid: false, message: PASSWORD_TOO_LONG_MESSAGE };
  }
  const isValid =
    value.length >= 12 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

  return {
    isValid,
    message: isValid ? null : PASSWORD_POLICY_MESSAGE,
  };
};

module.exports = {
  PASSWORD_POLICY_MESSAGE,
  validatePasswordPolicy,
};
