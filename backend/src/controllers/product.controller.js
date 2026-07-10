const productModel = require('../models/product.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all products with filters and pagination
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { keyword, categoryId, minPrice, maxPrice, page, limit, sort } = req.query;
    const result = await productModel.findAll({
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      page,
      limit,
      sort
    });
    return successResponse(res, 200, 'Đã lấy sản phẩm thành công', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product detail by ID
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
 * Create a new product (admin)
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
    if (error.message && (
      error.message.includes('required') || 
      error.message.includes('must be') || 
      error.message.includes('non-negative')
    )) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Update an existing product (admin)
 * PUT /api/admin/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Pre-check existence for precise 404 response
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
    if (error.message && (
      error.message.includes('cannot be') || 
      error.message.includes('must be') || 
      error.message.includes('non-negative')
    )) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Delete a product (admin)
 * DELETE /api/admin/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Pre-check existence for precise 404 response
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
  deleteProduct
};
