import { apiClient } from './apiClient';

/**
 * User and Profile management API helpers
 * Communicates with backend /api/users/* and /api/admin/users routes.
 */
export const userApi = {
  /**
   * Retrieve the current logged-in user profile details
   * @returns {Promise<Object>} The user profile object
   */
  getProfile: () => apiClient.get('/users/profile'),

  /**
   * Update the current logged-in user profile details
   * @param {Object} profileData - Profile data to update (username, fullName, phone, address)
   * @returns {Promise<Object>} The updated user profile object
   */
  updateProfile: (profileData) => apiClient.put('/users/profile', profileData),

  /**
   * Retrieve a list of all users (Admin only)
   * @returns {Promise<Object>} Array of all users
   */
  getAdminUsers: () => apiClient.get('/admin/users'),
};
