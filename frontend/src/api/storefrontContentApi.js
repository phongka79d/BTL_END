import { apiClient } from './apiClient';

export const storefrontContentApi = {
  getCarousel: () => apiClient.get('/storefront/carousel'),
  getNavigation: () => apiClient.get('/storefront/navigation'),
  getFeaturedProducts: () => apiClient.get('/storefront/featured-products'),
  getAdminCarousel: () => apiClient.get('/admin/storefront/carousel'),
  createCarouselSlide: (payload) => apiClient.post('/admin/storefront/carousel', payload),
  updateCarouselSlide: (id, payload) => apiClient.put(`/admin/storefront/carousel/${id}`, payload),
  deleteCarouselSlide: (id) => apiClient.delete(`/admin/storefront/carousel/${id}`),
  getAdminNavigation: () => apiClient.get('/admin/storefront/navigation'),
  createNavigationItem: (payload) => apiClient.post('/admin/storefront/navigation', payload),
  updateNavigationItem: (id, payload) => apiClient.put(`/admin/storefront/navigation/${id}`, payload),
  deleteNavigationItem: (id) => apiClient.delete(`/admin/storefront/navigation/${id}`),
  getAdminFeaturedProducts: () => apiClient.get('/admin/storefront/featured-products'),
  createFeaturedProduct: (payload) => apiClient.post('/admin/storefront/featured-products', payload),
  createFeaturedProductsBulk: (payload) => apiClient.post('/admin/storefront/featured-products/bulk', payload),
  reorderFeaturedProducts: (orderedIds) => apiClient.put('/admin/storefront/featured-products/reorder', { orderedIds }),
  updateFeaturedProduct: (id, payload) => apiClient.put(`/admin/storefront/featured-products/${id}`, payload),
  deleteFeaturedProduct: (id) => apiClient.delete(`/admin/storefront/featured-products/${id}`),
  updateStorefrontSettings: (payload) => apiClient.put('/admin/storefront/settings', payload),
};
