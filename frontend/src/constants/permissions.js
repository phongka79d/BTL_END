/**
 * Danh mục quyền (Capabilities / Permissions) phía frontend.
 * Đồng bộ chính xác với backend/src/config/permissions.js.
 */
export const PERMISSIONS = {
  // Đơn hàng
  ORDERS_VIEW_ALL: 'orders.view_all',
  ORDERS_UPDATE_STATUS: 'orders.update_status',

  // Sản phẩm & Kho hàng
  PRODUCTS_VIEW_CATALOG: 'products.view_catalog',
  PRODUCTS_UPDATE_STOCK: 'products.update_stock',
  PRODUCTS_MANAGE_CATALOG: 'products.manage_catalog',
  PRODUCTS_DELETE: 'products.delete',

  // Danh mục
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_MANAGE: 'categories.manage',

  // Đánh giá
  REVIEWS_VIEW_ALL: 'reviews.view_all',
  REVIEWS_MODERATE: 'reviews.moderate',

  // Báo cáo & Thống kê
  REPORTS_VIEW_OPERATIONAL: 'reports.view_operational',
  REPORTS_VIEW_REVENUE: 'reports.view_revenue',

  // Quản lý người dùng
  USERS_VIEW_ALL: 'users.view_all',
  USERS_MANAGE_ROLE: 'users.manage_role',
  USERS_BLOCK: 'users.block',

  // Quản lý giao diện Storefront
  STOREFRONT_MANAGE: 'storefront.manage'
};

/**
 * Ma trận phân quyền theo vai trò (Role-to-Capabilities Mapping)
 */
export const ROLE_CAPABILITIES = {
  admin: Object.values(PERMISSIONS),
  staff: [
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_STATUS,
    PERMISSIONS.PRODUCTS_VIEW_CATALOG,
    PERMISSIONS.PRODUCTS_UPDATE_STOCK,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.REVIEWS_VIEW_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.REPORTS_VIEW_OPERATIONAL
  ],
  customer: []
};

/**
 * Kiểm tra xem một vai trò có quyền thực hiện capability chỉ định hay không.
 * @param {string} role - Vai trò của người dùng ('admin' | 'staff' | 'customer')
 * @param {string} permission - Quyền cần kiểm tra
 * @returns {boolean}
 */
export const hasRolePermission = (role, permission) => {
  if (!role) return false;
  const capabilities = ROLE_CAPABILITIES[role] || [];
  return capabilities.includes('*') || capabilities.includes(permission);
};
