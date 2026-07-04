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
};
