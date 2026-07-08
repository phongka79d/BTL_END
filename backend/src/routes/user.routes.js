const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// Routes supporting direct mounting under /api/users and /api/admin/users
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/', protect, admin, userController.getUsers);
router.put('/:id', protect, admin, userController.updateAdminUser);
router.put('/:id/role', protect, admin, userController.updateUserRole);
router.put('/:id/block', protect, admin, userController.updateUserBlocked);

// Routes supporting mounting under /api directly
router.get('/users/profile', protect, userController.getProfile);
router.put('/users/profile', protect, userController.updateProfile);
router.get('/admin/users', protect, admin, userController.getUsers);
router.put('/admin/users/:id', protect, admin, userController.updateAdminUser);
router.put('/admin/users/:id/role', protect, admin, userController.updateUserRole);
router.put('/admin/users/:id/block', protect, admin, userController.updateUserBlocked);

module.exports = router;
