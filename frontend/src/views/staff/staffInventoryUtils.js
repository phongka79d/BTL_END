import { validateInventoryQuantity } from '../../utils/quantityValidation.js';

export const INVENTORY_PAGE_SIZE = 12;
export const INVENTORY_LOAD_ERROR_MESSAGE = 'Không thể tải danh sách tồn kho. Vui lòng thử lại.';

/**
 * Tạo tham số truy vấn cho API danh sách sản phẩm của màn hình tồn kho.
 * stockStatus được lọc và phân trang ở backend ('low': quantity <= 5, 'out': quantity = 0);
 * giá trị rỗng nghĩa là không lọc. Từ khóa được cắt khoảng trắng trước khi gửi.
 */
export const buildInventoryQuery = ({ page = 1, keyword = '', stockStatus = '' } = {}) => {
  const normalizedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

  return {
    page,
    limit: INVENTORY_PAGE_SIZE,
    keyword: normalizedKeyword || undefined,
    stockStatus: stockStatus || undefined
  };
};

/**
 * Kiểm tra bản nháp số lượng tồn kho đang nhập (giữ nguyên chuỗi gốc, không parseInt).
 * Trả về thông báo lỗi hoặc null khi hợp lệ.
 */
export const getStockDraftError = (draft) => validateInventoryQuantity(draft);

/**
 * Bản nháp tồn kho có thể lưu hay không (0 vẫn hợp lệ).
 */
export const canSaveStockDraft = (draft) => getStockDraftError(draft) === null;

/**
 * Chuẩn hóa phân trang backend trả về cho bộ lọc đang áp dụng.
 * Tổng số bản ghi lấy theo bộ lọc từ backend, không đếm lại trên trang hiện tại.
 */
export const resolveInventoryPagination = (pagination, fallbackTotal = 0) => {
  const page = Math.max(1, Number(pagination?.page) || 1);
  const totalPages = Math.max(1, Number(pagination?.totalPages) || 1);
  const rawTotal = pagination?.total;
  const hasTotal = rawTotal !== undefined && rawTotal !== null && Number.isFinite(Number(rawTotal));

  return {
    page,
    totalPages,
    total: hasTotal ? Number(rawTotal) : fallbackTotal
  };
};
