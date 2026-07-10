const paymentModel = require('../models/payment.model');
const orderModel = require('../models/order.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Explicit COD payment endpoint for demo/API completeness.
 * Returns an existing payment for the order, or creates one if none exists.
 * Idempotent — never creates a duplicate payment.
 * POST /api/payments/cod
 */
const createCODPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { orderId } = req.body;

    // Validate required orderId
    if (!orderId || typeof orderId !== 'string') {
      return errorResponse(res, 400, 'Order ID là bắt buộc');
    }

    // Verify the order exists
    const order = await orderModel.findById(orderId);
    if (!order) {
      return errorResponse(res, 404, 'Không tìm thấy đơn hàng');
    }

    // Enforce access: customer sees only their own order; admin sees any
    if (order.userId !== userId && !isAdmin) {
      return errorResponse(res, 403, 'Không được phép truy cập đơn hàng này');
    }

    // Return existing payment or create a new COD payment via the idempotent model helper
    const payment = await paymentModel.createOrGetCODPayment(orderId);
    return successResponse(res, 200, 'Đã lấy thông tin thanh toán COD thành công', payment);
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

module.exports = {
  createCODPayment,
};
