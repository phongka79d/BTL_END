export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 12 characters and include uppercase, lowercase, number, and special character';

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
