const express = require('express');
const router = express.Router();
const addressRoutes = require('./address.routes');

const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const reportRoutes = require('./report.routes');
const {
  storefrontContentPublicRouter,
  storefrontContentAdminRouter,
} = require('./storefrontContent.routes');

// Gắn các route dưới tiền tố đường dẫn tương ứng
// Endpoint sản phẩm/danh mục công khai sẽ khớp, ví dụ GET /api/products, GET /api/categories
// Endpoint sản phẩm/danh mục admin sẽ khớp, ví dụ POST /api/admin/products, POST /api/admin/categories
router.use('/addresses', addressRoutes);
router.use('/products', productRoutes);
router.use('/admin/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin/categories', categoryRoutes);
router.use('/cart', cartRoutes);

// Route đơn hàng: đường dẫn đơn hàng của customer và admin dùng chung router (auth/admin được áp dụng ở cấp route)
// Ví dụ: POST /api/orders, GET /api/orders/my-orders, GET /api/orders/:id
// Ví dụ: GET /api/admin/orders, PUT /api/admin/orders/:id/status
router.use('/orders', orderRoutes);
router.use('/admin/orders', orderRoutes);

// Route thanh toán: endpoint chỉ COD
// Ví dụ: POST /api/payments/cod
router.use('/payments', paymentRoutes);

// Route đánh giá giữ nguyên các đường dẫn chính xác của Plan 4:
// Ví dụ: GET/POST /api/products/:id/reviews, DELETE /api/admin/reviews/:id
router.use('/', reviewRoutes);

// Các endpoint báo cáo chỉ dành cho admin
router.use('/admin/reports', reportRoutes);

router.use('/storefront', storefrontContentPublicRouter);
router.use('/admin/storefront', storefrontContentAdminRouter);

module.exports = router;
