const storefrontContentModel = require('../models/storefrontContent.model');
const { successResponse, errorResponse } = require('../utils/response');

// Lỗi xác thực của model được viết bằng tiếng Việt; nhận diện cả mã trạng thái gắn sẵn lẫn từ khóa.
const isValidationError = (error) => (
  error.status === 400 ||
  error.status === 409 ||
  (error.message &&
    /required|invalid|not found|must|belong|between|bắt buộc|không hợp lệ|không tìm thấy|phải|đã tồn tại/i.test(error.message))
);

const getPublicCarousel = async (req, res, next) => {
  try {
    const slides = await storefrontContentModel.findPublicCarouselSlides();
    return successResponse(res, 200, 'Đã lấy băng chuyền cửa hàng thành công', { slides });
  } catch (error) {
    next(error);
  }
};

const getPublicNavigation = async (req, res, next) => {
  try {
    const items = await storefrontContentModel.findPublicNavigation();
    return successResponse(res, 200, 'Đã lấy điều hướng cửa hàng thành công', { items });
  } catch (error) {
    next(error);
  }
};

const getPublicFeaturedProducts = async (req, res, next) => {
  try {
    const featuredProducts = await storefrontContentModel.findPublicFeaturedProducts();
    return successResponse(res, 200, 'Đã lấy sản phẩm nổi bật của cửa hàng thành công', featuredProducts);
  } catch (error) {
    next(error);
  }
};

const listAdminCarouselSlides = async (req, res, next) => {
  try {
    const slides = await storefrontContentModel.findAdminCarouselSlides();
    return successResponse(res, 200, 'Đã lấy băng chuyền cửa hàng quản trị thành công', { slides });
  } catch (error) {
    next(error);
  }
};

const createAdminCarouselSlide = async (req, res, next) => {
  try {
    const slide = await storefrontContentModel.createCarouselSlide(req.body);
    return successResponse(res, 201, 'Đã tạo slide băng chuyền thành công', { slide });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminCarouselSlide = async (req, res, next) => {
  try {
    const slide = await storefrontContentModel.updateCarouselSlide(req.params.id, req.body);
    return successResponse(res, 200, 'Đã cập nhật slide băng chuyền thành công', { slide });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy slide băng chuyền');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminCarouselSlide = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteCarouselSlide(req.params.id);
    return successResponse(res, 200, 'Đã xóa slide băng chuyền thành công');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy slide băng chuyền');
    next(error);
  }
};

const listAdminNavigation = async (req, res, next) => {
  try {
    const items = await storefrontContentModel.findAdminNavigation();
    return successResponse(res, 200, 'Đã lấy điều hướng cửa hàng quản trị thành công', { items });
  } catch (error) {
    next(error);
  }
};

const createAdminNavigationItem = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.createNavigationItem(req.body);
    return successResponse(res, 201, 'Đã tạo mục điều hướng thành công', { item });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminNavigationItem = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.updateNavigationItem(req.params.id, req.body);
    return successResponse(res, 200, 'Đã cập nhật mục điều hướng thành công', { item });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy mục điều hướng');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminNavigationItem = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteNavigationItem(req.params.id);
    return successResponse(res, 200, 'Đã xóa mục điều hướng thành công');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy mục điều hướng');
    next(error);
  }
};

const listAdminFeaturedProducts = async (req, res, next) => {
  try {
    const featuredProducts = await storefrontContentModel.findAdminFeaturedProducts();
    return successResponse(res, 200, 'Đã lấy sản phẩm nổi bật của cửa hàng quản trị thành công', featuredProducts);
  } catch (error) {
    next(error);
  }
};

const createAdminFeaturedProduct = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.createFeaturedProduct(req.body);
    return successResponse(res, 201, 'Đã tạo sản phẩm nổi bật thành công', { item });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const createAdminFeaturedProductsBulk = async (req, res, next) => {
  try {
    const result = await storefrontContentModel.createFeaturedProductsBulk(req.body);
    return successResponse(res, 201, 'Đã tạo sản phẩm nổi bật thành công', result);
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const reorderAdminFeaturedProducts = async (req, res, next) => {
  try {
    const result = await storefrontContentModel.reorderFeaturedProducts(req.body);
    return successResponse(res, 200, 'Đã sắp xếp sản phẩm nổi bật thành công', result);
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy sản phẩm nổi bật');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminFeaturedProduct = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.updateFeaturedProduct(req.params.id, req.body);
    return successResponse(res, 200, 'Đã cập nhật sản phẩm nổi bật thành công', { item });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy sản phẩm nổi bật');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminFeaturedProduct = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteFeaturedProduct(req.params.id);
    return successResponse(res, 200, 'Đã xóa sản phẩm nổi bật thành công');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Không tìm thấy sản phẩm nổi bật');
    next(error);
  }
};

const updateAdminStorefrontSettings = async (req, res, next) => {
  try {
    const settings = await storefrontContentModel.updateStorefrontSettings(req.body);
    return successResponse(res, 200, 'Đã cập nhật cài đặt cửa hàng thành công', { settings });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

module.exports = {
  getPublicCarousel,
  getPublicNavigation,
  getPublicFeaturedProducts,
  listAdminCarouselSlides,
  createAdminCarouselSlide,
  updateAdminCarouselSlide,
  deleteAdminCarouselSlide,
  listAdminNavigation,
  createAdminNavigationItem,
  updateAdminNavigationItem,
  deleteAdminNavigationItem,
  listAdminFeaturedProducts,
  createAdminFeaturedProduct,
  createAdminFeaturedProductsBulk,
  reorderAdminFeaturedProducts,
  updateAdminFeaturedProduct,
  deleteAdminFeaturedProduct,
  updateAdminStorefrontSettings,
};
