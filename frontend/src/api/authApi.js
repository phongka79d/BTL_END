import { apiClient } from './apiClient';

/**
 * Authentication API helpers
 * Communicates with backend /api/auth/* routes.
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - User registration details (username, email, password, fullName, phone, address)
   * @returns {Promise<Object>} Safe user details and token
   */
  register: (userData) => apiClient.post('/auth/register', userData),

  /**
   * Log in an existing user
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise<Object>} Safe user details and token
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /**
   * Retrieve the current logged-in user profile
   * Requires Authorization header containing a valid JWT.
   * @returns {Promise<Object>} The current user profile
   */
  getMe: () => apiClient.get('/auth/me'),

  /**
   * Request an email OTP for an authenticated password change.
   * @param {Object} payload - currentPassword
   * @returns {Promise<Object>} OTP request result
   */
  requestPasswordChangeOtp: (payload) => apiClient.post('/auth/change-password/request-otp', payload),

  /**
   * Confirm an authenticated password change with current password, OTP, and matching new password fields.
   * @param {Object} payload - currentPassword, otp, newPassword, confirmPassword
   * @returns {Promise<Object>} Password change result
   */
  confirmPasswordChange: (payload) => apiClient.post('/auth/change-password/confirm', payload),

  /**
   * Request a public forgot password email OTP.
   * @param {Object} payload - email
   * @returns {Promise<Object>} OTP request result
   */
  requestForgotPasswordOtp: (payload) => apiClient.post('/auth/forgot-password/request-otp', payload),

  /**
   * Verify a public forgot password OTP before showing reset fields.
   * @param {Object} payload - email, otp
   * @returns {Promise<Object>} OTP verification result
   */
  verifyForgotPasswordOtp: (payload) => apiClient.post('/auth/forgot-password/verify-otp', payload),

  /**
   * Reset a password using a valid public forgot password OTP.
   * @param {Object} payload - email, otp, newPassword, confirmPassword
   * @returns {Promise<Object>} Password reset result
   */
  resetForgotPassword: (payload) => apiClient.post('/auth/forgot-password/reset', payload),
};
