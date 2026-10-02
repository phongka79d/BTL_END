import { apiClient } from './apiClient';

const buildUserQuery = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set('keyword', filters.keyword);
  }
  if (filters.role) {
    params.set('role', filters.role);
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
 * Các hàm hỗ trợ API quản lý người dùng và hồ sơ
 * Giao tiếp với các route /api/users/* và /api/admin/users của backend.
 */
export const userApi = {
  /**
   * Lấy chi tiết hồ sơ người dùng đang đăng nhập
 * @returns {Promise<Object>} Đối tượng hồ sơ người dùng
   */
  getProfile: () => apiClient.get('/users/profile'),

  /**
   * Cập nhật chi tiết hồ sơ người dùng đang đăng nhập
   * @param {Object} profileData - Dữ liệu hồ sơ cần cập nhật (username, fullName, phone, address)
 * @returns {Promise<Object>} Đối tượng hồ sơ người dùng đã cập nhật
   */
  updateProfile: (profileData) => apiClient.put('/users/profile', profileData),

  /**
   * Lấy danh sách người dùng có phân trang (chỉ Admin)
   * @param {Object} filters - keyword, role, page, limit
   * @returns {Promise<Object>} Mảng tất cả người dùng
   */
  getAdminUsers: (filters = {}) => apiClient.get(`/admin/users${buildUserQuery(filters)}`),

  /**
   * Cập nhật thông tin mềm của người dùng (chỉ Admin)
   * @param {string} userId
   * @param {Object} payload
   * @returns {Promise<Object>} Người dùng đã cập nhật
   */
  updateAdminUser: (userId, payload) => apiClient.put(`/admin/users/${userId}`, payload),

  /**
   * Tạo tài khoản người dùng / nhân viên mới (chỉ Admin)
   * @param {Object} payload - username, email, password, role, fullName, phone, address
   * @returns {Promise<Object>} Người dùng đã tạo kèm trạng thái gửi email
   */
  createAdminUser: (payload) => apiClient.post('/admin/users', payload),

  /**
   * Cập nhật vai trò người dùng (chỉ Admin)
   * @param {string} userId
   * @param {'customer'|'staff'|'admin'} role
   * @returns {Promise<Object>} Người dùng đã cập nhật
   */
  updateUserRole: (userId, role) => apiClient.put(`/admin/users/${userId}/role`, { role }),

  /**
   * Cập nhật trạng thái chặn người dùng (chỉ Admin)
   * @param {string} userId
   * @param {boolean} isBlocked
   * @returns {Promise<Object>} Người dùng đã cập nhật
   */
  updateUserBlocked: (userId, isBlocked) => apiClient.put(`/admin/users/${userId}/block`, { isBlocked }),
};
