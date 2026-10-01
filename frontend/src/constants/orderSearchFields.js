/**
 * Allowlist trường tìm kiếm đơn hàng dùng chung cho các màn hình quản trị / nhân viên.
 *
 * Đây là bản sao ESM của backend/src/utils/orderSearchFields.js và phải khớp tuyệt đối
 * với ORDER_SEARCH_FIELDS phía backend. Chỉ gửi các giá trị này qua tham số
 * `searchField` của GET /api/admin/orders; backend từ chối mọi giá trị khác bằng HTTP 400.
 */
export const ORDER_SEARCH_FIELDS = {
  ALL: 'all',
  ORDER_ID: 'orderId',
  CUSTOMER: 'customer',
  SHIPPING_ADDRESS: 'shippingAddress',
};
