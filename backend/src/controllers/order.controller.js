const orderModel = require('../models/order.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Perform customer checkout / create order
 * POST /api/orders
 */
const checkout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, cartItemIds } = req.body;

    // Validate shippingAddress payload
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
 * Get current customer's orders
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
 * Get detailed order by ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Verify order exists
    const order = await orderModel.findById(id);
    if (!order) {
      return errorResponse(res, 404, 'Không tìm thấy đơn hàng');
    }

    // Verify access permission
    if (order.userId !== userId && !isAdmin) {
      return errorResponse(res, 403, 'Không được phép truy cập đơn hàng này');
    }

    // Retrieve full order details using helper
    const detailedOrder = await orderModel.findOwnedOrAdminVisible(id, userId, isAdmin);
    return successResponse(res, 200, 'Đã lấy đơn hàng thành công', detailedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all orders with optional status filter
 * GET /api/admin/orders
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    const orders = await orderModel.listForAdmin(status || undefined);
    return successResponse(res, 200, 'Đã lấy đơn hàng quản trị thành công', orders);
  } catch (error) {
    if (error.message && error.message.startsWith('Invalid status filter')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Admin: Update order status
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
    if (error.message && error.message.startsWith('Invalid status')) {
      return errorResponse(res, 400, error.message);
    }
    if (error.message && error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
};
