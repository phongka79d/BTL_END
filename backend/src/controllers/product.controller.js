const productModel = require('../models/product.model');
const { validateInventoryQuantity } = require('../utils/quantityValidation');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Lấy tất cả sản phẩm với bộ lọc và phân trang
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { keyword, categoryId, minPrice, maxPrice, page, limit, sort, stockStatus } = req.query;
    if (stockStatus !== undefined && stockStatus !== '' && !productModel.STOCK_STATUSES.includes(stockStatus)) {
      return errorResponse(res, 400, 'Trạng thái tồn kho không hợp lệ');
    }
    const validatedParams = productModel.validateListParams({ page, limit, minPrice, maxPrice });
    const result = await productModel.findAll({
      keyword,
      categoryId,
      ...validatedParams,
      sort,
      stockStatus
    });
    return successResponse(res, 200, 'Đã lấy sản phẩm thành công', result);
  } catch (error) {
    if (error.status) return errorResponse(res, error.status, error.message);
    next(error);
  }
};

/**
 * Lấy chi tiết sản phẩm theo ID
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }
    return successResponse(res, 200, 'Đã lấy sản phẩm thành công', { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo sản phẩm mới (admin)
 * POST /api/admin/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, brand, price, quantity, categoryId, description, imageUrl } = req.body;
    const product = await productModel.create({
      name,
      brand,
      price,
      quantity,
      categoryId,
      description,
      imageUrl
    });
    return successResponse(res, 201, 'Đã tạo sản phẩm thành công', { product });
  } catch (error) {
    if (error.status) return errorResponse(res, error.status, error.message);
    next(error);
  }
};

/**
 * Cập nhật sản phẩm hiện có (admin)
 * PUT /api/admin/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await productModel.findById(id);
    if (!existing) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }
    const product = await productModel.update(id, req.body);
    return successResponse(res, 200, 'Đã cập nhật sản phẩm thành công', { product });
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }
    if (error.status) return errorResponse(res, error.status, error.message);
    next(error);
  }
};
/**
 * Cập nhật số lượng tồn kho sản phẩm (staff & admin)
 * PUT /api/products/:id/stock hoặc PUT /api/admin/products/:id/stock
 */
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined || quantity === null) {
      return errorResponse(res, 400, 'Số lượng tồn kho là bắt buộc');
    }
    const quantityError = validateInventoryQuantity(quantity);
    if (quantityError) {
      return errorResponse(res, 400, quantityError);
    }
    const existing = await productModel.findById(id);
    if (!existing) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }
    const product = await productModel.updateStock(id, quantity);
    return successResponse(res, 200, 'Đã cập nhật số lượng tồn kho thành công', { product });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    if (error.status) return errorResponse(res, error.status, error.message);
    next(error);
  }
};

/**
 * Xóa sản phẩm (admin)
 * DELETE /api/admin/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Kiểm tra trước sự tồn tại để trả về phản hồi 404 chính xác
    const existing = await productModel.findById(id);
    if (!existing) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }

    await productModel.destroy(id);
    return successResponse(res, 200, 'Đã xóa sản phẩm thành công');
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
};
