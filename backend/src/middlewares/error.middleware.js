const { errorResponse } = require('../utils/response');

/**
 * Middleware xử lý lỗi tập trung trong Express.
 * Tránh rò rỉ stack trace ở môi trường production.
 * 
 * @param {Error} err - Đối tượng lỗi.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function.
 * @returns {void}
 */
const errorMiddleware = (err, req, res, next) => {
  // Ghi log lỗi để dev dễ debug
  console.error('[Error Middleware]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Chi tiết lỗi (chỉ trả về stack trace khi không ở production)
  const errors = [];
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errors.push({ stack: err.stack });
  }

  errorResponse(res, statusCode, message, errors);
};

module.exports = errorMiddleware;
