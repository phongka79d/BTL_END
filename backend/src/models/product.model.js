const prisma = require('../config/database');

/**
 * Find product by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
  });
};

module.exports = {
  findById,
};
