const express = require('express');
const router = express.Router();

const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');

// Mount routes under their path prefixes
// Public product/category endpoints will match e.g. GET /api/products, GET /api/categories
// Admin product/category endpoints will match e.g. POST /api/admin/products, POST /api/admin/categories
router.use('/products', productRoutes);
router.use('/admin/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin/categories', categoryRoutes);
router.use('/cart', cartRoutes);

module.exports = router;
