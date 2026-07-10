const prisma = require('../config/database');

/**
 * Tìm thanh toán theo ID đơn hàng.
 * @param {string} orderId 
 * @returns {Promise<Object|null>}
 */
const findByOrderId = async (orderId) => {
  return prisma.payment.findUnique({
    where: { orderId },
  });
};

/**
 * Lấy thanh toán hiện có của đơn hàng hoặc tạo thanh toán COD mới nếu chưa tồn tại.
 * Trả về bản ghi thanh toán.
 * 
 * @param {string} orderId 
 * @returns {Promise<Object>} Bản ghi thanh toán.
 */
const createOrGetCODPayment = async (orderId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Kiểm tra thanh toán đã tồn tại hay chưa.
    const existingPayment = await tx.payment.findUnique({
      where: { orderId }
    });

    if (existingPayment) {
      return existingPayment;
    }

    // 2. Kiểm tra đơn hàng tồn tại và hợp lệ.
    const order = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    // Tạo thanh toán COD mới.
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
