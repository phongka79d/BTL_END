import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const panelUrl = new URL('./ChangePasswordPanel.jsx', import.meta.url);

test('change password panel implements current password otp and confirmation flow', () => {
  assert.equal(existsSync(panelUrl), true);

  const source = readFileSync(panelUrl, 'utf8');

  assert.match(source, /import \{ authApi \} from '\.\.\/\.\.\/api\/authApi';/);
  assert.match(source, /label="Change Password"/);
  assert.match(source, /label="Current password"/);
  assert.match(source, /type="password"/);
  assert.match(source, /label="Send OTP"/);
  assert.match(source, /authApi\.requestPasswordChangeOtp/);
  assert.match(source, /label="OTP"/);
  assert.match(source, /label="New password"/);
  assert.match(source, /label="Confirm new password"/);
  assert.match(source, /authApi\.confirmPasswordChange/);
  assert.match(source, /New password and confirmation password must match/);
  assert.doesNotMatch(source, /fetch\(|supabase|PrismaClient|DATABASE_URL/);
});
