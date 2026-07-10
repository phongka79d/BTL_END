const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const passwordChangeOtpModel = require('../models/passwordChangeOtp.model');
const emailService = require('../services/email.service');
const generateToken = require('../utils/generateToken');
const { compareOtp, generateOtp, getOtpExpiry, hashOtp } = require('../utils/otp');
const { validatePasswordPolicy } = require('../utils/passwordPolicy');
const { successResponse, errorResponse } = require('../utils/response');

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD_OTP_MAX_ATTEMPTS = 5;
const FORGOT_PASSWORD_GENERIC_MESSAGE = 'Nếu tài khoản tồn tại, OTP đặt lại mật khẩu đã được gửi';

const getPasswordOtpMaxAttempts = () => {
  const attempts = Number(process.env.PASSWORD_OTP_MAX_ATTEMPTS || DEFAULT_PASSWORD_OTP_MAX_ATTEMPTS);

  if (!Number.isInteger(attempts) || attempts <= 0) {
    throw new Error('PASSWORD_OTP_MAX_ATTEMPTS must be a positive integer');
  }

  return attempts;
};

const findAuthenticatedUserWithPassword = async (req, res) => {
  if (!req.user) {
    errorResponse(res, 401, 'Người dùng chưa được xác thực');
    return null;
  }

  const user = await userModel.findById(req.user.id);
  if (!user) {
    errorResponse(res, 401, 'Người dùng chưa được xác thực');
    return null;
  }

  if (user.isBlocked) {
    errorResponse(res, 403, 'Tài khoản của bạn đã bị khóa');
    return null;
  }

  return user;
};

const verifyCurrentPassword = async (user, currentPassword) => {
  return bcrypt.compare(currentPassword, user.passwordHash);
};

const normalizeEmail = (email) => String(email || '').trim();

const validateNewPassword = (res, newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    errorResponse(res, 400, 'Mật khẩu mới và mật khẩu xác nhận phải khớp nhau');
    return false;
  }

  const passwordPolicy = validatePasswordPolicy(newPassword);
  if (!passwordPolicy.isValid) {
    errorResponse(res, 400, passwordPolicy.message.replace('Mật khẩu', 'Mật khẩu mới'));
    return false;
  }

  return true;
};

const validateOtpForUser = async ({ user, otp, res, requiredMessage }) => {
  const passwordChangeOtp = await passwordChangeOtpModel.findLatestUnusedOtp(user.id);
  if (!passwordChangeOtp) {
    errorResponse(res, 400, requiredMessage);
    return null;
  }

  if (passwordChangeOtp.usedAt) {
    errorResponse(res, 400, 'OTP đã được sử dụng');
    return null;
  }

  if (passwordChangeOtp.expiresAt <= new Date()) {
    await passwordChangeOtpModel.invalidateActiveOtps(user.id);
    errorResponse(res, 400, 'OTP đã hết hạn');
    return null;
  }

  const maxAttempts = getPasswordOtpMaxAttempts();
  if (passwordChangeOtp.attempts >= maxAttempts) {
    await passwordChangeOtpModel.invalidateActiveOtps(user.id);
    errorResponse(res, 400, 'Quá nhiều lần thử OTP. Hãy yêu cầu OTP mới');
    return null;
  }

  const otpMatches = await compareOtp(otp, passwordChangeOtp.otpHash);
  if (!otpMatches) {
    await passwordChangeOtpModel.incrementOtpAttempts(passwordChangeOtp.id);
    errorResponse(res, 400, 'OTP không hợp lệ');
    return null;
  }

  return passwordChangeOtp;
};

