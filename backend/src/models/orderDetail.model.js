const prisma = require('../config/database');

/**
 * Find order detail by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.orderDetail.findUnique({
    where: { id },
  });
};

module.exports = {
  findById,
};
