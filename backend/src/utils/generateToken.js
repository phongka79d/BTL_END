const jwt = require('jsonwebtoken');

/**
 * Tạo token JWT cho người dùng
 * @param {string} userId - ID người dùng
 * @returns {string} Token JWT
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

module.exports = generateToken;
