const storefrontContentModel = require('../models/storefrontContent.model');
const { successResponse, errorResponse } = require('../utils/response');

const isValidationError = (error) => (
  error.message &&
  (
    error.message.includes('required') ||
    error.message.includes('invalid') ||
    error.message.includes('not found') ||
    error.message.includes('must') ||
    error.message.includes('belong')
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

module.exports = {
  getPublicCarousel,
  getPublicNavigation,
  listAdminCarouselSlides,
  createAdminCarouselSlide,
  updateAdminCarouselSlide,
  deleteAdminCarouselSlide,
  listAdminNavigation,
  createAdminNavigationItem,
  updateAdminNavigationItem,
  deleteAdminNavigationItem,
};
