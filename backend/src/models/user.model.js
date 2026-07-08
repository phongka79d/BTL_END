const prisma = require('../config/database');

const USER_SAFE_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phone: true,
  address: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Find user by email
 * @param {string} email 
 * @returns {Promise<Object|null>}
 */
const findByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Find user by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Create a new user
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
const create = async (userData) => {
  return prisma.user.create({
    data: userData,
  });
};

/**
 * Update user profile details
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
 * Retrieve users for admin with search and pagination.
 * @param {Object} params
 * @param {string} [params.keyword]
 * @param {number|string} [params.page]
 * @param {number|string} [params.limit]
 * @returns {Promise<Object>}
 */
const findAll = async (params = {}) => {
  const { keyword, page, limit } = params;
  const where = {};

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
 * Update a user's role.
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

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  findAll,
  updateRole,
};
