const { hasRolePermission } = require('../config/permissions');
const { errorResponse } = require('../utils/response');

/**
 * Middleware kiểm tra quyền theo capability.
 * Yêu cầu `req.user` đã được gán bởi middleware `protect`.
 * @param {string} permission - Mã quyền cần kiểm tra (từ PERMISSIONS)
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Không được phép, chưa xác thực');
    }

    const userRole = req.user.role || 'customer';
    if (hasRolePermission(userRole, permission)) {
      return next();
    }

    return errorResponse(
      res,
      403,
      'Bị từ chối, bạn không có quyền thực hiện hành động này'
    );
  };
};

/**
 * Middleware kiểm tra nếu người dùng sở hữu ít nhất một trong các quyền chỉ định.
 * @param {string[]} permissions - Mảng các mã quyền
 */
const requireAnyPermission = (permissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Không được phép, chưa xác thực');
    }

    const userRole = req.user.role || 'customer';
    const isAllowed = permissions.some((perm) => hasRolePermission(userRole, perm));

    if (isAllowed) {
      return next();
    }

    return errorResponse(
      res,
      403,
      'Bị từ chối, bạn không có quyền thực hiện hành động này'
    );
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission
};
