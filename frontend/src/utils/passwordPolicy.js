export const PASSWORD_POLICY_MESSAGE =
  'Mật khẩu phải có ít nhất 12 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';

// bcrypt (backend) chỉ dùng 72 byte UTF-8 đầu tiên; khớp với backend/src/utils/passwordPolicy.js.
const PASSWORD_MAX_BYTES = 72;

export const validatePasswordPolicy = (password) => {
  const value = typeof password === 'string' ? password : '';
  if (new TextEncoder().encode(value).length > PASSWORD_MAX_BYTES) {
    return {
      isValid: false,
      message: `Mật khẩu không được dài quá ${PASSWORD_MAX_BYTES} byte (khoảng 72 ký tự không dấu)`,
    };
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
