const prisma = require('../config/database');

/**
 * Find review by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.review.findUnique({
    where: { id },
  });
};

module.exports = {
  findById,
};
