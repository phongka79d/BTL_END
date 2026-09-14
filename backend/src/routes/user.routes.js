const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { PERMISSIONS } = require('../config/permissions');

// Route hỗ trợ gắn trực tiếp dưới /api/users và /api/admin/users.
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// POST /api/admin/users — tạo tài khoản mới (nhân viên/quản trị) và gửi thông tin đăng nhập.
router.post(
  '/',
  protect,
  requirePermission(PERMISSIONS.USERS_MANAGE_ROLE),
  validateBody(['username', 'email', 'password'], { validatePasswordPolicy: true }),
  userController.createUser
);
router.get('/', protect, requirePermission(PERMISSIONS.USERS_VIEW_ALL), userController.getUsers);
router.put('/:id', protect, requirePermission(PERMISSIONS.USERS_VIEW_ALL), userController.updateAdminUser);
router.put('/:id/role', protect, requirePermission(PERMISSIONS.USERS_MANAGE_ROLE), userController.updateUserRole);
router.put('/:id/block', protect, requirePermission(PERMISSIONS.USERS_BLOCK), userController.updateUserBlocked);

// Route hỗ trợ gắn trực tiếp dưới /api.
router.get('/users/profile', protect, userController.getProfile);
router.put('/users/profile', protect, userController.updateProfile);
router.get('/admin/users', protect, requirePermission(PERMISSIONS.USERS_VIEW_ALL), userController.getUsers);
router.put('/admin/users/:id', protect, requirePermission(PERMISSIONS.USERS_VIEW_ALL), userController.updateAdminUser);
router.put('/admin/users/:id/role', protect, requirePermission(PERMISSIONS.USERS_MANAGE_ROLE), userController.updateUserRole);
router.put('/admin/users/:id/block', protect, requirePermission(PERMISSIONS.USERS_BLOCK), userController.updateUserBlocked);

module.exports = router;
