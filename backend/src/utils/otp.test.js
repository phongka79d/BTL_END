const assert = require('node:assert/strict');
const crypto = require('crypto');
const { test } = require('node:test');
const { compareOtp, generateOtp, getOtpExpiry, hashOtp } = require('./otp');

test('generateOtp returns a six digit string', () => {
  const otp = generateOtp();

  assert.match(otp, /^\d{6}$/);
});

test('generateOtp uses six digit random range and pads leading zeros', () => {
  const originalRandomInt = crypto.randomInt;
  const calls = [];

  crypto.randomInt = (min, max) => {
    calls.push([min, max]);
    return 7;
  };

  try {
    assert.equal(generateOtp(), '000007');
    assert.deepEqual(calls, [[0, 1000000]]);
  } finally {
    crypto.randomInt = originalRandomInt;
  }
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

test('getOtpExpiry rejects invalid expiry minutes', () => {
  const now = new Date('2026-07-09T00:00:00.000Z');

  assert.throws(() => getOtpExpiry('abc', now), /OTP expiry minutes must be a positive number/);
  assert.throws(() => getOtpExpiry(Number.NaN, now), /OTP expiry minutes must be a positive number/);
  assert.throws(() => getOtpExpiry(Number.POSITIVE_INFINITY, now), /OTP expiry minutes must be a positive number/);
});

test('getOtpExpiry rejects zero or negative expiry minutes', () => {
  const now = new Date('2026-07-09T00:00:00.000Z');

  assert.throws(() => getOtpExpiry(0, now), /OTP expiry minutes must be a positive number/);
  assert.throws(() => getOtpExpiry(-1, now), /OTP expiry minutes must be a positive number/);
});
