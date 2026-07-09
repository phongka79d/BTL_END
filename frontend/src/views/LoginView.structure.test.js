import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./LoginView.jsx', import.meta.url), 'utf8');

test('LoginView announces blocked accounts with a specific toast title', () => {
  assert.match(source, /const BLOCKED_ACCOUNT_MESSAGE = 'Your account has been blocked';/);
  assert.match(source, /const getLoginErrorTitle = \(message\) => \(/);
  assert.match(source, /message === BLOCKED_ACCOUNT_MESSAGE/);
  assert.match(source, /'Account Blocked'/);
  assert.match(source, /useNotification\(\)/);
  assert.match(source, /notification\.error\(\{/);
  assert.match(source, /title: getLoginErrorTitle\(message\)/);
  assert.doesNotMatch(source, /<Banner/);
});

test('LoginView maps invalid credentials to clear secure feedback', () => {
  assert.match(source, /const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';/);
  assert.match(source, /const getLoginErrorDescription = \(message\) => \(/);
  assert.match(source, /message === INVALID_CREDENTIALS_MESSAGE/);
  assert.match(source, /'Incorrect email or password'/);
  assert.match(source, /description: getLoginErrorDescription\(message\)/);
});

test('LoginView exposes forgot password flow with OTP and toast feedback', () => {
  assert.match(source, /import ForgotPasswordForm from '\.\.\/components\/auth\/ForgotPasswordForm';/);
  assert.match(source, /Forgot Password\?/);
  assert.match(source, /setMode\('forgot-password'\)/);
  assert.match(source, /<ForgotPasswordForm/);
  assert.match(source, /onBackToLogin=\{\(\) => setMode\('login'\)\}/);
});
