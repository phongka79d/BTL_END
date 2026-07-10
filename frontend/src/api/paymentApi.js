import { apiClient } from './apiClient';

/**
 * Các hàm hỗ trợ API thanh toán
 * Giao tiếp với các route /api/payments của backend.
 * Chỉ COD — không tích hợp cổng thanh toán trực tuyến.
 */
export const paymentApi = {
  /**
   * Tạo hoặc trả về bản ghi thanh toán COD hiện có của một đơn hàng.
   * @param {Object} params
   * @param {string|number} params.orderId - ID đơn hàng
   * @returns {Promise<Object>} Bản ghi thanh toán
   */
  createCODPayment: ({ orderId }) => apiClient.post('/payments/cod', { orderId }),
};
