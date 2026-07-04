const productModel = require('../models/product.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all products with filters and pagination
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { keyword, categoryId, minPrice, maxPrice, page, limit } = req.query;
    const result = await productModel.findAll({
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      page,
      limit
    });
    return successResponse(res, 200, 'Products retrieved successfully', result);
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
      return errorResponse(res, 404, 'Product not found');
    }
    return successResponse(res, 200, 'Product retrieved successfully', { product });
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
    return successResponse(res, 201, 'Product created successfully', { product });
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
      return errorResponse(res, 404, 'Product not found');
    }

    const product = await productModel.update(id, req.body);
    return successResponse(res, 200, 'Product updated successfully', { product });
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Product not found');
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
      return errorResponse(res, 404, 'Product not found');
    }

    await productModel.destroy(id);
    return successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Product not found');
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
