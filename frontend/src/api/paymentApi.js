import { apiClient } from './apiClient';

/**
 * Payment API helpers
 * Communicates with backend /api/payments routes.
 * COD-only — no online payment gateway integration.
 */
export const paymentApi = {
  /**
   * Create or return an existing COD payment record for an order.
   * @param {Object} params
   * @param {string|number} params.orderId - The order ID
   * @returns {Promise<Object>} Payment record
   */
  createCODPayment: ({ orderId }) => apiClient.post('/payments/cod', { orderId }),
};
