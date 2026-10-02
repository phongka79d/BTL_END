const productModel = require('../models/product.model');
const reviewModel = require('../models/review.model');
const { successResponse, errorResponse } = require('../utils/response');

const parseReviewPayload = (body = {}) => {
  const { rating, comment } = body;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      error: {
        field: 'rating',
        message: 'Xếp hạng phải là số nguyên từ 1 đến 5',
      },
    };
  }

  if (comment !== undefined && comment !== null && typeof comment !== 'string') {
    return {
      error: {
        field: 'comment',
        message: 'Nhận xét phải là chuỗi',
      },
    };
  }

  const trimmedComment = typeof comment === 'string' ? comment.trim() : undefined;
  return {
    data: {
      rating,
      comment: trimmedComment || undefined,
    },
  };
};

/**
 * Lấy các đánh giá hiển thị để admin kiểm duyệt
 * GET /api/admin/reviews
 */
const getAdminReviews = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const reviews = await reviewModel.listVisibleForAdmin({ productId });
    return successResponse(res, 200, 'Đã lấy đánh giá thành công', reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy các đánh giá hiển thị của một sản phẩm
 * GET /api/products/:id/reviews
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }

    const reviews = await reviewModel.listVisibleByProductId(id);
    return successResponse(res, 200, 'Đã lấy đánh giá thành công', reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo đánh giá hiển thị cho một sản phẩm
 * POST /api/products/:id/reviews
 */
const createProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = parseReviewPayload(req.body);

    if (parsed.error) {
      return errorResponse(res, 400, 'Xác thực thất bại', [parsed.error]);
    }

    // Chỉ khách hàng được đánh giá (khớp giao diện); admin/staff không thể tạo đánh giá qua API.
    if (req.user.role !== 'customer') {
      return errorResponse(res, 403, 'Chỉ khách hàng mới có thể đánh giá sản phẩm');
    }

    const product = await productModel.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }

    // Mỗi khách hàng chỉ đánh giá một lần cho mỗi sản phẩm để không làm sai điểm trung bình.
    if (await reviewModel.existsForUserAndProduct(req.user.id, id)) {
      return errorResponse(res, 409, 'Bạn đã đánh giá sản phẩm này rồi.');
    }

    const review = await reviewModel.create({
      userId: req.user.id,
      productId: id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    return successResponse(res, 201, 'Đã tạo đánh giá thành công', { review });
  } catch (error) {
    next(error);
  }
};

/**
 * Ẩn đánh giá để admin kiểm duyệt
 * DELETE /api/admin/reviews/:id
 */
const hideReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewModel.findById(id);

    if (!review) {
      return errorResponse(res, 404, 'Không tìm thấy đánh giá');
    }

    const hiddenReview = await reviewModel.hide(id);
    return successResponse(res, 200, 'Đã ẩn đánh giá thành công', { review: hiddenReview });
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Không tìm thấy đánh giá');
    }
    next(error);
  }
};

module.exports = {
  getAdminReviews,
  getProductReviews,
  createProductReview,
  hideReview,
};
