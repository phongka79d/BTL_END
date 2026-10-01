import { apiClient } from './apiClient.js';

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
  // stockStatus ('low' | 'out') được serialize như mọi filter khác; giá trị rỗng sẽ bị bỏ qua.
  getProducts: (filters = {}) => apiClient.get(`/products${buildProductQuery(filters)}`, { cache: 'no-store' }),
  getProductById: (id) => apiClient.get(`/products/${id}`, { cache: 'no-store' }),
  createProduct: (productData) => apiClient.post('/admin/products', productData),
  updateProduct: (id, productData) => apiClient.put(`/admin/products/${id}`, productData),
  updateStock: (id, quantity) => apiClient.put(`/products/${id}/stock`, { quantity }),
  deleteProduct: (id) => apiClient.delete(`/admin/products/${id}`),
};
