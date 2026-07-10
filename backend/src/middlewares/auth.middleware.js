const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { errorResponse } = require('../utils/response');

/**
 * Middleware xác thực request bằng JWT.
 * Đọc header `Authorization: Bearer <token>`, xác minh token,
 * tải người dùng không kèm `passwordHash` và gán vào `req.user`.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return errorResponse(res, 500, 'JWT secret is not configured');
    }

    // Xác minh token.
    const decoded = jwt.verify(token, secret);

    // Tải người dùng từ database.
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'Not authorized, user not found');
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, 'Your account has been blocked');
    }

    // Loại bỏ `passwordHash` trước khi gán người dùng vào request.
    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized, invalid token');
  }
};

module.exports = {
  protect
};
