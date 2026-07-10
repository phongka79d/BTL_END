const cartModel = require('../models/cart.model');
const cartItemModel = require('../models/cartItem.model');
const productModel = require('../models/product.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user's cart
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await cartModel.getOrCreateCart(userId);
    return successResponse(res, 200, 'Đã lấy giỏ hàng thành công', cart);
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
const addCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate productId and quantity payloads before mutation
    if (!productId || typeof productId !== 'string') {
      return errorResponse(res, 400, 'Product ID là bắt buộc và phải là chuỗi');
    }
    if (quantity === undefined || quantity === null) {
      return errorResponse(res, 400, 'Số lượng là bắt buộc');
    }
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return errorResponse(res, 400, 'Số lượng phải ít nhất là 1');
    }

    // Load the product record needed for price and stock checks
    const product = await productModel.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }

    // Load the cart to check total quantity
    const cart = await cartModel.getOrCreateCart(userId);
    const existingItem = cart.items.find(item => item.productId === productId);
    const newQuantity = existingItem ? (existingItem.quantity + parsedQuantity) : parsedQuantity;

    // Reject total cart quantity above product stock
    if (newQuantity > product.quantity) {
      return errorResponse(res, 400, `Số lượng yêu cầu vượt quá tồn kho (${product.quantity})`);
    }

    const cartItem = await cartModel.addItem(userId, productId, parsedQuantity);
    return successResponse(res, 201, 'Đã thêm sản phẩm vào giỏ hàng thành công', { cartItem });
  } catch (error) {
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('Quantity must be at least 1') || error.message.includes('exceeds available stock')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/items/:id
 */
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cartItemId
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return errorResponse(res, 400, 'Số lượng là bắt buộc');
    }
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return errorResponse(res, 400, 'Số lượng phải ít nhất là 1');
    }

    // Pre-check existence and ownership for precise 404/403 response
    const cartItem = await cartItemModel.findById(id);
    if (!cartItem) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Retrieve cart to check ownership
    const cart = await cartModel.getOrCreateCart(userId);
    if (cartItem.cartId !== cart.id) {
      return errorResponse(res, 403, 'Không được phép truy cập sản phẩm trong giỏ hàng');
    }

    // Load product for stock check
    const product = await productModel.findById(cartItem.productId);
    if (!product) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }

    if (parsedQuantity > product.quantity) {
      return errorResponse(res, 400, `Số lượng yêu cầu vượt quá tồn kho (${product.quantity})`);
    }

    const updatedItem = await cartItemModel.updateQuantity(userId, id, parsedQuantity);
    return successResponse(res, 200, 'Đã cập nhật sản phẩm trong giỏ hàng thành công', { cartItem: updatedItem });
  } catch (error) {
    if (error.message === 'Cart item not found') {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('Unauthorized access')) {
      return errorResponse(res, 403, error.message);
    }
    if (error.message.includes('Quantity must be at least 1') || error.message.includes('exceeds available stock')) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Update multiple cart item quantities in one request.
 * PUT /api/cart/items
 */
const updateCartItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    const cart = await cartModel.updateItems(userId, items);

    return successResponse(res, 200, 'Đã cập nhật các sản phẩm trong giỏ hàng thành công', { cart });
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return errorResponse(res, 404, error.message);
    }
    if (
      error.message && (
        error.message.includes('Cart item updates') ||
        error.message.includes('Cart item ID') ||
        error.message.includes('Quantity must be') ||
        error.message.includes('exceeds available stock')
      )
    ) {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:id
 */
const deleteCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cartItemId

    const cartItem = await cartItemModel.findById(id);
    if (!cartItem) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Retrieve cart to check ownership
    const cart = await cartModel.getOrCreateCart(userId);
    if (cartItem.cartId !== cart.id) {
      return errorResponse(res, 403, 'Không được phép truy cập sản phẩm trong giỏ hàng');
    }

    await cartItemModel.removeItem(userId, id);
    return successResponse(res, 200, 'Đã xóa sản phẩm khỏi giỏ hàng thành công');
  } catch (error) {
    if (error.message === 'Cart item not found') {
      return errorResponse(res, 404, error.message);
    }
    if (error.message.includes('Unauthorized access')) {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItems,
  updateCartItem,
  deleteCartItem
};
