const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../config/permissions');

// Route công khai xem danh mục.
router.get('/', categoryController.getCategories);

// Route thay đổi dữ liệu danh mục dành riêng cho Admin.
router.post('/', protect, requirePermission(PERMISSIONS.CATEGORIES_MANAGE), categoryController.createCategory);
router.put('/:id', protect, requirePermission(PERMISSIONS.CATEGORIES_MANAGE), categoryController.updateCategory);
router.delete('/:id', protect, requirePermission(PERMISSIONS.CATEGORIES_MANAGE), categoryController.deleteCategory);

module.exports = router;
