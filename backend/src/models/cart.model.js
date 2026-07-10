const prisma = require('../config/database');

/**
 * Calculate subtotal from cart items and captured unit prices
 * @param {Array<Object>} items 
 * @returns {string}
 */
const calculateSubtotal = (items) => {
  if (!items || items.length === 0) return "0.00";
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice) || 0;
    return sum + (price * item.quantity);
  }, 0);
  return total.toFixed(2);
};

/**
 * Find cart by User ID with items, products, and subtotal
 * @param {string} userId 
 * @returns {Promise<Object|null>}
 */
const findByUserId = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
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
      }
    },
  });

  if (!cart) return null;

  cart.subtotal = calculateSubtotal(cart.items);
  return cart;
};

/**
 * Fetch or create the authenticated user's cart
 * @param {string} userId 
 * @param {Object} [tx] Optional prisma transaction client
 * @returns {Promise<Object>}
 */
const getOrCreateCart = async (userId, tx = prisma) => {
  let cart = await tx.cart.findUnique({
    where: { userId },
    include: {
      items: {
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
      }
    },
  });

  if (!cart) {
    cart = await tx.cart.create({
      data: { userId },
      include: {
        items: {
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
        }
      },
    });
  }

  cart.subtotal = calculateSubtotal(cart.items);
  return cart;
};

/**
 * Add product to cart, creating cart if needed, incrementing quantity if existing.
 * Captured unitPrice is captured from current product price when first added.
 * @param {string} userId 
 * @param {string} productId 
 * @param {number} quantity 
 * @returns {Promise<Object>} The added/updated cart item
 */
const addItem = async (userId, productId, quantity) => {
  if (!productId || typeof productId !== 'string') {
    throw new Error('Product ID is required and must be a string');
  }

  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Fetch or create cart
    const cart = await getOrCreateCart(userId, tx);

    // 2. Fetch the product to capture current price and verify stock
    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // 3. Find if cart item already exists
    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    });

    const newQuantity = existingItem ? (existingItem.quantity + parsedQuantity) : parsedQuantity;

    // Reject total cart quantity above product stock
    if (newQuantity > product.quantity) {
      throw new Error(`Requested quantity exceeds available stock (${product.quantity})`);
    }

    if (existingItem) {
      // Increment existing quantity
      return tx.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity
        },
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
    } else {
      // Create new cart item and capture product price as unitPrice
      return tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: parsedQuantity,
          unitPrice: product.price
        },
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
    }
  });
};

/**
 * Atomically update a user's cart item quantities and return the refreshed cart.
 * @param {string} userId
 * @param {Array<{id: string, quantity: number}>} updates
 * @returns {Promise<Object>}
 */
const updateItems = async (userId, updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('Cart item updates are required.');
  }

  const seenCartItemIds = new Set();
  const normalizedUpdates = updates.map((update) => {
    const cartItemId = update?.id;
    const quantity = Number(update?.quantity);

    if (!cartItemId || typeof cartItemId !== 'string') {
      throw new Error('Cart item ID must be a string.');
    }
    if (seenCartItemIds.has(cartItemId)) {
      throw new Error('Cart item updates must not contain duplicate IDs.');
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Quantity must be an integer of at least 1.');
    }

    seenCartItemIds.add(cartItemId);
    return { id: cartItemId, quantity };
  });

  return prisma.$transaction(async (transaction) => {
    const cart = await getOrCreateCart(userId, transaction);
    const cartItemIds = normalizedUpdates.map((update) => update.id);
    const cartItems = await transaction.cartItem.findMany({
      where: {
        cartId: cart.id,
        id: { in: cartItemIds }
      },
      include: {
        product: true
      }
    });

    if (cartItems.length !== normalizedUpdates.length) {
      throw new Error('One or more cart items were not found.');
    }

    const cartItemsById = new Map(cartItems.map((cartItem) => [cartItem.id, cartItem]));

    for (const update of normalizedUpdates) {
      const cartItem = cartItemsById.get(update.id);
      if (!cartItem.product) {
        throw new Error(`Product with ID ${cartItem.productId} not found.`);
      }
      if (update.quantity > cartItem.product.quantity) {
        throw new Error(`Requested quantity exceeds available stock (${cartItem.product.quantity})`);
      }

      await transaction.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: update.quantity }
      });
    }

    return getOrCreateCart(userId, transaction);
  });
};

module.exports = {
  findByUserId,
  getOrCreateCart,
  calculateSubtotal,
  addItem,
  updateItems,
};
