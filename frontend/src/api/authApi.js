import { apiClient } from './apiClient';

/**
 * Các hàm hỗ trợ API xác thực
 * Giao tiếp với các route /api/auth/* của backend.
 */
export const authApi = {
  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Chi tiết đăng ký người dùng (username, email, password, fullName, phone, address)
   * @returns {Promise<Object>} Thông tin người dùng an toàn và token
   */
  register: (userData) => apiClient.post('/auth/register', userData),

  /**
   * Đăng nhập người dùng hiện có
   * @param {Object} credentials - Thông tin đăng nhập (email, password)
   * @returns {Promise<Object>} Thông tin người dùng an toàn và token
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /**
   * Lấy hồ sơ người dùng đang đăng nhập
   * Yêu cầu header Authorization chứa JWT hợp lệ.
   * @returns {Promise<Object>} Hồ sơ người dùng hiện tại
   */
  getMe: () => apiClient.get('/auth/me'),

  /**
   * Yêu cầu OTP qua email cho quy trình đổi mật khẩu đã xác thực.
   * @param {Object} payload - currentPassword
   * @returns {Promise<Object>} Kết quả yêu cầu OTP
   */
  requestPasswordChangeOtp: (payload) => apiClient.post('/auth/change-password/request-otp', payload),

  /**
   * Xác nhận đổi mật khẩu đã xác thực bằng mật khẩu hiện tại, OTP và các trường mật khẩu mới khớp nhau.
   * @param {Object} payload - currentPassword, otp, newPassword, confirmPassword
   * @returns {Promise<Object>} Kết quả đổi mật khẩu
   */
  confirmPasswordChange: (payload) => apiClient.post('/auth/change-password/confirm', payload),

  /**
   * Yêu cầu OTP qua email cho quy trình quên mật khẩu công khai.
   * @param {Object} payload - email
   * @returns {Promise<Object>} Kết quả yêu cầu OTP
   */
  requestForgotPasswordOtp: (payload) => apiClient.post('/auth/forgot-password/request-otp', payload),

  /**
   * Xác minh OTP quên mật khẩu công khai trước khi hiển thị các trường đặt lại.
   * @param {Object} payload - email, otp
   * @returns {Promise<Object>} Kết quả xác minh OTP
   */
  verifyForgotPasswordOtp: (payload) => apiClient.post('/auth/forgot-password/verify-otp', payload),

  /**
   * Đặt lại mật khẩu bằng OTP quên mật khẩu công khai hợp lệ.
   * @param {Object} payload - email, otp, newPassword, confirmPassword
   * @returns {Promise<Object>} Kết quả đặt lại mật khẩu
   */
  resetForgotPassword: (payload) => apiClient.post('/auth/forgot-password/reset', payload),
};
