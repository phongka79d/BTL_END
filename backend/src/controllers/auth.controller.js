const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const passwordChangeOtpModel = require('../models/passwordChangeOtp.model');
const emailService = require('../services/email.service');
const generateToken = require('../utils/generateToken');
const { compareOtp, generateOtp, getOtpExpiry, hashOtp } = require('../utils/otp');
const { successResponse, errorResponse } = require('../utils/response');

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD_OTP_MAX_ATTEMPTS = 5;

const getPasswordOtpMaxAttempts = () => {
  const attempts = Number(process.env.PASSWORD_OTP_MAX_ATTEMPTS || DEFAULT_PASSWORD_OTP_MAX_ATTEMPTS);

  if (!Number.isInteger(attempts) || attempts <= 0) {
    throw new Error('PASSWORD_OTP_MAX_ATTEMPTS must be a positive integer');
  }

  return attempts;
};

const findAuthenticatedUserWithPassword = async (req, res) => {
  if (!req.user) {
    errorResponse(res, 401, 'User not authenticated');
    return null;
  }

  const user = await userModel.findById(req.user.id);
  if (!user) {
    errorResponse(res, 401, 'User not authenticated');
    return null;
  }

  if (user.isBlocked) {
    errorResponse(res, 403, 'Your account has been blocked');
    return null;
  }

  return user;
};

const verifyCurrentPassword = async (user, currentPassword) => {
  return bcrypt.compare(currentPassword, user.passwordHash);
};

/**
 * Đăng ký tài khoản người dùng mới
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phone, address } = req.body;

    // Kiểm tra xem email đã được đăng ký chưa
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, 400, 'Email is already registered');
    }

    // Hash mật khẩu
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo người dùng mới trong database
    const user = await userModel.create({
      username,
      email,
      passwordHash,
      fullName,
      phone,
      address,
      role: 'customer' // Mặc định là customer
    });

    // Tạo token JWT
    const token = generateToken(user.id);

    // Dữ liệu người dùng an toàn (không chứa passwordHash)
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    return successResponse(res, 201, 'User registered successfully', {
      user: safeUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đăng nhập người dùng
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // So khớp mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, 'Your account has been blocked');
    }

    // Tạo token JWT
    const token = generateToken(user.id);

    // Dữ liệu người dùng an toàn
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isBlocked: user.isBlocked
    };

    return successResponse(res, 200, 'Login successful', {
      user: safeUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    // Middleware auth.middleware đã xác thực và gán user vào req.user (không có passwordHash)
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    const safeUser = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role
    };

    return successResponse(res, 200, 'User profile retrieved successfully', {
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send email OTP for authenticated password change.
 * POST /api/auth/change-password/request-otp
 */
const requestPasswordChangeOtp = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    const user = await findAuthenticatedUserWithPassword(req, res);
    if (!user) {
      return null;
    }

    const passwordMatches = await verifyCurrentPassword(user, currentPassword);
    if (!passwordMatches) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry(process.env.PASSWORD_OTP_EXPIRES_MINUTES);

    await passwordChangeOtpModel.createPasswordChangeOtp({
      userId: user.id,
      otpHash,
      expiresAt,
    });

    await emailService.sendPasswordChangeOtpEmail({
      to: user.email,
      otp,
    });

    return successResponse(res, 200, 'Password change OTP sent', {
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm OTP and change authenticated user's password.
 * POST /api/auth/change-password/confirm
 */
const confirmPasswordChange = async (req, res, next) => {
  try {
    const { currentPassword, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'New password and confirmation password must match');
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters');
    }

    const user = await findAuthenticatedUserWithPassword(req, res);
    if (!user) {
      return null;
    }

    const passwordMatches = await verifyCurrentPassword(user, currentPassword);
    if (!passwordMatches) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    const passwordChangeOtp = await passwordChangeOtpModel.findLatestActiveOtp(user.id);
    if (!passwordChangeOtp) {
      return errorResponse(res, 400, 'Password change OTP is required');
    }

    if (passwordChangeOtp.usedAt) {
      return errorResponse(res, 400, 'OTP has already been used');
    }

    if (passwordChangeOtp.expiresAt <= new Date()) {
      await passwordChangeOtpModel.invalidateActiveOtps(user.id);
      return errorResponse(res, 400, 'OTP has expired');
    }

    const maxAttempts = getPasswordOtpMaxAttempts();
    if (passwordChangeOtp.attempts >= maxAttempts) {
      await passwordChangeOtpModel.invalidateActiveOtps(user.id);
      return errorResponse(res, 400, 'Too many OTP attempts. Request a new OTP');
    }

    const otpMatches = await compareOtp(otp, passwordChangeOtp.otpHash);
    if (!otpMatches) {
      await passwordChangeOtpModel.incrementOtpAttempts(passwordChangeOtp.id);
      return errorResponse(res, 400, 'Invalid OTP');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await passwordChangeOtpModel.completePasswordChange({
      otpId: passwordChangeOtp.id,
      userId: user.id,
      passwordHash,
    });

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  requestPasswordChangeOtp,
  confirmPasswordChange
};
