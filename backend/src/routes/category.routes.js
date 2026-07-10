const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// Route công khai.
router.get('/', categoryController.getCategories);

// Route thay đổi dữ liệu dành cho quản trị viên.
router.post('/', protect, admin, categoryController.createCategory);
router.put('/:id', protect, admin, categoryController.updateCategory);
router.delete('/:id', protect, admin, categoryController.deleteCategory);

module.exports = router;
