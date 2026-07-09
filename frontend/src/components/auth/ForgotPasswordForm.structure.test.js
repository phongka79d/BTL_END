import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const formUrl = new URL('./ForgotPasswordForm.jsx', import.meta.url);

test('forgot password form drives email otp verify and reset stages', () => {
  assert.equal(existsSync(formUrl), true);

  const source = readFileSync(formUrl, 'utf8');

  assert.match(source, /import \{ validatePasswordPolicy \} from '\.\.\/\.\.\/utils\/passwordPolicy';/);
  assert.match(source, /authApi\.requestForgotPasswordOtp/);
  assert.match(source, /authApi\.verifyForgotPasswordOtp/);
  assert.match(source, /authApi\.resetForgotPassword/);
  assert.match(source, /useNotification\(\)/);
  assert.match(source, /label="Email Address"/);
  assert.match(source, /'Send OTP'/);
  assert.match(source, /label="OTP"/);
  assert.match(source, /'Verify OTP'/);
  assert.match(source, /label="New Password"/);
  assert.match(source, /label="Confirm New Password"/);
  assert.match(source, /validatePasswordPolicy\(values\.newPassword\)/);
  assert.match(source, /New password and confirmation password must match/);
  assert.match(source, /notification\.success\(\{/);
  assert.match(source, /onResetComplete\(\)/);
  assert.doesNotMatch(source, /newPassword\.length < 6|6 characters/);
  assert.doesNotMatch(source, /<div\b|className=|xstyle=|tailwind/i);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});
