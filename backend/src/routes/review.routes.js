const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// Public review list
router.get('/products/:id/reviews', reviewController.getProductReviews);

// Authenticated customer review creation
router.post('/products/:id/reviews', protect, reviewController.createProductReview);

// Admin moderation hides the review instead of physically deleting it
router.delete('/admin/reviews/:id', protect, admin, reviewController.hideReview);

module.exports = router;
