const storefrontContentModel = require('../models/storefrontContent.model');
const { successResponse, errorResponse } = require('../utils/response');

const isValidationError = (error) => (
  error.message &&
  (
    error.message.includes('required') ||
    error.message.includes('invalid') ||
    error.message.includes('not found') ||
    error.message.includes('must') ||
    error.message.includes('belong') ||
    error.message.includes('between')
  )
);

const getPublicCarousel = async (req, res, next) => {
  try {
    const slides = await storefrontContentModel.findPublicCarouselSlides();
    return successResponse(res, 200, 'Storefront carousel retrieved successfully', { slides });
  } catch (error) {
    next(error);
  }
};

const getPublicNavigation = async (req, res, next) => {
  try {
    const items = await storefrontContentModel.findPublicNavigation();
    return successResponse(res, 200, 'Storefront navigation retrieved successfully', { items });
  } catch (error) {
    next(error);
  }
};

const getPublicFeaturedProducts = async (req, res, next) => {
  try {
    const featuredProducts = await storefrontContentModel.findPublicFeaturedProducts();
    return successResponse(res, 200, 'Storefront featured products retrieved successfully', featuredProducts);
  } catch (error) {
    next(error);
  }
};

const listAdminCarouselSlides = async (req, res, next) => {
  try {
    const slides = await storefrontContentModel.findAdminCarouselSlides();
    return successResponse(res, 200, 'Admin storefront carousel retrieved successfully', { slides });
  } catch (error) {
    next(error);
  }
};

const createAdminCarouselSlide = async (req, res, next) => {
  try {
    const slide = await storefrontContentModel.createCarouselSlide(req.body);
    return successResponse(res, 201, 'Carousel slide created successfully', { slide });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminCarouselSlide = async (req, res, next) => {
  try {
    const slide = await storefrontContentModel.updateCarouselSlide(req.params.id, req.body);
    return successResponse(res, 200, 'Carousel slide updated successfully', { slide });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Carousel slide not found');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminCarouselSlide = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteCarouselSlide(req.params.id);
    return successResponse(res, 200, 'Carousel slide deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Carousel slide not found');
    next(error);
  }
};

const listAdminNavigation = async (req, res, next) => {
  try {
    const items = await storefrontContentModel.findAdminNavigation();
    return successResponse(res, 200, 'Admin storefront navigation retrieved successfully', { items });
  } catch (error) {
    next(error);
  }
};

const createAdminNavigationItem = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.createNavigationItem(req.body);
    return successResponse(res, 201, 'Navigation item created successfully', { item });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminNavigationItem = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.updateNavigationItem(req.params.id, req.body);
    return successResponse(res, 200, 'Navigation item updated successfully', { item });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Navigation item not found');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminNavigationItem = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteNavigationItem(req.params.id);
    return successResponse(res, 200, 'Navigation item deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Navigation item not found');
    next(error);
  }
};

const listAdminFeaturedProducts = async (req, res, next) => {
  try {
    const featuredProducts = await storefrontContentModel.findAdminFeaturedProducts();
    return successResponse(res, 200, 'Admin storefront featured products retrieved successfully', featuredProducts);
  } catch (error) {
    next(error);
  }
};

const createAdminFeaturedProduct = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.createFeaturedProduct(req.body);
    return successResponse(res, 201, 'Featured product created successfully', { item });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const createAdminFeaturedProductsBulk = async (req, res, next) => {
  try {
    const result = await storefrontContentModel.createFeaturedProductsBulk(req.body);
    return successResponse(res, 201, 'Featured products created successfully', result);
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const reorderAdminFeaturedProducts = async (req, res, next) => {
  try {
    const result = await storefrontContentModel.reorderFeaturedProducts(req.body);
    return successResponse(res, 200, 'Featured products reordered successfully', result);
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Featured product not found');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminFeaturedProduct = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.updateFeaturedProduct(req.params.id, req.body);
    return successResponse(res, 200, 'Featured product updated successfully', { item });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Featured product not found');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminFeaturedProduct = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteFeaturedProduct(req.params.id);
    return successResponse(res, 200, 'Featured product deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Featured product not found');
    next(error);
  }
};

const updateAdminStorefrontSettings = async (req, res, next) => {
  try {
    const settings = await storefrontContentModel.updateStorefrontSettings(req.body);
    return successResponse(res, 200, 'Storefront settings updated successfully', { settings });
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
