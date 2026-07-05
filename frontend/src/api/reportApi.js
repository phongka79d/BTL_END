import { apiClient } from './apiClient';

/**
 * Admin report API helpers.
 */
export const reportApi = {
  getRevenueReport: () => apiClient.get('/admin/reports/revenue'),
  getBestSellingProductsReport: () =>
    apiClient.get('/admin/reports/best-selling-products'),
  getOrderSummaryReport: () => apiClient.get('/admin/reports/order-summary'),
};
