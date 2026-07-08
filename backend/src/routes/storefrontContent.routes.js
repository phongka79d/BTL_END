const express = require('express');
const controller = require('../controllers/storefrontContent.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

const storefrontContentPublicRouter = express.Router();
const storefrontContentAdminRouter = express.Router();

storefrontContentPublicRouter.get('/carousel', controller.getPublicCarousel);
storefrontContentPublicRouter.get('/navigation', controller.getPublicNavigation);
storefrontContentPublicRouter.get('/featured-products', controller.getPublicFeaturedProducts);

storefrontContentAdminRouter.get('/carousel', protect, admin, controller.listAdminCarouselSlides);
storefrontContentAdminRouter.post('/carousel', protect, admin, controller.createAdminCarouselSlide);
storefrontContentAdminRouter.put('/carousel/:id', protect, admin, controller.updateAdminCarouselSlide);
storefrontContentAdminRouter.delete('/carousel/:id', protect, admin, controller.deleteAdminCarouselSlide);
storefrontContentAdminRouter.get('/navigation', protect, admin, controller.listAdminNavigation);
storefrontContentAdminRouter.post('/navigation', protect, admin, controller.createAdminNavigationItem);
storefrontContentAdminRouter.put('/navigation/:id', protect, admin, controller.updateAdminNavigationItem);
storefrontContentAdminRouter.delete('/navigation/:id', protect, admin, controller.deleteAdminNavigationItem);
storefrontContentAdminRouter.get('/featured-products', protect, admin, controller.listAdminFeaturedProducts);
storefrontContentAdminRouter.post('/featured-products/bulk', protect, admin, controller.createAdminFeaturedProductsBulk);
storefrontContentAdminRouter.post('/featured-products', protect, admin, controller.createAdminFeaturedProduct);
storefrontContentAdminRouter.put('/featured-products/reorder', protect, admin, controller.reorderAdminFeaturedProducts);
storefrontContentAdminRouter.put('/featured-products/:id', protect, admin, controller.updateAdminFeaturedProduct);
storefrontContentAdminRouter.delete('/featured-products/:id', protect, admin, controller.deleteAdminFeaturedProduct);
storefrontContentAdminRouter.put('/settings', protect, admin, controller.updateAdminStorefrontSettings);

module.exports = {
  storefrontContentPublicRouter,
  storefrontContentAdminRouter,
};
