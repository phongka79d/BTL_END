import { apiClient } from './apiClient.js';

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
   * Lấy tất cả đơn hàng cho admin / staff, mới nhất trước.
   * @param {string|Object} [params] - Trạng thái hoặc đối tượng bộ lọc
   *   { status, keyword|search, searchField, page, limit }
   * @returns {Promise<Object>} Mảng đơn hàng
   */
  getAdminOrders: (params) => {
    if (!params) return apiClient.get('/admin/orders');
    if (typeof params === 'string') {
      return apiClient.get(`/admin/orders?status=${encodeURIComponent(params)}`);
    }
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    const kw = params.keyword || params.search;
    if (kw) {
      searchParams.set('keyword', kw);
      searchParams.set('search', kw);
    }
    if (params.searchField) searchParams.set('searchField', params.searchField);
    if (params.page !== undefined && params.page !== null && params.page !== '') {
      searchParams.set('page', String(params.page));
    }
    if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
      searchParams.set('limit', String(params.limit));
    }
    const query = searchParams.toString();
    return apiClient.get(`/admin/orders${query ? `?${query}` : ''}`);
  },
  /**
   * Khách hàng tự hủy đơn hàng của mình
   * (chỉ khi đơn đang chờ xác nhận hoặc đã xác nhận).
   * @param {string|number} id - ID đơn hàng
   * @returns {Promise<Object>} Đơn hàng đã hủy
   */
  cancelOrder: (id) => apiClient.put(`/orders/${id}/cancel`),

  /**
   * Cập nhật trạng thái đơn hàng (admin / staff).
   * @param {string|number} id - ID đơn hàng
   * @param {string} status - Giá trị trạng thái mới
   * @returns {Promise<Object>} Đơn hàng đã cập nhật
   */
  updateOrderStatus: (id, status) =>
    apiClient.put(`/admin/orders/${id}/status`, { status }),
};
