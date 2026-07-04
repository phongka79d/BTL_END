import { apiClient } from './apiClient';

/**
 * Category API helpers for public listing and admin category management routes.
 */
export const categoryApi = {
  getCategories: () => apiClient.get('/categories'),
  createCategory: (categoryData) => apiClient.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => apiClient.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => apiClient.delete(`/admin/categories/${id}`),
};
