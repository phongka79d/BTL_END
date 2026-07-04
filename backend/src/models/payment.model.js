const prisma = require('../config/database');

/**
 * Find payment by Order ID
 * @param {string} orderId 
 * @returns {Promise<Object|null>}
 */
const findByOrderId = async (orderId) => {
  return prisma.payment.findUnique({
    where: { orderId },
  });
};

module.exports = {
  findByOrderId,
};
