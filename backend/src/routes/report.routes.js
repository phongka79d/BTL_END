const express = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../config/permissions');

const router = express.Router();

// Báo cáo doanh thu (chỉ dành cho Admin)
router.get('/revenue', protect, requirePermission(PERMISSIONS.REPORTS_VIEW_REVENUE), reportController.getRevenueReport);

// Báo cáo vận hành: sản phẩm bán chạy và tổng quan đơn hàng (Staff & Admin)
router.get(
  '/best-selling-products',
  protect,
  requirePermission(PERMISSIONS.REPORTS_VIEW_OPERATIONAL),
  reportController.getBestSellingProductsReport
);
router.get('/order-summary', protect, requirePermission(PERMISSIONS.REPORTS_VIEW_OPERATIONAL), reportController.getOrderSummaryReport);

module.exports = router;
