const prisma = require('../config/database');

/**
 * Find cart by User ID
 * @param {string} userId 
 * @returns {Promise<Object|null>}
 */
const findByUserId = async (userId) => {
  return prisma.cart.findUnique({
    where: { userId },
  });
};

module.exports = {
  findByUserId,
};
