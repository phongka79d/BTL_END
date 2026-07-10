import { apiClient } from './apiClient';

/**
 * Các hàm hỗ trợ API báo cáo của admin.
 */
export const reportApi = {
  getRevenueReport: () => apiClient.get('/admin/reports/revenue'),
  getBestSellingProductsReport: () =>
    apiClient.get('/admin/reports/best-selling-products'),
  getOrderSummaryReport: () => apiClient.get('/admin/reports/order-summary'),
};
