const prisma = require('../config/database');

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
  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    throw new Error('Số lượng phải ít nhất là 1');
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

  // Từ chối khi tổng số lượng trong giỏ vượt quá tồn kho sản phẩm.
  if (parsedQuantity > cartItem.product.quantity) {
    throw new Error(`Số lượng yêu cầu vượt quá tồn kho (${cartItem.product.quantity})`);
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
