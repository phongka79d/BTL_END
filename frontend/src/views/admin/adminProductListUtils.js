/** Chuẩn hóa categoryId đọc từ URL: chỉ nhận chuỗi và cắt khoảng trắng thừa. */
export const normalizeCategoryId = (value) =>
  typeof value === 'string' ? value.trim() : '';

/**
 * Xóa bộ lọc danh mục khỏi URL nhưng giữ nguyên từ khóa và mọi tham số khác.
 * Không sửa trực tiếp tham số đầu vào để tránh thay đổi state của React Router.
 */
export const removeCategoryFilter = (searchParams) => {
  const next = new URLSearchParams(searchParams);
  next.delete('categoryId');
  return next;
};

/**
 * Nhãn hiển thị cho bộ lọc danh mục: ưu tiên tên danh mục đã tải,
 * tạm dùng mã danh mục khi danh sách chưa tải xong hoặc không tìm thấy.
 */
export const resolveCategoryLabel = (categories, categoryId) => {
  const normalizedId = normalizeCategoryId(categoryId);

  if (!normalizedId) {
    return '';
  }

  const match = (categories || []).find(
    (category) => String(category?.id) === normalizedId
  );

  return match?.name || `#${normalizedId}`;
};

/**
 * Nội dung trạng thái rỗng cho danh sách sản phẩm: phân biệt rõ
 * "chưa có sản phẩm" với "không có sản phẩm khớp bộ lọc danh mục/từ khóa"
 * và luôn kèm hành động để người dùng thoát khỏi trạng thái rỗng.
 */
export const getProductListEmptyCopy = ({
  categoryId = '',
  categoryLabel = '',
  keyword = ''
} = {}) => {
  const normalizedCategoryId = normalizeCategoryId(categoryId);
  const normalizedKeyword = typeof keyword === 'string' ? keyword.trim() : '';
  const label = categoryLabel || `#${normalizedCategoryId}`;

  if (normalizedCategoryId && normalizedKeyword) {
    return {
      title: 'Không có sản phẩm phù hợp',
      description: `Không tìm thấy sản phẩm nào khớp từ khóa "${normalizedKeyword}" trong danh mục ${label}. Hãy xóa bộ lọc danh mục hoặc thử từ khóa khác.`,
      actionLabel: 'Xóa bộ lọc danh mục',
      action: 'clearCategory'
    };
  }

  if (normalizedCategoryId) {
    return {
      title: 'Danh mục chưa có sản phẩm',
      description: `Danh mục ${label} hiện chưa có sản phẩm nào. Hãy xóa bộ lọc danh mục để xem toàn bộ sản phẩm.`,
      actionLabel: 'Xóa bộ lọc danh mục',
      action: 'clearCategory'
    };
  }

  if (normalizedKeyword) {
    return {
      title: 'Không có sản phẩm phù hợp',
      description: 'Hãy xóa tìm kiếm hoặc thử tên sản phẩm hay thương hiệu khác.',
      actionLabel: 'Xóa tìm kiếm',
      action: 'clearSearch'
    };
  }

  return {
    title: 'Chưa có sản phẩm',
    description: 'Hãy tạo sản phẩm đầu tiên để bổ sung vào danh mục.',
    actionLabel: 'Tạo sản phẩm',
    action: 'create'
  };
};
