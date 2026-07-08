import { apiClient } from './apiClient';

const buildReviewQuery = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

/**
 * Review API helpers for product detail review UI.
 */
export const reviewApi = {
  getAdminReviews: (filters = {}) => apiClient.get(`/admin/reviews${buildReviewQuery(filters)}`),
  getProductReviews: (productId) => apiClient.get(`/products/${productId}/reviews`),
  createProductReview: (productId, payload) => apiClient.post(`/products/${productId}/reviews`, payload),
  hideReview: (reviewId) => apiClient.delete(`/admin/reviews/${reviewId}`),
};
