const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('password change otp model stores only hashed otp and supports invalidation', () => {
  const source = readFileSync(path.join(__dirname, 'passwordChangeOtp.model.js'), 'utf8');

  assert.match(source, /createPasswordChangeOtp/);
  assert.match(source, /invalidateActiveOtps/);
  assert.match(source, /findLatestActiveOtp/);
  assert.match(source, /incrementOtpAttempts/);
  assert.match(source, /completePasswordChange/);
  assert.match(source, /otpHash/);
  assert.doesNotMatch(source, /plainOtp|otpCode|codeText/);
  assert.match(source, /prisma\.\$transaction/);
});
