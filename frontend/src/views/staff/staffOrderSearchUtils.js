import { ORDER_SEARCH_FIELDS } from '../../constants/orderSearchFields.js';

export const ORDER_SEARCH_PAGE_SIZE = 10;

/**
 * Ghép tham số truy vấn cho GET /admin/orders.
 * Từ khóa được cắt khoảng trắng; tham số rỗng bị bỏ khỏi truy vấn thay vì gửi chuỗi rỗng.
 * searchField chỉ có ý nghĩa khi có từ khóa nên cũng bị bỏ khi từ khóa rỗng.
 */
export const buildOrderSearchQuery = ({
  page = 1,
  keyword = '',
  searchField = ORDER_SEARCH_FIELDS.ORDER_ID,
  status = ''
} = {}) => {
  const trimmedKeyword = (keyword || '').trim();

  return {
    page,
    limit: ORDER_SEARCH_PAGE_SIZE,
    status: status || undefined,
    keyword: trimmedKeyword || undefined,
    searchField: trimmedKeyword ? searchField : undefined
  };
};

/**
 * Chốt bản nháp từ khóa khi người dùng gửi tìm kiếm (Enter hoặc nút "Tìm kiếm").
 * Trả về từ khóa đã cắt khoảng trắng, truy vấn trang 1 theo phạm vi đang chọn và cờ cho biết
 * từ khóa có thực sự đổi hay không (nếu không đổi, effect không chạy lại nên cần tải lại chủ động).
 */
export const resolveOrderSearchSubmit = ({
  draftKeyword = '',
  keyword = '',
  searchField = ORDER_SEARCH_FIELDS.ORDER_ID,
  status = ''
} = {}) => {
  const nextKeyword = (draftKeyword || '').trim();

  return {
    keyword: nextKeyword,
    isKeywordUnchanged: nextKeyword === keyword,
    query: buildOrderSearchQuery({ page: 1, keyword: nextKeyword, searchField, status })
  };
};
