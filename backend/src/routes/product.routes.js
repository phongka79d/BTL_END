const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../config/permissions');

// Route công khai xem sản phẩm
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Route cập nhật tồn kho (dành cho Staff & Admin)
router.put('/:id/stock', protect, requirePermission(PERMISSIONS.PRODUCTS_UPDATE_STOCK), productController.updateStock);

// Route quản lý danh mục sản phẩm (chỉ Admin)
router.post('/', protect, requirePermission(PERMISSIONS.PRODUCTS_MANAGE_CATALOG), productController.createProduct);
router.put('/:id', protect, requirePermission(PERMISSIONS.PRODUCTS_MANAGE_CATALOG), productController.updateProduct);
router.delete('/:id', protect, requirePermission(PERMISSIONS.PRODUCTS_DELETE), productController.deleteProduct);

module.exports = router;
