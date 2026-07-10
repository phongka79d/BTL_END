const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// Danh sách đánh giá công khai.
router.get('/products/:id/reviews', reviewController.getProductReviews);

// Khách hàng đã xác thực tạo đánh giá.
router.post('/products/:id/reviews', protect, reviewController.createProductReview);

// Danh sách đánh giá hiển thị cho quản trị viên kiểm duyệt.
router.get('/admin/reviews', protect, admin, reviewController.getAdminReviews);

// Kiểm duyệt của quản trị viên sẽ ẩn đánh giá thay vì xóa vật lý.
router.delete('/admin/reviews/:id', protect, admin, reviewController.hideReview);

module.exports = router;
