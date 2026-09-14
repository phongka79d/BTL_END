const orderModel = require('../models/order.model');
const { hasRolePermission, PERMISSIONS } = require('../config/permissions');
const { successResponse, errorResponse } = require('../utils/response');
/**
 * Thực hiện checkout của khách hàng / tạo đơn hàng
 * POST /api/orders
 */
const checkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, cartItemIds } = req.body;

    // Kiểm tra payload shippingAddress
    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim() === '') {
      return errorResponse(res, 400, 'Địa chỉ giao hàng là bắt buộc');
    }
    if (cartItemIds !== undefined) {
      if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
        return errorResponse(res, 400, 'Phải chọn ít nhất một sản phẩm trong giỏ hàng');
      }
      if (cartItemIds.some((cartItemId) => !cartItemId || typeof cartItemId !== 'string')) {
        return errorResponse(res, 400, 'ID sản phẩm trong giỏ hàng đã chọn phải là chuỗi');
      }
      if (new Set(cartItemIds).size !== cartItemIds.length) {
        return errorResponse(res, 400, 'ID sản phẩm trong giỏ hàng đã chọn phải là duy nhất');
      }
    }

    const order = await orderModel.checkout(userId, shippingAddress.trim(), cartItemIds);
    return successResponse(res, 201, 'Đã tạo đơn hàng thành công', order);
  } catch (error) {
    if (
      error.message === 'Cart is empty.' ||
      error.message === 'No cart items selected.' ||
      error.message === 'Selected cart items are unavailable.' ||
      error.message === 'Shipping address is required.' ||
      error.message.includes('exceeds available stock')
    ) {
      return errorResponse(res, 400, error.message);
    }
    if (error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Lấy các đơn hàng hiện tại của khách hàng
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.listByUser(userId);
    return successResponse(res, 200, 'Đã lấy đơn hàng thành công', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết đơn hàng theo ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const canViewAll = hasRolePermission(req.user?.role, PERMISSIONS.ORDERS_VIEW_ALL);

    // Xác minh đơn hàng tồn tại
    const order = await orderModel.findById(id);
    if (!order) {
      return errorResponse(res, 404, 'Không tìm thấy đơn hàng');
    }

    // Xác minh quyền truy cập
    if (order.userId !== userId && !canViewAll) {
      return errorResponse(res, 403, 'Không được phép truy cập đơn hàng này');
    }

    // Lấy đầy đủ chi tiết đơn hàng bằng hàm hỗ trợ
    const detailedOrder = await orderModel.findOwnedOrAdminVisible(id, userId, canViewAll);
    return successResponse(res, 200, 'Đã lấy đơn hàng thành công', detailedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin / Staff: Liệt kê tất cả đơn hàng với bộ lọc trạng thái, từ khóa và phân trang
 * GET /api/admin/orders
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || req.query.search;
    const { status, page, limit } = req.query;

    const result = await orderModel.listForAdmin({ status, keyword, page, limit });
    return successResponse(res, 200, 'Đã lấy đơn hàng quản trị thành công', result);
  } catch (error) {
    if (
      error.message &&
      (error.message.includes('không hợp lệ') ||
       error.message.startsWith('Invalid status') ||
       error.message.includes('Trang phải') ||
       error.message.includes('Giới hạn phải'))
    ) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};
/**
 * Khách hàng tự hủy đơn hàng của mình (trước khi bàn giao vận chuyển).
 * PUT /api/orders/:id/cancel
 */
const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cancelledOrder = await orderModel.cancelOwnOrder(id, userId);
    return successResponse(res, 200, 'Đã hủy đơn hàng thành công', cancelledOrder);
  } catch (error) {
    const message = error.message || '';
    if (/Không tìm thấy đơn hàng|not found/i.test(message)) {
      return errorResponse(res, 404, message);
    }
    if (/Không được phép|Unauthorized|permission/i.test(message)) {
      return errorResponse(res, 403, message);
    }
    if (/đã thay đổi/.test(message)) {
      return errorResponse(res, 409, message);
    }
    if (/Chỉ có thể hủy/.test(message)) {
      return errorResponse(res, 400, message);
    }
    next(error);
  }
};

/**
 * Admin / Staff: Cập nhật trạng thái đơn hàng
 * PUT /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return errorResponse(res, 400, 'Trạng thái là bắt buộc');
    }

    const updatedOrder = await orderModel.updateStatus(id, status.trim().toLowerCase());
    return successResponse(res, 200, 'Đã cập nhật trạng thái đơn hàng thành công', updatedOrder);
  } catch (error) {
    const message = error.message || '';
    if (/Trạng thái không hợp lệ|Không thể chuyển trạng thái|Invalid status/.test(message)) {
      return errorResponse(res, 400, message);
    }
    if (/Không tìm thấy đơn hàng|not found/i.test(message)) {
      return errorResponse(res, 404, message);
    }
    if (/đã thay đổi/.test(message)) {
      return errorResponse(res, 409, message);
    }
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  cancelMyOrder,
  updateOrderStatus,
};
