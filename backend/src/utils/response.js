/**
 * Trả về phản hồi thành công đồng nhất.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định 200).
 * @param {string} message - Thông điệp thành công.
 * @param {Object} [data={}] - Dữ liệu trả về (mặc định {}).
 * @returns {Object} Phản hồi JSON.
 */
const successResponse = (res, statusCode = 200, message = 'Thành công', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Trả về phản hồi lỗi đồng nhất.
 * @param {Object} res - Đối tượng phản hồi của Express.
 * @param {number} statusCode - Mã trạng thái HTTP (mặc định 500).
 * @param {string} message - Thông điệp lỗi.
 * @param {Array} [errors=[]] - Danh sách lỗi chi tiết (mặc định []).
 * @returns {Object} Phản hồi JSON.
 */
const errorResponse = (res, statusCode = 500, message = 'Lỗi', errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  errorResponse
};
