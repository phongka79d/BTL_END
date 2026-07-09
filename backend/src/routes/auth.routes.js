const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');

// POST /api/auth/register
router.post(
  '/register',
  validateBody(['username', 'email', 'password'], { validatePasswordPolicy: true }),
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(['email', 'password']),
  authController.login
);

// POST /api/auth/forgot-password/request-otp
router.post(
  '/forgot-password/request-otp',
  validateBody(['email']),
  authController.requestForgotPasswordOtp
);

// POST /api/auth/forgot-password/verify-otp
router.post(
  '/forgot-password/verify-otp',
  validateBody(['email', 'otp']),
  authController.verifyForgotPasswordOtp
);

// POST /api/auth/forgot-password/reset
router.post(
  '/forgot-password/reset',
  validateBody(['email', 'otp', 'newPassword', 'confirmPassword']),
  authController.resetForgotPassword
);

// POST /api/auth/change-password/request-otp
router.post(
  '/change-password/request-otp',
  protect,
  validateBody(['currentPassword']),
  authController.requestPasswordChangeOtp
);

// POST /api/auth/change-password/confirm
router.post(
  '/change-password/confirm',
  protect,
  validateBody(['currentPassword', 'otp', 'newPassword', 'confirmPassword']),
  authController.confirmPasswordChange
);

// GET /api/auth/me
router.get(
  '/me',
  protect,
  authController.getMe
);

module.exports = router;
