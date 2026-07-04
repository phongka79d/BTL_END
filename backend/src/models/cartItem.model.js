const prisma = require('../config/database');

/**
 * Find cart item by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.cartItem.findUnique({
    where: { id },
  });
};

module.exports = {
  findById,
};
