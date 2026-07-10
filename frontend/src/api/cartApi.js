import { apiClient } from './apiClient';

/**
 * Các hàm hỗ trợ API giỏ hàng cho việc đọc giỏ đã xác thực và thay đổi mục.
 */
export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addCartItem: ({ productId, quantity = 1 }) => apiClient.post('/cart/items', { productId, quantity }),
  updateCartItems: (items) => apiClient.put('/cart/items', { items }),
  updateCartItem: (cartItemId, quantity) => apiClient.put(`/cart/items/${cartItemId}`, { quantity }),
  removeCartItem: (cartItemId) => apiClient.delete(`/cart/items/${cartItemId}`),
};
