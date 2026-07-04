const prisma = require('../config/database');

/**
 * Find category by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

module.exports = {
  findById,
};
