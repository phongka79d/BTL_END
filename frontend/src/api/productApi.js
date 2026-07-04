import { apiClient } from './apiClient';

const buildProductQuery = (filters = {}) => {
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
 * Product API helpers for public catalog and admin product management routes.
 */
export const productApi = {
  getProducts: (filters = {}) => apiClient.get(`/products${buildProductQuery(filters)}`),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  createProduct: (productData) => apiClient.post('/admin/products', productData),
  updateProduct: (id, productData) => apiClient.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
};
