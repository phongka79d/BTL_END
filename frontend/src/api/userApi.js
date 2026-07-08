import { apiClient } from './apiClient';

const buildUserQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set('keyword', filters.keyword);
  }
  if (filters.page) {
    params.set('page', String(filters.page));
  }
  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

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
   * Retrieve a paginated list of users (Admin only)
   * @param {Object} filters - keyword, page, limit
   * @returns {Promise<Object>} Array of all users
   */
  getAdminUsers: (filters = {}) => apiClient.get(`/admin/users${buildUserQuery(filters)}`),

  /**
   * Update soft user details (Admin only)
   * @param {string} userId
   * @param {Object} payload
   * @returns {Promise<Object>} Updated user
   */
  updateAdminUser: (userId, payload) => apiClient.put(`/admin/users/${userId}`, payload),

  /**
   * Update a user's role (Admin only)
   * @param {string} userId
   * @param {'customer'|'admin'} role
   * @returns {Promise<Object>} Updated user
   */
  updateUserRole: (userId, role) => apiClient.put(`/admin/users/${userId}/role`, { role }),

  /**
   * Update a user's blocked status (Admin only)
   * @param {string} userId
   * @param {boolean} isBlocked
   * @returns {Promise<Object>} Updated user
   */
  updateUserBlocked: (userId, isBlocked) => apiClient.put(`/admin/users/${userId}/block`, { isBlocked }),
};
