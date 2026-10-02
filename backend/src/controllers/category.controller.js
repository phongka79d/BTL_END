const categoryModel = require('../models/category.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Lấy tất cả danh mục
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.findAll();
    return successResponse(res, 200, 'Đã lấy danh mục thành công', { categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo danh mục mới (admin)
 * POST /api/admin/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await categoryModel.create({ name, description });
    return successResponse(res, 201, 'Đã tạo danh mục thành công', { category });
  } catch (error) {
    if (error.status) return errorResponse(res, error.status, error.message);
    if (error.code === 'P2002') return errorResponse(res, 409, 'Tên danh mục phải là duy nhất.');
    next(error);
  }
};

/**
 * Cập nhật danh mục hiện có (admin)
 * PUT /api/admin/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await categoryModel.findById(id);
    if (!existing) {
      return errorResponse(res, 404, 'Không tìm thấy danh mục');
    }
    const category = await categoryModel.update(id, req.body);
    return successResponse(res, 200, 'Đã cập nhật danh mục thành công', { category });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy danh mục');
    if (error.status) return errorResponse(res, error.status, error.message);
    if (error.code === 'P2002') return errorResponse(res, 409, 'Tên danh mục phải là duy nhất.');
    next(error);
  }
};

/**
 * Xóa danh mục (admin)
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await categoryModel.findById(id);
    if (!existing) {
      return errorResponse(res, 404, 'Không tìm thấy danh mục');
    }
    await categoryModel.destroy(id);
    return successResponse(res, 200, 'Đã xóa danh mục thành công');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy danh mục');
    if (error.status) return errorResponse(res, error.status, error.message);
    if (error.code === 'P2003') return errorResponse(res, 409, 'Không thể xóa danh mục đang có sản phẩm.');
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
