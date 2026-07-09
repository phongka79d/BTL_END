const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('password change routes are protected and validate required bodies', () => {
  const source = readFileSync(path.join(__dirname, 'auth.routes.js'), 'utf8');

  assert.match(source, /\/change-password\/request-otp/);
  assert.match(source, /\/change-password\/confirm/);
  assert.match(source, /protect,\s*validateBody\(\['currentPassword'\]\)/);
  assert.match(source, /protect,\s*validateBody\(\['currentPassword', 'otp', 'newPassword', 'confirmPassword'\]\)/);
  assert.match(source, /authController\.requestPasswordChangeOtp/);
  assert.match(source, /authController\.confirmPasswordChange/);
});
