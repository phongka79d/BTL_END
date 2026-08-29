const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../config/permissions');

// Danh sách đánh giá công khai.
router.get('/products/:id/reviews', reviewController.getProductReviews);

// Khách hàng đã xác thực tạo đánh giá.
router.post('/products/:id/reviews', protect, reviewController.createProductReview);

// Danh sách đánh giá hiển thị cho quản trị viên và nhân viên kiểm duyệt.
router.get('/admin/reviews', protect, requirePermission(PERMISSIONS.REVIEWS_VIEW_ALL), reviewController.getAdminReviews);

// Kiểm duyệt đánh giá (ẩn đánh giá).
router.delete('/admin/reviews/:id', protect, requirePermission(PERMISSIONS.REVIEWS_MODERATE), reviewController.hideReview);

module.exports = router;
