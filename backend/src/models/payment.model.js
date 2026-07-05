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

/**
 * Get an existing payment for the order, or create a new COD payment if none exists.
 * Returns the payment record.
 * 
 * @param {string} orderId 
 * @returns {Promise<Object>} Payment record
 */
const createOrGetCODPayment = async (orderId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Check if payment already exists
    const existingPayment = await tx.payment.findUnique({
      where: { orderId }
    });

    if (existingPayment) {
      return existingPayment;
    }

    // 2. Check if the order exists and is valid
    const order = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    // Create a new COD payment
    return tx.payment.create({
      data: {
        orderId,
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
        amount: order.totalAmount,
        paymentDate: null
      }
    });
  });
};

module.exports = {
  findByOrderId,
  createOrGetCODPayment,
};
