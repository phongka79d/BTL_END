import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const panelUrl = new URL('./ChangePasswordPanel.jsx', import.meta.url);

test('change password panel implements current password otp and confirmation flow', () => {
  assert.equal(existsSync(panelUrl), true);

  const source = readFileSync(panelUrl, 'utf8');

  assert.match(source, /import \{ authApi \} from '\.\.\/\.\.\/api\/authApi';/);
  assert.match(source, /import \{ validatePasswordPolicy \} from '\.\.\/\.\.\/utils\/passwordPolicy';/);
  assert.match(source, /label="Đổi mật khẩu"/);
  assert.match(source, /label="Mật khẩu hiện tại"/);
  assert.match(source, /type="password"/);
  assert.match(source, /label="Gửi OTP"/);
  assert.match(source, /authApi\.requestPasswordChangeOtp/);
  assert.match(source, /label="OTP"/);
  assert.match(source, /label="Mật khẩu mới"/);
  assert.match(source, /label="Xác nhận mật khẩu mới"/);
  assert.match(source, /validatePasswordPolicy\(values\.newPassword\)/);
  assert.match(source, /authApi\.confirmPasswordChange/);
  assert.match(source, /Mật khẩu mới và mật khẩu xác nhận phải khớp nhau/);
  assert.doesNotMatch(source, /newPassword\.length < 6|6 characters/);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});
