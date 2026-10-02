const prisma = require('../config/database');
const {
  PURCHASE_INVALID_MESSAGE,
  purchaseQuantityError,
  toQuantity,
  validatePurchaseQuantity
} = require('../utils/quantityValidation');

/**
 * Tính tạm tính từ các mục trong giỏ hàng và đơn giá đã chốt.
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
 * Tìm giỏ hàng theo ID người dùng, kèm các mục, sản phẩm và tạm tính.
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

const CART_ITEM_PRODUCT_SELECT = {
  id: true,
  name: true,
  brand: true,
  price: true,
  quantity: true,
  imageUrl: true
};

/**
 * Lấy hoặc tạo giỏ hàng của người dùng đã xác thực.
 * @param {string} userId 
 * @param {Object} [tx] Client giao dịch Prisma tùy chọn.
 * @returns {Promise<Object>}
 */
const getOrCreateCart = async (userId, tx = prisma) => {
  // upsert nguyên tử: hai lần tải giỏ đồng thời của người dùng mới không còn đụng unique userId (500).
  const cart = await tx.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        include: {
          product: { select: CART_ITEM_PRODUCT_SELECT }
        }
      }
    },
  });

  cart.subtotal = calculateSubtotal(cart.items);
  return cart;
};

/**
 * Thêm sản phẩm vào giỏ hàng, tạo giỏ khi cần và tăng số lượng nếu đã tồn tại.
 * `unitPrice` được chốt theo giá sản phẩm hiện tại ở lần thêm đầu tiên.
 * @param {string} userId 
 * @param {string} productId 
 * @param {number} quantity 
 * @returns {Promise<Object>} Mục giỏ hàng đã được thêm hoặc cập nhật.
 */
const addItem = async (userId, productId, quantity) => {
  if (!productId || typeof productId !== 'string') {
    throw new Error('Product ID là bắt buộc và phải là chuỗi');
  }

  const parsedQuantity = toQuantity(quantity);
  if (parsedQuantity === null || parsedQuantity < 1) {
    throw new Error(PURCHASE_INVALID_MESSAGE);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Lấy hoặc tạo giỏ hàng.
    const cart = await getOrCreateCart(userId, tx);

    // 2. Lấy sản phẩm để chốt giá hiện tại và kiểm tra tồn kho.
    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Không tìm thấy sản phẩm');
    }

    // 3. Tăng số lượng ngay trong CSDL (upsert + increment) để hai lần thêm đồng thời không ghi đè nhau;
    //    nếu tổng mới vượt tồn kho thì ném lỗi để giao dịch hoàn tác.
    const cartItem = await tx.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      },
      create: {
        cartId: cart.id,
        productId,
        quantity: parsedQuantity,
        unitPrice: product.price
      },
      update: {
        quantity: { increment: parsedQuantity }
      },
      include: {
        product: { select: CART_ITEM_PRODUCT_SELECT }
      }
    });

    const stockError = validatePurchaseQuantity(cartItem.quantity, product.quantity, {
      productName: product.name,
      inCart: cartItem.quantity - parsedQuantity
    });
    if (stockError) {
      throw purchaseQuantityError(stockError);
    }

    return cartItem;
  });
};

/** Lỗi nghiệp vụ giỏ hàng mang sẵn mã HTTP để controller trả 400/404 thay vì 500. */
const cartError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Cập nhật nguyên tử số lượng các mục trong giỏ và trả về giỏ đã làm mới.
 * @param {string} userId
 * @param {Array<{id: string, quantity: number}>} updates
 * @returns {Promise<Object>}
 */
const updateItems = async (userId, updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw cartError('Các cập nhật sản phẩm trong giỏ hàng là bắt buộc.', 400);
  }

  const seenCartItemIds = new Set();
  const normalizedUpdates = updates.map((update) => {
    const cartItemId = update?.id;
    const quantity = toQuantity(update?.quantity);

    if (!cartItemId || typeof cartItemId !== 'string') {
      throw cartError('ID sản phẩm trong giỏ hàng phải là chuỗi.', 400);
    }
    if (seenCartItemIds.has(cartItemId)) {
      throw cartError('Các cập nhật sản phẩm trong giỏ hàng không được chứa ID trùng lặp.', 400);
    }
    if (quantity === null || quantity < 1) {
      throw purchaseQuantityError(PURCHASE_INVALID_MESSAGE);
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
      throw cartError('Không tìm thấy một hoặc nhiều sản phẩm trong giỏ hàng.', 404);
    }

    const cartItemsById = new Map(cartItems.map((cartItem) => [cartItem.id, cartItem]));

    for (const update of normalizedUpdates) {
      const cartItem = cartItemsById.get(update.id);
      if (!cartItem.product) {
        throw cartError(`Không tìm thấy sản phẩm có ID ${cartItem.productId}.`, 404);
      }
      const stockError = validatePurchaseQuantity(update.quantity, cartItem.product.quantity, {
        productName: cartItem.product.name
      });
      if (stockError) {
        throw purchaseQuantityError(stockError);
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
