const categoryModel = require('../models/category.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all categories
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.findAll();
    return successResponse(res, 200, 'Categories retrieved successfully', { categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category (admin)
 * POST /api/admin/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await categoryModel.create({ name, description });
    return successResponse(res, 201, 'Category created successfully', { category });
  } catch (error) {
    if (error.message && (
      error.message.includes('required') || 
      error.message.includes('unique')
    )) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Update an existing category (admin)
 * PUT /api/admin/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Pre-check existence for precise 404 response
    const existing = await categoryModel.findById(id);
    if (!existing) {
      return errorResponse(res, 404, 'Category not found');
    }

    const category = await categoryModel.update(id, req.body);
    return successResponse(res, 200, 'Category updated successfully', { category });
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Category not found');
    }
    if (error.message && (
      error.message.includes('cannot be') || 
      error.message.includes('unique')
    )) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Delete a category (admin)
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Pre-check existence for precise 404 response
    const existing = await categoryModel.findById(id);
    if (!existing) {
      return errorResponse(res, 404, 'Category not found');
    }

    await categoryModel.destroy(id);
    return successResponse(res, 200, 'Category deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 404, 'Category not found');
    }
    if (error.message && error.message.includes('referenced')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
