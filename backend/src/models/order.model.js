const prisma = require('../config/database');

/**
 * Find order by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
  });
};

module.exports = {
  findById,
};
