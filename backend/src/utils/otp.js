const bcrypt = require('bcrypt');
const crypto = require('crypto');

const OTP_LENGTH = 6;
const DEFAULT_OTP_EXPIRY_MINUTES = 10;

const generateOtp = () => {
  const max = 10 ** OTP_LENGTH;
  return String(crypto.randomInt(0, max)).padStart(OTP_LENGTH, '0');
};

const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
};

const compareOtp = async (otp, otpHash) => {
  return bcrypt.compare(otp, otpHash);
};

const getOtpExpiry = (minutes = DEFAULT_OTP_EXPIRY_MINUTES, now = new Date()) => {
  const expiryMinutes = Number(minutes);

  if (!Number.isFinite(expiryMinutes) || expiryMinutes <= 0) {
    throw new Error('OTP expiry minutes must be a positive number');
  }

  return new Date(now.getTime() + expiryMinutes * 60 * 1000);
};

module.exports = {
  DEFAULT_OTP_EXPIRY_MINUTES,
  generateOtp,
  hashOtp,
  compareOtp,
  getOtpExpiry,
};
