const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../config/permissions');

// Route khách hàng — tất cả đều yêu cầu xác thực.
// POST /api/orders
router.post('/', protect, orderController.checkout);

// GET /api/orders/my-orders
router.get('/my-orders', protect, orderController.getMyOrders);

// GET /api/orders/:id
router.get('/:id', protect, orderController.getOrderById);

// PUT /api/orders/:id/cancel — khách hàng tự hủy đơn của mình khi còn cho phép.
router.put('/:id/cancel', protect, orderController.cancelMyOrder);

// Route quản trị/vận hành — yêu cầu quyền xem và xử lý đơn hàng (Staff & Admin).
// GET /api/admin/orders
router.get('/', protect, requirePermission(PERMISSIONS.ORDERS_VIEW_ALL), orderController.getAdminOrders);

// PUT /api/admin/orders/:id/status
router.put('/:id/status', protect, requirePermission(PERMISSIONS.ORDERS_UPDATE_STATUS), orderController.updateOrderStatus);

module.exports = router;
