const { errorResponse } = require('../utils/response');

/**
 * Factory tạo middleware kiểm tra các trường bắt buộc trong request body.
 * Hỗ trợ validation định dạng email và độ dài tối thiểu của password.
 * 
 * @param {string[]} requiredFields - Danh sách các trường bắt buộc phải có trong req.body.
 * @returns {Function} Express middleware function.
 */
const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    requiredFields.forEach((field) => {
      if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    });

    // Validate định dạng email nếu có trường email
    if (body.email && typeof body.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        errors.push({
          field: 'email',
          message: 'Invalid email format'
        });
      }
    }

    // Validate độ dài password nếu có trường password
    if (body.password && typeof body.password === 'string') {
      if (body.password.length < 6) {
        errors.push({
          field: 'password',
          message: 'Password must be at least 6 characters long'
        });
      }
    }

    if (errors.length > 0) {
      return errorResponse(res, 400, 'Validation failed', errors);
    }

    next();
  };
};

module.exports = {
  validateBody
};
