const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const emailService = require('../services/email.service');
const addressService = require('../services/address.service');
const { validatePhone } = require('../utils/phoneValidation');
const { successResponse, errorResponse } = require('../utils/response');
const ADDRESS_PROVIDER_ERROR_MESSAGE = 'Không thể xác thực địa chỉ lúc này. Vui lòng thử lại.';

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
  if (value === null) return null;
  return typeof value === 'string' ? value.trim() : value;
};

const getAdminUserUpdateData = (body) => {
  const updateData = {};

  ADMIN_EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      updateData[field] = field === 'address'
        ? body[field]
        : normalizeEditableValue(body[field]);
    }
  });

  return updateData;
};
const hasCompleteStructuredAddress = (user) => [
  'addressProvinceCode',
  'addressProvinceName',
  'addressWardCode',
  'addressWardName',
  'addressDetail',
].every((field) => typeof user?.[field] === 'string' && user[field].trim() !== '');

const hasUnstructuredLegacyAddress = (user) => (
  typeof user?.address === 'string'
  && user.address.trim() !== ''
  && !hasCompleteStructuredAddress(user)
);

const rejectLegacyAddressEdit = async (id, res) => {
  const currentUser = await userModel.findById(id);
  if (!hasUnstructuredLegacyAddress(currentUser)) return false;

  const message = 'Vui lòng chọn lại địa chỉ theo danh sách.';
  errorResponse(res, 400, message, [{ field: 'address', message }]);
  return true;
};

const respondToAddressError = (res, error) => {
  const status = error?.statusCode || error?.status;
  if (status !== 400 && status !== 503) return false;

  const message = status === 503
    ? ADDRESS_PROVIDER_ERROR_MESSAGE
    : (typeof error.message === 'string' ? error.message : 'Địa chỉ không hợp lệ.');
  const errors = Array.isArray(error.errors)
    ? error.errors
    : [{ field: 'address', message }];
  errorResponse(res, status, message, errors);
  return true;
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

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 50;

/**
 * Kiểm tra tên người dùng: chuỗi, 3–50 ký tự sau khi cắt khoảng trắng, không trùng người khác
 * (không phân biệt hoa/thường). Bỏ qua khi tên không đổi so với currentUsername, để các tài khoản
 * cũ (trùng tên hoặc tên ngắn từ trước) vẫn lưu được hồ sơ. Trả về thông báo lỗi hoặc null.
 */
const checkUsername = async (username, excludeUserId, currentUsername) => {
  if (typeof username !== 'string' || username.trim() === '') {
    return 'Tên người dùng không được để trống';
  }
  const trimmed = username.trim();
  if (typeof currentUsername === 'string' && currentUsername.trim().toLowerCase() === trimmed.toLowerCase()) {
    return null;
  }
  if (trimmed.length < USERNAME_MIN_LENGTH || trimmed.length > USERNAME_MAX_LENGTH) {
    return `Tên người dùng phải có từ ${USERNAME_MIN_LENGTH} đến ${USERNAME_MAX_LENGTH} ký tự`;
  }
  if (await userModel.findByUsername(trimmed, excludeUserId)) {
    return 'Tên người dùng đã được sử dụng';
  }
  return null;
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

    if (username !== undefined) {
      const usernameError = await checkUsername(username, req.user.id, req.user.username);
      if (usernameError) {
        return errorResponse(res, 400, usernameError);
      }
      updateData.username = username.trim();
    }
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (address === null && await rejectLegacyAddressEdit(req.user.id, res)) return;
    if (address !== undefined) {
      let resolvedAddress = null;
      if (address !== null) {
        try {
          resolvedAddress = await addressService.resolveAddress(address, { required: true });
        } catch (error) {
          if (respondToAddressError(res, error)) return;
          throw error;
        }
      }
      Object.assign(updateData, addressService.toUserAddressFields(resolvedAddress));
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'Chưa cung cấp trường nào để cập nhật');
    }
    if (address === undefined && await rejectLegacyAddressEdit(req.user.id, res)) return;

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
    const { keyword, page, limit, role } = req.query;
    if (role !== undefined && role !== '' && (typeof role !== 'string' || !VALID_ROLES.includes(role))) {
      const message = 'Vai trò phải là customer, staff hoặc admin';
      return errorResponse(res, 400, message, [{ field: 'role', message }]);
    }

    const result = await userModel.findAll({
      keyword,
      page,
      limit,
      ...(role === undefined || role === '' ? {} : { role })
    });
    const safeUsers = result.items.map(user => serializeUser(user));

    return successResponse(res, 200, 'Đã lấy danh sách người dùng thành công', {
      items: safeUsers,
      pagination: result.pagination
    });
  } catch (error) {
    if (error.status === 400) {
      return errorResponse(res, 400, error.message);
    }
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

    if (updateData.username !== undefined) {
      const target = await userModel.findById(id);
      const usernameError = await checkUsername(updateData.username, id, target ? target.username : undefined);
      if (usernameError) {
        return errorResponse(res, 400, usernameError);
      }
      updateData.username = updateData.username.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, 'Chưa cung cấp trường có thể chỉnh sửa để cập nhật');
    }

    if (updateData.address === null && await rejectLegacyAddressEdit(id, res)) return;
    if (updateData.address !== undefined) {
      let resolvedAddress = null;
      if (updateData.address !== null) {
        try {
          resolvedAddress = await addressService.resolveAddress(updateData.address, { required: true });
        } catch (error) {
          if (respondToAddressError(res, error)) return;
          throw error;
        }
      }
      Object.assign(updateData, addressService.toUserAddressFields(resolvedAddress));
    } else if (await rejectLegacyAddressEdit(id, res)) {
      return;
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

    let resolvedAddress;
    try {
      resolvedAddress = await addressService.resolveAddress(address, { required: false });
    } catch (error) {
      if (respondToAddressError(res, error)) return;
      throw error;
    }
    const userAddressFields = addressService.toUserAddressFields(resolvedAddress);

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await userModel.findByEmail(normalizedEmail);
    if (existingUser) {
      return errorResponse(res, 400, 'Email đã được đăng ký');
    }
    const usernameError = await checkUsername(username);
    if (usernameError) {
      return errorResponse(res, 400, usernameError);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userModel.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      fullName: fullName ? String(fullName).trim() : null,
      phone: phone ? String(phone).trim() : null,
      ...userAddressFields,
      role: requestedRole
    });

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
