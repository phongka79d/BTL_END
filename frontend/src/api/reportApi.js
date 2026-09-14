import { apiClient } from './apiClient';

/**
 * Tạo chuỗi truy vấn khoảng thời gian cho các báo cáo.
 * Không truyền tham số nào sẽ giữ nguyên hành vi báo cáo toàn thời gian.
 * @param {{startDate?: string, endDate?: string}} [range]
 * @returns {string}
 */
const buildRangeQuery = (range = {}) => {
  if (!range) return '';

  const params = new URLSearchParams();

  if (range.startDate) {
    params.set('startDate', range.startDate);
  }
  if (range.endDate) {
    params.set('endDate', range.endDate);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

/**
 * Các hàm hỗ trợ API báo cáo của admin.
 */
export const reportApi = {
  getRevenueReport: (range) =>
    apiClient.get(`/admin/reports/revenue${buildRangeQuery(range)}`),
  getBestSellingProductsReport: (range) =>
    apiClient.get(`/admin/reports/best-selling-products${buildRangeQuery(range)}`),
  getOrderSummaryReport: (range) =>
    apiClient.get(`/admin/reports/order-summary${buildRangeQuery(range)}`),
};
