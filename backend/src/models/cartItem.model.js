const prisma = require('../config/database');

/**
 * Find cart item by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.cartItem.findUnique({
    where: { id },
  });
};

/**
 * Update cart item quantity scoped to the user's cart
 * @param {string} userId 
 * @param {string} cartItemId 
 * @param {number} quantity 
 * @returns {Promise<Object>} The updated cart item
 */
const updateQuantity = async (userId, cartItemId, quantity) => {
  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      product: true
    }
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized access to cart item');
  }

  // Reject total cart quantity above product stock
  if (parsedQuantity > cartItem.product.quantity) {
    throw new Error(`Requested quantity exceeds available stock (${cartItem.product.quantity})`);
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
 * Remove cart item scoped to the user's cart
 * @param {string} userId 
 * @param {string} cartItemId 
 * @returns {Promise<Object>} The deleted cart item
 */
const removeItem = async (userId, cartItemId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true
    }
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized access to cart item');
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

