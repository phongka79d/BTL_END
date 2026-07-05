const express = require('express');
const router = express.Router();

const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const reportRoutes = require('./report.routes');

// Mount routes under their path prefixes
// Public product/category endpoints will match e.g. GET /api/products, GET /api/categories
// Admin product/category endpoints will match e.g. POST /api/admin/products, POST /api/admin/categories
router.use('/products', productRoutes);
router.use('/admin/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin/categories', categoryRoutes);
router.use('/cart', cartRoutes);

// Order routes: customer and admin order paths share the same router (auth/admin enforced at route level)
// e.g. POST /api/orders, GET /api/orders/my-orders, GET /api/orders/:id
// e.g. GET /api/admin/orders, PUT /api/admin/orders/:id/status
router.use('/orders', orderRoutes);
router.use('/admin/orders', orderRoutes);

// Payment routes: COD-only endpoint
// e.g. POST /api/payments/cod
router.use('/payments', paymentRoutes);

// Review routes keep the exact Plan 4 paths:
// e.g. GET/POST /api/products/:id/reviews, DELETE /api/admin/reviews/:id
router.use('/', reviewRoutes);

// Admin-only report endpoints
router.use('/admin/reports', reportRoutes);

module.exports = router;