const createAndSendPasswordOtp = async (user) => {
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

  return expiresAt;
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
      return errorResponse(res, 400, 'Email đã được đăng ký');
    }

    // Băm mật khẩu
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo người dùng mới trong cơ sở dữ liệu
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

    return successResponse(res, 201, 'Đăng ký người dùng thành công', {
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
      return errorResponse(res, 401, 'Email hoặc mật khẩu không hợp lệ');
    }

    // So khớp mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Email hoặc mật khẩu không hợp lệ');
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, 'Tài khoản của bạn đã bị khóa');
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

    return successResponse(res, 200, 'Đăng nhập thành công', {
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
      return errorResponse(res, 401, 'Người dùng chưa được xác thực');
    }

    const safeUser = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role
    };

    return successResponse(res, 200, 'Đã lấy hồ sơ người dùng thành công', {
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gửi OTP qua email cho quy trình đổi mật khẩu của người dùng đã xác thực.
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
      return errorResponse(res, 400, 'Mật khẩu hiện tại không chính xác');
    }

    const expiresAt = await createAndSendPasswordOtp(user);

    return successResponse(res, 200, 'Đã gửi OTP đổi mật khẩu', {
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xác nhận OTP và đổi mật khẩu của người dùng đã xác thực.
 * POST /api/auth/change-password/confirm
 */
const confirmPasswordChange = async (req, res, next) => {
  try {
    const { currentPassword, otp, newPassword, confirmPassword } = req.body;

    if (!validateNewPassword(res, newPassword, confirmPassword)) {
      return null;
    }

    const user = await findAuthenticatedUserWithPassword(req, res);
    if (!user) {
      return null;
    }

    const passwordMatches = await verifyCurrentPassword(user, currentPassword);
    if (!passwordMatches) {
      return errorResponse(res, 400, 'Mật khẩu hiện tại không chính xác');
    }

    const passwordChangeOtp = await passwordChangeOtpModel.findLatestActiveOtp(user.id);
    if (!passwordChangeOtp) {
      return errorResponse(res, 400, 'OTP đổi mật khẩu là bắt buộc');
    }

    if (passwordChangeOtp.usedAt) {
      return errorResponse(res, 400, 'OTP đã được sử dụng');
    }

    if (passwordChangeOtp.expiresAt <= new Date()) {
      await passwordChangeOtpModel.invalidateActiveOtps(user.id);
      return errorResponse(res, 400, 'OTP đã hết hạn');
    }

    const maxAttempts = getPasswordOtpMaxAttempts();
    if (passwordChangeOtp.attempts >= maxAttempts) {
      await passwordChangeOtpModel.invalidateActiveOtps(user.id);
      return errorResponse(res, 400, 'Quá nhiều lần thử OTP. Hãy yêu cầu OTP mới');
    }

    const otpMatches = await compareOtp(otp, passwordChangeOtp.otpHash);
    if (!otpMatches) {
      await passwordChangeOtpModel.incrementOtpAttempts(passwordChangeOtp.id);
      return errorResponse(res, 400, 'OTP không hợp lệ');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await passwordChangeOtpModel.completePasswordChange({
      otpId: passwordChangeOtp.id,
      userId: user.id,
      passwordHash,
    });

    return successResponse(res, 200, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * Gửi OTP qua email cho quy trình quên mật khẩu công khai.
 * POST /api/auth/forgot-password/request-otp
 */
const requestForgotPasswordOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await userModel.findByEmail(email);

    if (user && !user.isBlocked) {
      await createAndSendPasswordOtp(user);
    }

    return successResponse(res, 200, FORGOT_PASSWORD_GENERIC_MESSAGE);
  } catch (error) {
    next(error);
  }
};

/**
 * Xác minh OTP quên mật khẩu trước khi hiển thị biểu mẫu mật khẩu mới.
 * POST /api/auth/forgot-password/verify-otp
 */
const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user || user.isBlocked) {
      return errorResponse(res, 400, 'OTP không hợp lệ hoặc đã hết hạn');
    }

    const passwordChangeOtp = await validateOtpForUser({
      user,
      otp,
      res,
      requiredMessage: 'Password reset OTP is required',
    });
    if (!passwordChangeOtp) {
      return null;
    }

    return successResponse(res, 200, 'Xác minh OTP thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * Đặt lại mật khẩu bằng OTP quên mật khẩu hợp lệ.
 * POST /api/auth/forgot-password/reset
 */
const resetForgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp, newPassword, confirmPassword } = req.body;

    if (!validateNewPassword(res, newPassword, confirmPassword)) {
      return null;
    }

    const user = await userModel.findByEmail(email);
    if (!user || user.isBlocked) {
      return errorResponse(res, 400, 'OTP không hợp lệ hoặc đã hết hạn');
    }

    const passwordChangeOtp = await validateOtpForUser({
      user,
      otp,
      res,
      requiredMessage: 'Password reset OTP is required',
    });
    if (!passwordChangeOtp) {
      return null;
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await passwordChangeOtpModel.completePasswordChange({
      otpId: passwordChangeOtp.id,
      userId: user.id,
      passwordHash,
    });

    return successResponse(res, 200, 'Đặt lại mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  requestPasswordChangeOtp,
  confirmPasswordChange,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetForgotPassword
};
