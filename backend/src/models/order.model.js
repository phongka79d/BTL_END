const prisma = require('../config/database');
const { Prisma } = require('@prisma/client');

/**
 * Tìm đơn hàng theo ID.
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.order.findUnique({
    where: { id },
  });
};

/**
 * Thực hiện giao dịch checkout nguyên tử:
 * 1. Tải giỏ hàng của người dùng cùng các mục và dữ liệu sản phẩm.
 * 2. Chọn các mục giỏ hàng được yêu cầu, hoặc toàn bộ mục để tương thích ngược.
 * 3. Từ chối lựa chọn thiếu/rỗng trước khi tạo bất kỳ dòng đơn hàng nào.
 * 4. Kiểm tra số lượng từng mục được chọn so với tồn kho sản phẩm hiện tại.
 * 5. Tính tổng từ `unitPrice` nhân số lượng bằng giá trị Prisma Decimal an toàn.
 * 6. Tạo `Order` có trạng thái "pending" và địa chỉ giao hàng được cung cấp.
 * 7. Tạo các bản ghi `OrderDetail` tương ứng.
 * 8. Giảm số lượng tồn của từng sản phẩm.
 * 9. Tạo một `Payment` COD chưa thanh toán, có tổng tiền đơn hàng và `paymentDate` là null.
 * 10. Xóa các mục giỏ hàng đã đặt.
 * 11. Trả về đơn hàng gồm chi tiết, tóm tắt sản phẩm và dữ liệu thanh toán.
 * 
 * @param {string} userId 
 * @param {string} shippingAddress
 * @param {string[]|undefined} cartItemIds
 * @returns {Promise<Object>}
 */
const checkout = async (userId, shippingAddress, cartItemIds) => {
  if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim() === '') {
    throw new Error('Shipping address is required.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Tải giỏ hàng, các mục và dữ liệu sản phẩm bên trong giao dịch.
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

    // 2. Từ chối giỏ hàng thiếu/rỗng trước khi tạo bất kỳ dòng đơn hàng nào.
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty.');
    }

    const selectedCartItemIds = cartItemIds ? new Set(cartItemIds) : null;
    const selectedItems = selectedCartItemIds
      ? cart.items.filter((item) => selectedCartItemIds.has(item.id))
      : cart.items;

    if (selectedCartItemIds && selectedItems.length !== selectedCartItemIds.size) {
      throw new Error('Selected cart items are unavailable.');
    }
    if (selectedItems.length === 0) {
      throw new Error('No cart items selected.');
    }

    // 3. Kiểm tra số lượng từng mục được chọn so với tồn kho hiện tại và tính tổng.
    let total = new Prisma.Decimal(0);
    for (const item of selectedItems) {
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

    // 4. Tạo đơn hàng trạng thái "pending" với địa chỉ giao hàng được cung cấp.
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: total,
        status: 'pending',
        shippingAddress
      }
    });

    // 5. Tạo các bản ghi `OrderDetail` tương ứng và giảm tồn kho sản phẩm.
    for (const item of selectedItems) {
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

    // 6. Tạo một thanh toán COD chưa thanh toán với tổng tiền đơn hàng và ngày thanh toán null.
    await tx.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
        amount: total,
        paymentDate: null
      }
    });

    // 7. Chỉ xóa mục giỏ hàng khi các thay đổi đơn hàng/chi tiết/thanh toán/tồn kho đã sẵn sàng commit.
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        id: { in: selectedItems.map((item) => item.id) }
      }
    });

    // 8. Trả về đơn hàng gồm chi tiết, tóm tắt sản phẩm và dữ liệu thanh toán cho controller.
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
 * Liệt kê đơn hàng của một người dùng, sắp xếp mới nhất trước.
 * Bao gồm chi tiết đơn hàng, tóm tắt thương hiệu/tên sản phẩm và dữ liệu thanh toán.
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
 * Tìm đơn hàng theo ID nếu thuộc người dùng hoặc người yêu cầu là quản trị viên.
 * Bao gồm chi tiết đơn hàng, tóm tắt thương hiệu/tên sản phẩm, thanh toán và thông tin khách hàng không nhạy cảm.
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
 * Liệt kê toàn bộ đơn hàng cho quản trị viên, sắp xếp mới nhất trước.
 * Hỗ trợ bộ lọc trạng thái tùy chọn với các giá trị hợp lệ.
 * Bao gồm chi tiết đơn hàng, tóm tắt thương hiệu/tên sản phẩm, thanh toán và thông tin khách hàng không nhạy cảm.
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
 * Cập nhật trạng thái đơn hàng và xử lý tác dụng phụ (cập nhật thanh toán) trong giao dịch.
 * Từ chối giá trị trạng thái không xác định.
 * 
 * @param {string} id - ID đơn hàng.
 * @param {string} status - Trạng thái đơn hàng mới.
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

    // Cập nhật trạng thái.
    await tx.order.update({
      where: { id },
      data: { status }
    });

    // Tác dụng phụ: trạng thái hoàn thành sẽ chuyển thanh toán sang đã trả.
    if (status === 'completed' && order.payment) {
      await tx.payment.update({
        where: { orderId: id },
        data: {
          paymentStatus: 'paid',
          paymentDate: new Date()
        }
      });
    }

    // Trả về cấu trúc đơn hàng đã cập nhật.
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
