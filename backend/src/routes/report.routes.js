const express = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

const router = express.Router();

router.get('/revenue', protect, admin, reportController.getRevenueReport);
router.get(
  '/best-selling-products',
  protect,
  admin,
  reportController.getBestSellingProductsReport
);
router.get('/order-summary', protect, admin, reportController.getOrderSummaryReport);

module.exports = router;
