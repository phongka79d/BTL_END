const assert = require('node:assert/strict');
const { test } = require('node:test');
const { PASSWORD_POLICY_MESSAGE, validatePasswordPolicy } = require('./passwordPolicy');

test('password policy accepts strong passwords', () => {
  const result = validatePasswordPolicy('StrongPass1!');

  assert.deepEqual(result, {
    isValid: true,
    message: null,
  });
});

test('password policy rejects passwords missing length or complexity', () => {
  const weakPasswords = [
    'Short1!',
    'lowercasepassword1!',
    'UPPERCASEPASSWORD1!',
    'NoNumberSymbol!',
    'NoSpecialNumber1',
  ];

  weakPasswords.forEach((password) => {
    assert.deepEqual(validatePasswordPolicy(password), {
      isValid: false,
      message: PASSWORD_POLICY_MESSAGE,
    });
  });
});
