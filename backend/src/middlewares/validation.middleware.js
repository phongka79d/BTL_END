const { errorResponse } = require('../utils/response');
const { validatePasswordPolicy } = require('../utils/passwordPolicy');

/**
 * Hàm tạo middleware kiểm tra các trường bắt buộc trong phần thân yêu cầu.
 * Hỗ trợ kiểm tra định dạng email và độ dài tối thiểu của password.
 * 
 * @param {string[]} requiredFields - Danh sách các trường bắt buộc phải có trong req.body.
 * @returns {Function} Hàm middleware Express.
 */
const validateBody = (requiredFields, options = {}) => {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    requiredFields.forEach((field) => {
      if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
        errors.push({
          field,
          message: `${field} là bắt buộc`
        });
      }
    });

    // Kiểm tra định dạng email nếu có trường email
    if (body.email && typeof body.email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        errors.push({
          field: 'email',
          message: 'Định dạng email không hợp lệ'
        });
      }
    }

    // Kiểm tra độ dài password nếu có trường password
    if (options.validatePasswordPolicy && body.password && typeof body.password === 'string') {
      const passwordPolicy = validatePasswordPolicy(body.password);
      if (!passwordPolicy.isValid) {
        errors.push({
          field: 'password',
          message: passwordPolicy.message
        });
      }
    }

    if (errors.length > 0) {
      return errorResponse(res, 400, 'Xác thực thất bại', errors);
    }

    next();
  };
};

module.exports = {
  validateBody
};
