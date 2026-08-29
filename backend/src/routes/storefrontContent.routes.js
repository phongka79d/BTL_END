const express = require('express');
const controller = require('../controllers/storefrontContent.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../config/permissions');

const storefrontContentPublicRouter = express.Router();
const storefrontContentAdminRouter = express.Router();

storefrontContentPublicRouter.get('/carousel', controller.getPublicCarousel);
storefrontContentPublicRouter.get('/navigation', controller.getPublicNavigation);
storefrontContentPublicRouter.get('/featured-products', controller.getPublicFeaturedProducts);

storefrontContentAdminRouter.get('/carousel', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.listAdminCarouselSlides);
storefrontContentAdminRouter.post('/carousel', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.createAdminCarouselSlide);
storefrontContentAdminRouter.put('/carousel/:id', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.updateAdminCarouselSlide);
storefrontContentAdminRouter.delete('/carousel/:id', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.deleteAdminCarouselSlide);
storefrontContentAdminRouter.get('/navigation', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.listAdminNavigation);
storefrontContentAdminRouter.post('/navigation', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.createAdminNavigationItem);
storefrontContentAdminRouter.put('/navigation/:id', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.updateAdminNavigationItem);
storefrontContentAdminRouter.delete('/navigation/:id', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.deleteAdminNavigationItem);
storefrontContentAdminRouter.get('/featured-products', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.listAdminFeaturedProducts);
storefrontContentAdminRouter.post('/featured-products/bulk', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.createAdminFeaturedProductsBulk);
storefrontContentAdminRouter.post('/featured-products', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.createAdminFeaturedProduct);
storefrontContentAdminRouter.put('/featured-products/reorder', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.reorderAdminFeaturedProducts);
storefrontContentAdminRouter.put('/featured-products/:id', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.updateAdminFeaturedProduct);
storefrontContentAdminRouter.delete('/featured-products/:id', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.deleteAdminFeaturedProduct);
storefrontContentAdminRouter.put('/settings', protect, requirePermission(PERMISSIONS.STOREFRONT_MANAGE), controller.updateAdminStorefrontSettings);

module.exports = {
  storefrontContentPublicRouter,
  storefrontContentAdminRouter,
};
