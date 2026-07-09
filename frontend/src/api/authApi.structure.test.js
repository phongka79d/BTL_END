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
