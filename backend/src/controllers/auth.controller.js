const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/response');

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
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

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

    // Tạo token JWT
    const token = generateToken(user.id);

    // Dữ liệu người dùng an toàn
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
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

module.exports = {
  register,
  login,
  getMe
};
