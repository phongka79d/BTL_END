const paymentModel = require('../models/payment.model');
const orderModel = require('../models/order.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Endpoint thanh toán COD rõ ràng để phục vụ demo và đầy đủ API.
 * Trả về thanh toán hiện có của đơn hàng hoặc tạo mới nếu chưa tồn tại.
 * Có tính lũy đẳng — không bao giờ tạo thanh toán trùng lặp.
 * POST /api/payments/cod
 */
const createCODPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const { orderId } = req.body;

  // Kiểm tra orderId bắt buộc
    if (!orderId || typeof orderId !== 'string') {
      return errorResponse(res, 400, 'Order ID là bắt buộc');
    }

  // Xác minh đơn hàng tồn tại
    const order = await orderModel.findById(orderId);
    if (!order) {
      return errorResponse(res, 404, 'Không tìm thấy đơn hàng');
    }

  // Kiểm soát quyền truy cập: customer chỉ thấy đơn hàng của mình; admin thấy mọi đơn hàng
    if (order.userId !== userId && !isAdmin) {
      return errorResponse(res, 403, 'Không được phép truy cập đơn hàng này');
    }

  // Trả về thanh toán hiện có hoặc tạo thanh toán COD mới qua hàm hỗ trợ model lũy đẳng
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
