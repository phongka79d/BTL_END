const reportModel = require('../models/report.model');
const { successResponse, errorResponse } = require('../utils/response');

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const INVALID_DATE_MESSAGE = 'Định dạng ngày không hợp lệ. Vui lòng dùng YYYY-MM-DD';
const INVALID_RANGE_MESSAGE = 'Ngày bắt đầu không được sau ngày kết thúc';

/**
 * Phân tích một mốc thời gian từ query string.
 * Hỗ trợ YYYY-MM-DD (ngày đầy đủ) hoặc chuỗi ISO/ngày-giờ đầy đủ.
 * @param {string|undefined} value
 * @param {{endOfDay?: boolean}} [options]
 * @returns {Date|null}
 */
const parseDateBoundary = (value, { endOfDay = false } = {}) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }

  const raw = String(value).trim();

  if (DATE_ONLY_PATTERN.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const isValidDate = !Number.isNaN(date.getTime())
      && date.getFullYear() === year
      && date.getMonth() === month - 1
      && date.getDate() === day;

    if (!isValidDate) {
      throw new Error(INVALID_DATE_MESSAGE);
    }

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    }

    return date;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(INVALID_DATE_MESSAGE);
  }

  return parsed;
};

/**
 * Chuyển query string thành khoảng thời gian báo cáo.
 * Trả về null khi không có tham số, giữ nguyên hành vi báo cáo toàn thời gian.
 * @param {Object} query
 * @returns {{startDate?: Date, endDate?: Date}|null}
 */
const resolveDateRange = (query = {}) => {
  const startDate = parseDateBoundary(query.startDate);
  const endDate = parseDateBoundary(query.endDate, { endOfDay: true });

  if (startDate && endDate && startDate > endDate) {
    throw new Error(INVALID_RANGE_MESSAGE);
  }

  if (!startDate && !endDate) {
    return null;
  }

  return {
    startDate: startDate || undefined,
    endDate: endDate || undefined
  };
};

/**
 * Chuyển khoảng thời gian thành dữ liệu an toàn để trả về cho client.
 * @param {{startDate?: Date, endDate?: Date}|null} range
 * @returns {Object|null}
 */
const serializeRange = (range) => {
  if (!range) return null;

  return {
    startDate: range.startDate ? range.startDate.toISOString() : null,
    endDate: range.endDate ? range.endDate.toISOString() : null
  };
};

/**
 * Xử lý lỗi tham số ngày dùng chung cho các báo cáo.
 * @returns {boolean} true khi đã gửi phản hồi lỗi
 */
const handleRangeError = (error, res) => {
  const message = error && error.message ? error.message : '';

  if (message === INVALID_DATE_MESSAGE || message === INVALID_RANGE_MESSAGE) {
    errorResponse(res, 400, message);
    return true;
  }

  return false;
};

const getRevenueReport = async (req, res, next) => {
  try {
    const range = resolveDateRange(req.query);
    const revenue = await reportModel.getRevenue(range);
    return successResponse(res, 200, 'Đã lấy báo cáo doanh thu thành công', {
      ...revenue,
      range: serializeRange(range)
    });
  } catch (error) {
    if (handleRangeError(error, res)) return;
    next(error);
  }
};

const getBestSellingProductsReport = async (req, res, next) => {
  try {
    const range = resolveDateRange(req.query);
    const products = await reportModel.getBestSellingProducts(range);
    return successResponse(
      res,
      200,
      'Đã lấy báo cáo sản phẩm bán chạy thành công',
      products
    );
  } catch (error) {
    if (handleRangeError(error, res)) return;
    next(error);
  }
};

const getOrderSummaryReport = async (req, res, next) => {
  try {
    const range = resolveDateRange(req.query);
    const summary = await reportModel.getOrderSummary(range);
    return successResponse(res, 200, 'Đã lấy báo cáo tổng quan đơn hàng thành công', {
      ...summary,
      range: serializeRange(range)
    });
  } catch (error) {
    if (handleRangeError(error, res)) return;
    next(error);
  }
};

module.exports = {
  getRevenueReport,
  getBestSellingProductsReport,
  getOrderSummaryReport,
};
