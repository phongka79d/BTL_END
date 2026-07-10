const userModel = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Helper to remove passwordHash from user object
 * @param {Object} user 
 * @returns {Object|null}
 */
const serializeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const VALID_ROLES = ['customer', 'admin'];
const ADMIN_EDITABLE_FIELDS = ['username', 'fullName', 'phone', 'address'];

const normalizeEditableValue = (value) => {
  if (value === null) {
    return null;
  }

  return typeof value === 'string' ? value.trim() : value;
};

const getAdminUserUpdateData = (body) => {
  const updateData = {};

  ADMIN_EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      updateData[field] = normalizeEditableValue(body[field]);
    }
  });

  return updateData;
};

/**
 * Get current user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 401, 'Người dùng chưa được xác thực');
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'Không tìm thấy người dùng');
    }

    return successResponse(res, 200, 'Đã lấy hồ sơ người dùng thành công', {
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 401, 'Người dùng chưa được xác thực');
    }

    const { username, fullName, phone, address } = req.body;
    const updateData = {};

    // Validate and limit updates to Plan 1 fields
    if (username !== undefined) {
      if (username === null || String(username).trim() === '') {
        return errorResponse(res, 400, 'Tên người dùng không được để trống');
      }
      updateData.username = username;
    }
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Check if there is anything to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'Chưa cung cấp trường nào để cập nhật');
    }

    const updatedUser = await userModel.update(req.user.id, updateData);

    return successResponse(res, 200, 'Đã cập nhật hồ sơ người dùng thành công', {
      user: serializeUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users for admin
 * GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { keyword, page, limit } = req.query;
    const result = await userModel.findAll({ keyword, page, limit });
    const safeUsers = result.items.map(user => serializeUser(user));

    return successResponse(res, 200, 'Đã lấy danh sách người dùng thành công', {
      items: safeUsers,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role for admin
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      return errorResponse(res, 400, 'Vai trò phải là customer hoặc admin');
    }

    if (req.user?.id === id) {
      return errorResponse(res, 400, 'Bạn không thể thay đổi vai trò quản trị viên của chính mình');
    }

    const user = await userModel.updateRole(id, role);

    return successResponse(res, 200, 'Đã cập nhật vai trò người dùng thành công', {
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update soft user profile fields for admin
 * PUT /api/admin/users/:id
 */
const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = getAdminUserUpdateData(req.body);

    if (updateData.username !== undefined && updateData.username === '') {
        return errorResponse(res, 400, 'Tên người dùng không được để trống');
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'Chưa cung cấp trường có thể chỉnh sửa để cập nhật');
    }

    const user = await userModel.updateAdminProfile(id, updateData);

    return successResponse(res, 200, 'Đã cập nhật hồ sơ người dùng thành công', {
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user blocked status for admin
 * PUT /api/admin/users/:id/block
 */
const updateUserBlocked = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return errorResponse(res, 400, 'Trạng thái khóa phải là true hoặc false');
    }

    if (req.user?.id === id && isBlocked) {
      return errorResponse(res, 400, 'Bạn không thể khóa tài khoản quản trị viên của chính mình');
    }

    const user = await userModel.updateBlocked(id, isBlocked);

    return successResponse(res, 200, isBlocked ? 'Đã khóa người dùng thành công' : 'Đã mở khóa người dùng thành công', {
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  updateUserRole,
  updateAdminUser,
  updateUserBlocked
};
