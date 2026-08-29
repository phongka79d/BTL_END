import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component kiểm tra quyền theo capability hoặc vai trò trước khi render children.
 * 
 * Ví dụ sử dụng:
 * <Can do="orders.update_status" fallback={<Badge variant="muted">Chỉ đọc</Badge>}>
 *   <Button onClick={handleUpdateStatus}>Cập nhật trạng thái</Button>
 * </Can>
 * 
 * <Can any={['products.manage_catalog', 'products.update_stock']}>
 *   <StockActionPanel />
 * </Can>
 */
export const Can = ({
  do: permission,
  any: permissions,
  role,
  fallback = null,
  children
}) => {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return fallback;
  }

  // Kiểm tra vai trò cụ thể nếu được truyền
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return fallback;
    }
  }

  // Kiểm tra capability đơn lẻ
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  // Kiểm tra bất kỳ capability nào trong danh sách
  if (permissions && Array.isArray(permissions)) {
    const hasAny = permissions.some((perm) => hasPermission(perm));
    if (!hasAny) {
      return fallback;
    }
  }

  return <>{children}</>;
};

export default Can;
