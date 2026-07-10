const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// Route khách hàng — tất cả đều yêu cầu xác thực.
// POST /api/orders
router.post('/', protect, orderController.checkout);

// GET /api/orders/my-orders
router.get('/my-orders', protect, orderController.getMyOrders);

// GET /api/orders/:id
router.get('/:id', protect, orderController.getOrderById);

// Route quản trị — yêu cầu xác thực và vai trò quản trị viên.
// GET /api/admin/orders
router.get('/', protect, admin, orderController.getAdminOrders);

// PUT /api/admin/orders/:id/status
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router;
