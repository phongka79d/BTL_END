const assert = require('node:assert/strict');
const { test } = require('node:test');
const { compareOtp, generateOtp, getOtpExpiry, hashOtp } = require('./otp');

test('generateOtp returns a six digit string', () => {
  const otp = generateOtp();

  assert.match(otp, /^\d{6}$/);
});

test('hashOtp validates matching otp without storing plain text', async () => {
  const hash = await hashOtp('123456');

  assert.notEqual(hash, '123456');
  assert.equal(await compareOtp('123456', hash), true);
  assert.equal(await compareOtp('654321', hash), false);
});

test('getOtpExpiry returns a future date using provided minutes', () => {
  const now = new Date('2026-07-09T00:00:00.000Z');
  const expiry = getOtpExpiry(10, now);

  assert.equal(expiry.toISOString(), '2026-07-09T00:10:00.000Z');
});
