const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');

// Apply auth middleware to every cart route
router.use(protect);

// GET /api/cart
router.get('/', cartController.getCart);

// POST /api/cart/items
router.post('/items', cartController.addCartItem);

// PUT /api/cart/items
router.put('/items', cartController.updateCartItems);

// PUT /api/cart/items/:id
router.put('/items/:id', cartController.updateCartItem);

// DELETE /api/cart/items/:id
router.delete('/items/:id', cartController.deleteCartItem);

module.exports = router;
