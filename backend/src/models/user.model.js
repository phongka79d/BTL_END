const prisma = require('../config/database');

const USER_SAFE_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phone: true,
  address: true,
  addressProvinceCode: true,
  addressProvinceName: true,
  addressWardCode: true,
  addressWardName: true,
  addressDetail: true,
  role: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Tìm người dùng theo email
 * @param {string} email 
 * @returns {Promise<Object|null>}
 */
const findByEmail = async (email) => {
  if (typeof email !== 'string' || email.trim() === '') return null;
  // Không phân biệt hoa/thường để Ada@x.com và ada@x.com là cùng một tài khoản.
  return prisma.user.findFirst({
    where: { email: { equals: email.trim(), mode: 'insensitive' } },
  });
};

/**
 * Tìm người dùng có tên trùng (đã cắt khoảng trắng, không phân biệt hoa/thường).
 * @param {string} username
 * @param {string} [excludeId] - bỏ qua chính người dùng đang sửa hồ sơ
 * @returns {Promise<Object|null>}
 */
const findByUsername = async (username, excludeId) => {
  if (typeof username !== 'string' || username.trim() === '') return null;
  return prisma.user.findFirst({
    where: {
      username: { equals: username.trim(), mode: 'insensitive' },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
};

/**
 * Tìm người dùng theo ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Tạo người dùng mới
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
const create = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

/**
 * Cập nhật chi tiết hồ sơ người dùng
 * @param {string} id 
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
const update = async (id, userData) => {
  return prisma.user.update({
    where: { id },
    data: userData,
  });
};

/**
 * Lấy danh sách người dùng cho admin với tìm kiếm và phân trang.
 * @param {Object} params
 * @param {string} [params.keyword]
 * @param {number|string} [params.page]
 * @param {number|string} [params.limit]
 * @param {string} [params.role]
 * @returns {Promise<Object>}
 */
const findAll = async (params = {}) => {
  const { keyword, page, limit, role } = params;
  const where = {};

  if (role !== undefined && role !== '') {
    if (typeof role !== 'string' || !['customer', 'staff', 'admin'].includes(role)) {
      const error = new Error('Vai trò phải là customer, staff hoặc admin');
      error.status = 400;
      error.statusCode = 400;
      throw error;
    }
    where.role = role;
  }

  if (keyword !== undefined && keyword !== '' && typeof keyword !== 'string') {
    const error = new Error('Từ khóa tìm kiếm không hợp lệ');
    error.status = 400;
    error.statusCode = 400;
    throw error;
  }
  if (keyword) {
    where.OR = [
      { username: { contains: keyword, mode: 'insensitive' } },
      { email: { contains: keyword, mode: 'insensitive' } },
      { fullName: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 10;
  const safePage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  const safeLimit = Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 50) : 10;
  const skip = (safePage - 1) * safeLimit;

  const total = await prisma.user.count({ where });
  const items = await prisma.user.findMany({
    where,
    skip,
    take: safeLimit,
    select: USER_SAFE_SELECT,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalPages = Math.ceil(total / safeLimit);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: totalPages === 0 ? 1 : totalPages,
    },
  };
};

/**
 * Cập nhật vai trò của người dùng.
 * @param {string} id
 * @param {'customer'|'admin'} role
 * @returns {Promise<Object>}
 */
const updateRole = async (id, role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: USER_SAFE_SELECT,
  });
};

/**
 * Cập nhật các trường hồ sơ người dùng mà admin có thể chỉnh sửa.
 * @param {string} id
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
const updateAdminProfile = async (id, userData) => {
  return prisma.user.update({
    where: { id },
    data: userData,
    select: USER_SAFE_SELECT,
  });
};

/**
 * Cập nhật trạng thái chặn của người dùng.
 * @param {string} id
 * @param {boolean} isBlocked
 * @returns {Promise<Object>}
 */
const updateBlocked = async (id, isBlocked) => {
  return prisma.user.update({
    where: { id },
    data: { isBlocked },
    select: USER_SAFE_SELECT,
  });
};

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  create,
  update,
  findAll,
  updateRole,
  updateAdminProfile,
  updateBlocked,
};
