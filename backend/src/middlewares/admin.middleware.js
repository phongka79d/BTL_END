const { errorResponse } = require('../utils/response');

/**
 * Middleware to authorize admin users
 * Requires req.user to be set (by protect middleware) and user.role to be 'admin'.
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
