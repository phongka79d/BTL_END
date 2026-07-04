const prisma = require('../config/database');

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
 * Retrieve all users
 * @returns {Promise<Array>}
 */
const findAll = async () => {
  return prisma.user.findMany();
};

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  findAll,
};
