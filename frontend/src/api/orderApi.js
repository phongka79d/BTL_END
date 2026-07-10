import { apiClient } from './apiClient';

/**
 * Các hàm hỗ trợ API đơn hàng
 * Giao tiếp với các route /api/orders và /api/admin/orders của backend.
 */
export const orderApi = {
  /**
   * Tạo đơn hàng mới (checkout) từ giỏ hàng của người dùng đã xác thực.
   * @param {Object} shippingAddress - Đối tượng địa chỉ giao hàng
   * @returns {Promise<Object>} Đơn hàng đã tạo cùng chi tiết và thanh toán
   */
  createOrder: (shippingAddress) => apiClient.post('/orders', shippingAddress),

  /**
   * Lấy các đơn hàng của khách hàng đã xác thực, mới nhất trước.
   * @returns {Promise<Object>} Mảng đơn hàng cùng trạng thái và tóm tắt thanh toán
   */
  getMyOrders: () => apiClient.get('/orders/my-orders'),

  /**
   * Lấy một đơn hàng theo ID (đơn của chính khách hàng, mọi đơn hàng đối với admin).
   * @param {string|number} id - ID đơn hàng
   * @returns {Promise<Object>} Đơn hàng cùng chi tiết, tóm tắt sản phẩm và thanh toán
   */
  getOrderById: (id) => apiClient.get(`/orders/${id}`),

  /**
   * Lấy tất cả đơn hàng cho admin, mới nhất trước.
   * @param {string} [status] - Giá trị bộ lọc trạng thái tùy chọn
   * @returns {Promise<Object>} Mảng đơn hàng
   */
  getAdminOrders: (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiClient.get(`/admin/orders${query}`);
  },

  /**
   * Cập nhật trạng thái đơn hàng (chỉ admin).
   * @param {string|number} id - ID đơn hàng
   * @param {string} status - Giá trị trạng thái mới
   * @returns {Promise<Object>} Đơn hàng đã cập nhật
   */
  updateOrderStatus: (id, status) =>
    apiClient.put(`/admin/orders/${id}/status`, { status }),
};
