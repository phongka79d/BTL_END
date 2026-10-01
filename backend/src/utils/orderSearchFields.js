/**
 * Allowlist các trường tìm kiếm của API đơn hàng quản trị (/api/admin/orders).
 *
 * Đây là nguồn chân lý duy nhất cho tên trường tìm kiếm mà backend chấp nhận.
 * Model và controller chỉ dựng bộ lọc Prisma từ các giá trị trong allowlist này,
 * không bao giờ truyền tên trường tùy ý từ phía client xuống Prisma.
 *
 * Tệp ESM phía frontend (frontend/src/constants/orderSearchFields.js) là bản sao
 * phải khớp tuyệt đối các giá trị dưới đây.
 */
const ORDER_SEARCH_FIELDS = Object.freeze({
  ALL: 'all',
  ORDER_ID: 'orderId',
  CUSTOMER: 'customer',
  SHIPPING_ADDRESS: 'shippingAddress'
});

const ORDER_SEARCH_FIELD_VALUES = Object.freeze(Object.values(ORDER_SEARCH_FIELDS));

/**
 * Kiểm tra một giá trị có phải tên trường tìm kiếm hợp lệ trong allowlist.
 *
 * @param {*} value
 * @returns {boolean}
 */
const isOrderSearchField = (value) =>
  typeof value === 'string' && ORDER_SEARCH_FIELD_VALUES.includes(value);

module.exports = {
  ORDER_SEARCH_FIELDS,
  ORDER_SEARCH_FIELD_VALUES,
  isOrderSearchField
};
