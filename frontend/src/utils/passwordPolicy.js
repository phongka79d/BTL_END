export const PASSWORD_POLICY_MESSAGE =
  'Mật khẩu phải có ít nhất 12 ký tự và bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';

export const validatePasswordPolicy = (password) => {
  const value = typeof password === 'string' ? password : '';
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
