import {
  PERMISSIONS,
  STAFF_AREA_CAPABILITIES,
  getRoleCapabilities,
  hasAnyCapability,
  hasCapability
} from '../constants/permissions.js';

/**
 * Capability bắt buộc cho từng trang trong khu vực vận hành (/staff).
 * - dashboard: chỉ cần quyền truy cập khu vực vận hành
 * - Các trang còn lại dùng capability riêng, độc lập với ORDERS_VIEW_ALL.
 */
export const STAFF_ROUTE_CAPABILITIES = Object.freeze({
  dashboard: null,
  orders: PERMISSIONS.ORDERS_VIEW_ALL,
  inventory: PERMISSIONS.PRODUCTS_UPDATE_STOCK,
  reviews: PERMISSIONS.REVIEWS_VIEW_ALL,
  reports: PERMISSIONS.REPORTS_VIEW_OPERATIONAL
});

/**
 * Kiểm tra một danh sách capability có được truy cập một trang vận hành hay không.
 * @param {string[]} capabilities - Danh sách capability đang có
 * @param {string} routeKey - Khóa trang trong STAFF_ROUTE_CAPABILITIES
 * @returns {boolean}
 */
export const canAccessStaffCapabilities = (capabilities, routeKey) => {
  if (!Object.prototype.hasOwnProperty.call(STAFF_ROUTE_CAPABILITIES, routeKey)) {
    return false;
  }

  const capability = STAFF_ROUTE_CAPABILITIES[routeKey];
  return capability
    ? hasCapability(capabilities, capability)
    : hasAnyCapability(capabilities, STAFF_AREA_CAPABILITIES);
};

/**
 * Kiểm tra xem một vai trò có được truy cập một trang vận hành cụ thể hay không.
 * @param {string} role - Vai trò của người dùng ('admin' | 'staff' | 'customer')
 * @param {string} routeKey - Khóa trang trong STAFF_ROUTE_CAPABILITIES
 * @returns {boolean}
 */
export const canAccessStaffRoute = (role, routeKey) => (
  canAccessStaffCapabilities(getRoleCapabilities(role), routeKey)
);
