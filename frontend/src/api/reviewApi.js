import { apiClient } from './apiClient';

/**
 * Review API helpers for product detail review UI.
 */
export const reviewApi = {
  getProductReviews: (productId) => apiClient.get(`/products/${productId}/reviews`),
  createProductReview: (productId, payload) => apiClient.post(`/products/${productId}/reviews`, payload),
  hideReview: (reviewId) => apiClient.delete(`/admin/reviews/${reviewId}`),
};
