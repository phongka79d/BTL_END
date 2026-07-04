const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');

// POST /api/auth/register - Đăng ký
router.post(
  '/register',
  validateBody(['username', 'email', 'password']),
  authController.register
);

// POST /api/auth/login - Đăng nhập
router.post(
  '/login',
  validateBody(['email', 'password']),
  authController.login
);

// GET /api/auth/me - Lấy thông tin tài khoản hiện tại
router.get(
  '/me',
  protect,
  authController.getMe
);

module.exports = router;
