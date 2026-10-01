const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const emailService = require('../services/email.service');
const { validatePhone } = require('../utils/phoneValidation');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Hàm hỗ trợ loại bỏ passwordHash khỏi đối tượng người dùng
 * @param {Object} user 
 * @returns {Object|null}
 */
const serializeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const VALID_ROLES = ['customer', 'staff', 'admin'];
const SALT_ROUNDS = 10;
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
 * Lấy hồ sơ người dùng hiện tại
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
 * Cập nhật hồ sơ người dùng hiện tại
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, 401, 'Người dùng chưa được xác thực');
    }

    const { username, fullName, phone, address } = req.body;
    const phoneError = validatePhone(phone);
    if (phoneError) {
      return errorResponse(res, 400, phoneError);
    }

    const updateData = {};

    // Kiểm tra và giới hạn cập nhật trong các trường của Plan 1
    if (username !== undefined) {
      if (username === null || String(username).trim() === '') {
        return errorResponse(res, 400, 'Tên người dùng không được để trống');
      }
      updateData.username = username;
    }
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Kiểm tra có dữ liệu nào cần cập nhật hay không
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
 * Lấy tất cả người dùng cho admin
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
 * Cập nhật vai trò người dùng cho admin
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!VALID_ROLES.includes(role)) {
      return errorResponse(res, 400, 'Vai trò phải là customer, staff hoặc admin');
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
 * Cập nhật các trường hồ sơ người dùng cho admin
 * PUT /api/admin/users/:id
 */
const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const phoneError = validatePhone(req.body.phone);
    if (phoneError) {
      return errorResponse(res, 400, phoneError);
    }

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
 * Cập nhật trạng thái chặn người dùng cho admin
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

/**
 * Tạo tài khoản người dùng / nhân viên mới cho admin.
 * POST /api/admin/users
 */
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, fullName, phone, address, role } = req.body;
    const phoneError = validatePhone(phone);
    if (phoneError) {
      return errorResponse(res, 400, phoneError);
    }

    const requestedRole = role === undefined || role === null || role === ''
      ? 'staff'
      : String(role).trim();

    if (!VALID_ROLES.includes(requestedRole)) {
      return errorResponse(res, 400, 'Vai trò phải là customer, staff hoặc admin');
    }

    const normalizedEmail = String(email).trim();
    const existingUser = await userModel.findByEmail(normalizedEmail);
    if (existingUser) {
      return errorResponse(res, 400, 'Email đã được đăng ký');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userModel.create({
      username: String(username).trim(),
      email: normalizedEmail,
      passwordHash,
      fullName: fullName ? String(fullName).trim() : null,
      phone: phone ? String(phone).trim() : null,
      address: address ? String(address).trim() : null,
      role: requestedRole
    });

    // Gửi thông tin đăng nhập qua email ở chế độ tốt nhất có thể:
    // tài khoản vẫn được tạo ngay cả khi kênh email chưa được cấu hình.
    let emailDelivery = 'skipped';
    try {
      const delivery = await emailService.sendAccountCredentialsEmail({
        to: normalizedEmail,
        temporaryPassword: password,
        fullName: user.fullName,
        role: requestedRole
      });
      emailDelivery = delivery?.delivery || 'sent';
    } catch (emailError) {
      console.warn('Không thể gửi email thông tin tài khoản:', emailError.message);
    }

    return successResponse(res, 201, 'Đã tạo tài khoản người dùng thành công', {
      user: serializeUser(user),
      emailDelivery
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return errorResponse(res, 400, 'Email đã được đăng ký');
    }
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  createUser,
  updateUserRole,
  updateAdminUser,
  updateUserBlocked
};
