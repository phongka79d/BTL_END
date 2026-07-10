const reportModel = require('../models/report.model');
const { successResponse } = require('../utils/response');

const getRevenueReport = async (req, res, next) => {
  try {
    const revenue = await reportModel.getRevenue();
    return successResponse(res, 200, 'Đã lấy báo cáo doanh thu thành công', revenue);
  } catch (error) {
    next(error);
  }
};

const getBestSellingProductsReport = async (req, res, next) => {
  try {
    const products = await reportModel.getBestSellingProducts();
    return successResponse(
      res,
      200,
      'Best-selling products report retrieved successfully',
      products
    );
  } catch (error) {
    next(error);
  }
};

const getOrderSummaryReport = async (req, res, next) => {
  try {
    const summary = await reportModel.getOrderSummary();
    return successResponse(res, 200, 'Đã lấy báo cáo tổng quan đơn hàng thành công', summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueReport,
  getBestSellingProductsReport,
  getOrderSummaryReport,
};
