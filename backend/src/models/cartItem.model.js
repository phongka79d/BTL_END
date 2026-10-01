const prisma = require('../config/database');
const { PURCHASE_INVALID_MESSAGE, toQuantity, validatePurchaseQuantity } = require('../utils/quantityValidation');

/**
 * Tìm mục giỏ hàng theo ID.
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.cartItem.findUnique({
    where: { id },
  });
};

/**
 * Cập nhật số lượng mục giỏ hàng trong phạm vi giỏ của người dùng.
 * @param {string} userId 
 * @param {string} cartItemId 
 * @param {number} quantity 
 * @returns {Promise<Object>} Mục giỏ hàng đã được cập nhật.
 */
const updateQuantity = async (userId, cartItemId, quantity) => {
  const parsedQuantity = toQuantity(quantity);
  if (parsedQuantity === null || parsedQuantity < 1) {
    throw new Error(PURCHASE_INVALID_MESSAGE);
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      product: true
    }
  });

  if (!cartItem) {
    throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Không được phép truy cập sản phẩm trong giỏ hàng');
  }

  if (validatePurchaseQuantity(parsedQuantity, cartItem.product.quantity)) {
    throw new Error(PURCHASE_INVALID_MESSAGE);
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: parsedQuantity },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          price: true,
          quantity: true,
          imageUrl: true
        }
      }
    }
  });
};

/**
 * Xóa mục giỏ hàng trong phạm vi giỏ của người dùng.
 * @param {string} userId 
 * @param {string} cartItemId 
 * @returns {Promise<Object>} Mục giỏ hàng đã bị xóa.
 */
const removeItem = async (userId, cartItemId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true
    }
  });

  if (!cartItem) {
    throw new Error('Không tìm thấy sản phẩm trong giỏ hàng');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Không được phép truy cập sản phẩm trong giỏ hàng');
  }

  return prisma.cartItem.delete({
    where: { id: cartItemId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          price: true,
          quantity: true,
          imageUrl: true
        }
      }
    }
  });
};

module.exports = {
  findById,
  updateQuantity,
  removeItem,
};
