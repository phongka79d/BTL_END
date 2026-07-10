const { errorResponse } = require('../utils/response');

/**
 * Middleware cấp quyền cho người dùng quản trị.
 * Yêu cầu `req.user` đã được gán bởi middleware `protect` và `user.role` là `admin`.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 403, 'Forbidden, admin resource only');
  }
};

module.exports = {
  admin
};
