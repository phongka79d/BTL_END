const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('email service sends password change otp from backend only', () => {
  const source = readFileSync(path.join(__dirname, 'email.service.js'), 'utf8');

  assert.match(source, /sendPasswordChangeOtpEmail/);
  assert.match(source, /nodemailer/);
  assert.match(source, /SMTP_HOST/);
  assert.match(source, /PASSWORD_OTP_DELIVERY_MODE/);
  assert.doesNotMatch(source, /supabase|createClient|fetch\(/i);
});
