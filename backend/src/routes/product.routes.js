const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// Route công khai.
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Route thay đổi dữ liệu dành cho quản trị viên.
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;
