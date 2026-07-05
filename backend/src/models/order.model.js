const prisma = require('../config/database');
const { Prisma } = require('@prisma/client');

/**
 * Find order by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
  });
};

/**
 * Perform atomic checkout transaction:
 * 1. Load the user's cart with items and product data.
 * 2. Reject missing/empty carts before creating any order rows.
 * 3. Validate every cart item quantity against current product quantity.
 * 4. Calculate total from cart item unitPrice times quantity using Decimal-safe Prisma values.
 * 5. Create the Order with status "pending" and the provided shippingAddress.
 * 6. Create matching OrderDetail records.
 * 7. Decrement each product's quantity.
 * 8. Create one Payment with paymentMethod "COD", paymentStatus "unpaid", amount equal to the order total, and paymentDate null.
 * 9. Delete cart items.
 * 10. Return the order shape with details, product summaries, and payment data.
 * 
 * @param {string} userId 
 * @param {string} shippingAddress 
 * @returns {Promise<Object>}
 */
const checkout = async (userId, shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim() === '') {
    throw new Error('Shipping address is required.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Load the user's cart with items and product data inside the transaction
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // 2. Reject missing/empty carts before creating any order rows
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty.');
    }

    // 3. Validate every cart item quantity against current product quantity and calculate total
    let total = new Prisma.Decimal(0);
    for (const item of cart.items) {
      if (!item.product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      if (item.quantity > item.product.quantity) {
        throw new Error(`Requested quantity for ${item.product.name} exceeds available stock (${item.product.quantity}).`);
      }
      
      const itemPrice = new Prisma.Decimal(item.unitPrice);
      const itemQuantity = new Prisma.Decimal(item.quantity);
      total = total.plus(itemPrice.times(itemQuantity));
    }

    // 4. Create the Order with status: "pending" and the provided shippingAddress
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: total,
        status: 'pending',
        shippingAddress
      }
    });

    // 5. Create matching OrderDetail records and decrement product stock
    for (const item of cart.items) {
      await tx.orderDetail.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice
        }
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    // 6. Create one Payment with paymentMethod: "COD", paymentStatus: "unpaid", amount equal to the order total, and paymentDate: null
    await tx.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
        amount: total,
        paymentDate: null
      }
    });

    // 7. Delete cart items only after order/detail/payment/stock writes are ready to commit
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // 8. Return an order shape that includes details, product summaries, and payment data for the controller response
    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        details: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true
              }
            }
          }
        },
        payment: {
          select: {
            paymentMethod: true,
            paymentStatus: true,
            amount: true
          }
        }
      }
    });
  });
};


/**
 * List orders for a specific user, sorted by newest first.
 * Includes order details with product brand/name summary, and payment data.
 * 
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
const listByUser = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      details: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true
            }
          }
        }
      },
      payment: {
        select: {
          id: true,
          paymentMethod: true,
          paymentStatus: true,
          amount: true,
          paymentDate: true
        }
      }
    }
  });
};

/**
 * Find order by ID if owned by user or if requester is admin.
 * Includes order details, product brand/name summary, payment, and customer details (no secrets).
 * 
 * @param {string} id 
 * @param {string} userId 
 * @param {boolean} isAdmin 
 * @returns {Promise<Object|null>}
 */
const findOwnedOrAdminVisible = async (id, userId, isAdmin) => {
  const where = isAdmin ? { id } : { id, userId };
  return prisma.order.findFirst({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          createdAt: true
        }
      },
      details: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true
            }
          }
        }
      },
      payment: {
        select: {
          id: true,
          paymentMethod: true,
          paymentStatus: true,
          amount: true,
          paymentDate: true
        }
      }
    }
  });
};

/**
 * List all orders for admin, sorted by newest first.
 * Supports a simple optional status filter for valid status values.
 * Includes order details, product brand/name summary, payment, and customer details (no secrets).
 * 
 * @param {string} [status] 
 * @returns {Promise<Array>}
 */
const listForAdmin = async (status) => {
  const where = {};
  if (status) {
    const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status filter: ${status}`);
    }
    where.status = status;
  }

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          createdAt: true
        }
      },
      details: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true
            }
          }
        }
      },
      payment: {
        select: {
          id: true,
          paymentMethod: true,
          paymentStatus: true,
          amount: true,
          paymentDate: true
        }
      }
    }
  });
};

/**
 * Update order status and handle side effects (payment update) in a transaction.
 * Rejects unknown status values.
 * 
 * @param {string} id - Order ID
 * @param {string} status - New order status
 * @returns {Promise<Object>}
 */
const updateStatus = async (id, status) => {
  const allowedStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { payment: true }
    });

    if (!order) {
      throw new Error(`Order with ID ${id} not found.`);
    }

    // Update status
    await tx.order.update({
      where: { id },
      data: { status }
    });

    // Side effect: completed status updates payment to paid
    if (status === 'completed' && order.payment) {
      await tx.payment.update({
        where: { orderId: id },
        data: {
          paymentStatus: 'paid',
          paymentDate: new Date()
        }
      });
    }

    // Return the updated order shape
    return tx.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            createdAt: true
          }
        },
        details: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            paymentMethod: true,
            paymentStatus: true,
            amount: true,
            paymentDate: true
          }
        }
      }
    });
  });
};

module.exports = {
  findById,
  checkout,
  listByUser,
  findOwnedOrAdminVisible,
  listForAdmin,
  updateStatus,
};

