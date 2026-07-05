const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

// POST /api/payments/cod
router.post('/cod', protect, paymentController.createCODPayment);

module.exports = router;
