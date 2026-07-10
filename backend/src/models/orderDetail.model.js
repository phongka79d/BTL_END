const prisma = require('../config/database');

/**
 * Tìm chi tiết đơn hàng theo ID.
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
