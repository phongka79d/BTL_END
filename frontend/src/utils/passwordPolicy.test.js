import assert from 'node:assert/strict';
import test from 'node:test';
import { PASSWORD_POLICY_MESSAGE, validatePasswordPolicy } from './passwordPolicy.js';

test('frontend password policy accepts strong passwords', () => {
  assert.deepEqual(validatePasswordPolicy('StrongPass1!'), {
    isValid: true,
    message: null,
  });
});

test('frontend password policy rejects passwords missing length or complexity', () => {
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
