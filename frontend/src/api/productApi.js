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
 * Các hàm hỗ trợ API sản phẩm cho danh mục công khai và route quản lý sản phẩm của admin.
 */
export const productApi = {
  getProducts: (filters = {}) => apiClient.get(`/products${buildProductQuery(filters)}`),
  getProductById: (id) => apiClient.get(`/products/${id}`),
  createProduct: (productData) => apiClient.post('/admin/products', productData),
  updateProduct: (id, productData) => apiClient.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
};
