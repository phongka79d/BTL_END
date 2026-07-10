import { apiClient } from './apiClient';

/**
 * Các hàm hỗ trợ API danh mục cho route liệt kê công khai và quản lý danh mục của admin.
 */
export const categoryApi = {
  getCategories: () => apiClient.get('/categories'),
  createCategory: (categoryData) => apiClient.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => apiClient.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),
};
