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
  assert.match(source, /label="Địa chỉ email"/);
  assert.match(source, /'Gửi OTP'/);
  assert.match(source, /label="OTP"/);
  assert.match(source, /'Xác minh OTP'/);
  assert.match(source, /label="Mật khẩu mới"/);
  assert.match(source, /label="Xác nhận mật khẩu mới"/);
  assert.match(source, /validatePasswordPolicy\(values\.newPassword\)/);
  assert.match(source, /Mật khẩu mới và mật khẩu xác nhận phải khớp nhau/);
  assert.match(source, /notification\.success\(\{/);
  assert.match(source, /onResetComplete\(\)/);
  assert.doesNotMatch(source, /newPassword\.length < 6|6 characters/);
  assert.doesNotMatch(source, /<div\b|className=|xstyle=|tailwind/i);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});
