import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const authApiUrl = new URL('./authApi.js', import.meta.url);

test('auth api exposes backend password change otp endpoints only through apiClient', () => {
  const source = readFileSync(authApiUrl, 'utf8');

  assert.match(source, /requestPasswordChangeOtp/);
  assert.match(source, /apiClient\.post\('\/auth\/change-password\/request-otp'/);
  assert.match(source, /confirmPasswordChange/);
  assert.match(source, /apiClient\.post\('\/auth\/change-password\/confirm'/);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});

test('auth api exposes public forgot password otp endpoints through apiClient', () => {
  const source = readFileSync(authApiUrl, 'utf8');

  assert.match(source, /requestForgotPasswordOtp/);
  assert.match(source, /apiClient\.post\('\/auth\/forgot-password\/request-otp'/);
  assert.match(source, /verifyForgotPasswordOtp/);
  assert.match(source, /apiClient\.post\('\/auth\/forgot-password\/verify-otp'/);
  assert.match(source, /resetForgotPassword/);
  assert.match(source, /apiClient\.post\('\/auth\/forgot-password\/reset'/);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});
