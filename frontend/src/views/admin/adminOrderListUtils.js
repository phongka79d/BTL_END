import { ORDER_SEARCH_FIELDS } from '../../constants/orderSearchFields.js';

/** Số đơn hàng mỗi trang cho bảng quản trị đơn hàng. */
export const ADMIN_ORDERS_PAGE_SIZE = 12;

/** Chuẩn hóa từ khóa tìm kiếm: chỉ nhận chuỗi và cắt khoảng trắng thừa. */
export const normalizeOrderKeyword = (value) =>
  typeof value === 'string' ? value.trim() : '';

/**
 * Dựng tham số truy vấn cho orderApi.getAdminOrders.
 *
 * - Chỉ gửi `status` khi có lọc trạng thái.
 * - Chỉ gửi `keyword` kèm `searchField: 'all'` khi có từ khóa, tránh truy vấn rỗng.
 * - Luôn giữ `page` và `limit` để phân trang đúng khi kết hợp lọc trạng thái và tìm kiếm.
 */
export const buildAdminOrdersQuery = ({
  keyword = '',
  status = '',
  page = 1,
  limit = ADMIN_ORDERS_PAGE_SIZE,
} = {}) => {
  const normalizedKeyword = normalizeOrderKeyword(keyword);

  return {
    status: status || undefined,
    keyword: normalizedKeyword || undefined,
    searchField: normalizedKeyword ? ORDER_SEARCH_FIELDS.ALL : undefined,
    page,
    limit,
  };
};

/**
 * Nội dung trạng thái rỗng: phân biệt rõ "chưa từng có đơn hàng" với
 * "không có đơn hàng khớp bộ lọc/từ khóa hiện tại" để người dùng biết cách thoát.
 */
export const getAdminOrdersEmptyCopy = ({
  keyword = '',
  status = '',
  statusLabel = '',
} = {}) => {
  const normalizedKeyword = normalizeOrderKeyword(keyword);

  if (normalizedKeyword && status) {
    return {
      title: 'Không có đơn hàng phù hợp',
      description: `Không tìm thấy đơn hàng nào khớp từ khóa "${normalizedKeyword}" với trạng thái "${statusLabel || status}". Hãy xóa bộ lọc hoặc thử lại với từ khóa, trạng thái khác.`,
    };
  }

  if (normalizedKeyword) {
    return {
      title: 'Không có đơn hàng phù hợp',
      description: `Không tìm thấy đơn hàng nào khớp từ khóa "${normalizedKeyword}". Hãy xóa tìm kiếm hoặc thử từ khóa khác.`,
    };
  }

  if (status) {
    return {
      title: 'Không có đơn hàng phù hợp',
      description: `Không có đơn hàng với trạng thái "${statusLabel || status}". Hãy xóa bộ lọc hoặc thử trạng thái khác.`,
    };
  }

  return {
    title: 'Chưa có đơn hàng',
    description:
      'Chưa có đơn hàng nào được đặt. Đơn hàng sẽ xuất hiện tại đây sau khi khách hàng hoàn tất thanh toán.',
  };
};

/** Dòng tóm tắt phía trên bảng, phản ánh số lượng và bộ lọc đang áp dụng. */
export const summarizeAdminOrders = ({
  count = 0,
  keyword = '',
  status = '',
  statusLabel = '',
} = {}) => {
  const normalizedKeyword = normalizeOrderKeyword(keyword);

  if (normalizedKeyword && status) {
    return `${count} đơn hàng phù hợp với từ khóa "${normalizedKeyword}" và trạng thái "${statusLabel || status}"`;
  }

  if (normalizedKeyword) {
    return `${count} đơn hàng phù hợp với từ khóa "${normalizedKeyword}"`;
  }

  if (status) {
    return `${count} đơn hàng với trạng thái "${statusLabel || status}"`;
  }

  return `Tổng cộng ${count} đơn hàng`;
};
