import { apiClient } from './apiClient';

/**
 * Order API helpers
 * Communicates with backend /api/orders and /api/admin/orders routes.
 */
export const orderApi = {
  /**
   * Create a new order (checkout) from the authenticated user's cart.
   * @param {Object} shippingAddress - Shipping address object
   * @returns {Promise<Object>} Created order with details and payment
   */
  createOrder: (shippingAddress) => apiClient.post('/orders', shippingAddress),

  /**
   * Retrieve the authenticated customer's orders, newest first.
   * @returns {Promise<Object>} Array of orders with status and payment summary
   */
  getMyOrders: () => apiClient.get('/orders/my-orders'),

  /**
   * Retrieve a single order by ID (own order for customer, any order for admin).
   * @param {string|number} id - Order ID
   * @returns {Promise<Object>} Order with details, product summary, and payment
   */
  getOrderById: (id) => apiClient.get(`/orders/${id}`),

  /**
   * Retrieve all orders for admin, newest first.
   * @param {string} [status] - Optional status filter value
   * @returns {Promise<Object>} Array of orders
   */
  getAdminOrders: (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiClient.get(`/admin/orders${query}`);
  },

  /**
   * Update an order's status (admin only).
   * @param {string|number} id - Order ID
   * @param {string} status - New status value
   * @returns {Promise<Object>} Updated order
   */
  updateOrderStatus: (id, status) =>
    apiClient.put(`/admin/orders/${id}/status`, { status }),
};
