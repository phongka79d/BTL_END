import { apiClient } from './apiClient';

export const storefrontContentApi = {
  getCarousel: () => apiClient.get('/storefront/carousel'),
  getNavigation: () => apiClient.get('/storefront/navigation'),
  getAdminCarousel: () => apiClient.get('/admin/storefront/carousel'),
  createCarouselSlide: (payload) => apiClient.post('/admin/storefront/carousel', payload),
  updateCarouselSlide: (id, payload) => apiClient.put(`/admin/storefront/carousel/${id}`, payload),
  deleteCarouselSlide: (id) => apiClient.delete(`/admin/storefront/carousel/${id}`),
  getAdminNavigation: () => apiClient.get('/admin/storefront/navigation'),
  createNavigationItem: (payload) => apiClient.post('/admin/storefront/navigation', payload),
  updateNavigationItem: (id, payload) => apiClient.put(`/admin/storefront/navigation/${id}`, payload),
  deleteNavigationItem: (id) => apiClient.delete(`/admin/storefront/navigation/${id}`),
};
