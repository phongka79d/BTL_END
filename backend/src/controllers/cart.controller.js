const cartModel = require('../models/cart.model');
const { PURCHASE_INVALID_MESSAGE, toQuantity, validatePurchaseQuantity } = require('../utils/quantityValidation');
const cartItemModel = require('../models/cartItem.model');
const productModel = require('../models/product.model');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Lấy giỏ hàng của người dùng
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
 * Thêm sản phẩm vào giỏ hàng
 * POST /api/cart/items
 */
const addCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Kiểm tra payload productId và quantity trước khi thay đổi dữ liệu
    if (!productId || typeof productId !== 'string') {
      return errorResponse(res, 400, 'Product ID là bắt buộc và phải là chuỗi');
    }
    const quantityError = validatePurchaseQuantity(quantity, Number.MAX_SAFE_INTEGER);
    if (quantityError) {
      return errorResponse(res, 400, PURCHASE_INVALID_MESSAGE);
    }
    const parsedQuantity = toQuantity(quantity);

    // Tải bản ghi sản phẩm cần thiết để kiểm tra giá và tồn kho
    const product = await productModel.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }

    // Tải giỏ hàng để kiểm tra tổng số lượng
    const cart = await cartModel.getOrCreateCart(userId);
    const existingItem = cart.items.find(item => item.productId === productId);
    const newQuantity = existingItem ? (existingItem.quantity + parsedQuantity) : parsedQuantity;

    if (validatePurchaseQuantity(newQuantity, product.quantity)) {
      return errorResponse(res, 400, PURCHASE_INVALID_MESSAGE);
    }

    const cartItem = await cartModel.addItem(userId, productId, parsedQuantity);
    return successResponse(res, 201, 'Đã thêm sản phẩm vào giỏ hàng thành công', { cartItem });
  } catch (error) {
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, error.message);
    }
    if (error.message === PURCHASE_INVALID_MESSAGE) {
      return errorResponse(res, 400, PURCHASE_INVALID_MESSAGE);
    }
    next(error);
  }
};

/**
 * Cập nhật số lượng mục trong giỏ hàng
 * PUT /api/cart/items/:id
 */
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cartItemId
    const { quantity } = req.body;

    const quantityError = validatePurchaseQuantity(quantity, Number.MAX_SAFE_INTEGER);
    if (quantityError) {
      return errorResponse(res, 400, PURCHASE_INVALID_MESSAGE);
    }
    const parsedQuantity = toQuantity(quantity);

    // Kiểm tra trước sự tồn tại và quyền sở hữu để trả về phản hồi 404/403 chính xác
    const cartItem = await cartItemModel.findById(id);
    if (!cartItem) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Lấy giỏ hàng để kiểm tra quyền sở hữu
    const cart = await cartModel.getOrCreateCart(userId);
    if (cartItem.cartId !== cart.id) {
      return errorResponse(res, 403, 'Không được phép truy cập sản phẩm trong giỏ hàng');
    }

    // Tải sản phẩm để kiểm tra tồn kho
    const product = await productModel.findById(cartItem.productId);
    if (!product) {
      return errorResponse(res, 404, 'Không tìm thấy sản phẩm');
    }

    if (validatePurchaseQuantity(parsedQuantity, product.quantity)) {
      return errorResponse(res, 400, PURCHASE_INVALID_MESSAGE);
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
    if (error.message === PURCHASE_INVALID_MESSAGE) {
      return errorResponse(res, 400, PURCHASE_INVALID_MESSAGE);
    }
    next(error);
  }
};

/**
 * Cập nhật số lượng nhiều mục trong giỏ hàng bằng một yêu cầu.
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
      error.message === PURCHASE_INVALID_MESSAGE ||
      error.message.includes('Quantity must be') ||
      error.message.includes('exceeds available stock')
    ) {
      return errorResponse(res, 400, PURCHASE_INVALID_MESSAGE);
    }
    next(error);
  }
};

/**
 * Xóa mục khỏi giỏ hàng
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

    // Lấy giỏ hàng để kiểm tra quyền sở hữu
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
