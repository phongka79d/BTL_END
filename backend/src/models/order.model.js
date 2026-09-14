const prisma = require('../config/database');
const { Prisma } = require('@prisma/client');

/**
 * Sơ đồ chuyển trạng thái đơn hàng được phép.
 * Nguồn chân lý duy nhất cho vòng đời đơn hàng:
 * pending → confirmed → shipping → completed, và mọi trạng thái chưa kết thúc
 * đều có thể chuyển sang cancelled. completed/cancelled là trạng thái cuối.
 */
const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

/**
 * Các trạng thái mà khách hàng được phép tự hủy đơn
 * (trước khi cửa hàng bàn giao đơn cho vận chuyển).
 */
const CUSTOMER_CANCELLABLE_STATUSES = ['pending', 'confirmed'];

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
      throw new Error('Địa chỉ giao hàng là bắt buộc.');
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
      throw new Error('Giỏ hàng trống.');
    }

    const selectedCartItemIds = cartItemIds ? new Set(cartItemIds) : null;
    const selectedItems = selectedCartItemIds
      ? cart.items.filter((item) => selectedCartItemIds.has(item.id))
      : cart.items;

    if (selectedCartItemIds && selectedItems.length !== selectedCartItemIds.size) {
      throw new Error('Các sản phẩm đã chọn trong giỏ hàng không khả dụng.');
    }
    if (selectedItems.length === 0) {
      throw new Error('Chưa chọn sản phẩm nào trong giỏ hàng.');
    }

    // 3. Kiểm tra số lượng từng mục được chọn so với tồn kho hiện tại và tính tổng.
    let total = new Prisma.Decimal(0);
    for (const item of selectedItems) {
      if (!item.product) {
        throw new Error(`Không tìm thấy sản phẩm có ID ${item.productId}.`);
      }
      if (item.quantity > item.product.quantity) {
        throw new Error(`Số lượng yêu cầu của ${item.product.name} vượt quá tồn kho (${item.product.quantity}).`);
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
 * @param {boolean} canViewAll 
 * @returns {Promise<Object|null>}
 */
const findOwnedOrAdminVisible = async (id, userId, canViewAll) => {
  const where = canViewAll ? { id } : { id, userId };
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
 * Liệt kê toàn bộ đơn hàng cho quản trị viên và nhân viên, sắp xếp mới nhất trước.
 * Hỗ trợ bộ lọc trạng thái và từ khóa tìm kiếm.
 * 
 * @param {string|Object} [filters] 
 * @returns {Promise<Array>}
 */
const listForAdmin = async (filters) => {
  const opts = typeof filters === 'string' ? { status: filters } : (filters || {});
  const { status, keyword } = opts;
  const where = {};

  // 1. Kiểm tra bộ lọc trạng thái
  if (status) {
    const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Bộ lọc trạng thái không hợp lệ: ${status}`);
    }
    where.status = status;
  }

  // 2. Kiểm tra bộ lọc từ khóa
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const term = keyword.trim();
    where.OR = [
      { id: { contains: term, mode: 'insensitive' } },
      { shippingAddress: { contains: term, mode: 'insensitive' } },
      { user: { fullName: { contains: term, mode: 'insensitive' } } },
      { user: { username: { contains: term, mode: 'insensitive' } } },
      { user: { email: { contains: term, mode: 'insensitive' } } },
      { user: { phone: { contains: term, mode: 'insensitive' } } },
    ];
  }

  // 3. Phân tích và kiểm tra tính hợp lệ của page và limit
  let pageNum = 1;
  if (opts.page !== undefined && opts.page !== null && opts.page !== '') {
    const parsed = Number(opts.page);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error('Trang phải là số nguyên dương (>= 1)');
    }
    pageNum = parsed;
  }

  let limitNum = 10;
  if (opts.limit !== undefined && opts.limit !== null && opts.limit !== '') {
    const parsed = Number(opts.limit);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      throw new Error('Giới hạn phải là số nguyên từ 1 đến 100');
    }
    limitNum = parsed;
  }

  const queryOptions = {
    where,
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
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
  };

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany(queryOptions)
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Cập nhật trạng thái đơn hàng và xử lý tác dụng phụ trong giao dịch.
 * - Từ chối giá trị trạng thái không xác định.
 * - Từ chối chuyển trạng thái không nằm trong ORDER_STATUS_TRANSITIONS.
 * - Hủy đơn sẽ hoàn trả tồn kho; hoàn tất đơn sẽ đánh dấu thanh toán đã trả.
 * 
 * @param {string} id - ID đơn hàng.
 * @param {string} status - Trạng thái đơn hàng mới.
 * @returns {Promise<Object>}
 */
const updateStatus = async (id, status) => {
  const allowedStatuses = Object.keys(ORDER_STATUS_TRANSITIONS);
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Trạng thái không hợp lệ: ${status}`);
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { payment: true, details: true }
    });

    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng có ID ${id}.`);
    }

    const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      throw new Error(`Không thể chuyển trạng thái từ ${order.status} sang ${status}.`);
    }

    // Cập nhật trạng thái kèm điều kiện trạng thái hiện tại chưa thay đổi,
    // tránh xử lý trùng khi có nhiều yêu cầu đồng thời.
    const updateResult = await tx.order.updateMany({
      where: { id, status: order.status },
      data: { status }
    });

    if (updateResult.count !== 1) {
      throw new Error('Trạng thái đơn hàng đã thay đổi, vui lòng thử lại.');
    }

    // Tác dụng phụ: hủy đơn sẽ hoàn trả số lượng tồn kho đã trừ lúc đặt hàng.
    if (status === 'cancelled') {
      for (const detail of order.details) {
        await tx.product.update({
          where: { id: detail.productId },
          data: { quantity: { increment: detail.quantity } }
        });
      }
    }

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

/**
 * Khách hàng tự hủy đơn hàng của mình.
 * Chỉ cho phép khi đơn thuộc về khách hàng và đang ở trạng thái chờ xác nhận
 * hoặc đã xác nhận (trước khi bàn giao vận chuyển). Tồn kho được hoàn trả
 * trong cùng giao dịch để tránh thất thoát số lượng.
 * 
 * @param {string} orderId - ID đơn hàng.
 * @param {string} userId - ID khách hàng đang đăng nhập.
 * @returns {Promise<Object>} Đơn hàng đã hủy kèm chi tiết và thanh toán.
 */
const cancelOwnOrder = async (orderId, userId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { details: true }
    });

    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng có ID ${orderId}.`);
    }

    if (order.userId !== userId) {
      throw new Error('Không được phép hủy đơn hàng của người dùng khác.');
    }

    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
      throw new Error(
        'Chỉ có thể hủy đơn hàng đang chờ xác nhận hoặc đã xác nhận.'
      );
    }

    const updateResult = await tx.order.updateMany({
      where: { id: orderId, status: { in: CUSTOMER_CANCELLABLE_STATUSES } },
      data: { status: 'cancelled' }
    });

    if (updateResult.count !== 1) {
      throw new Error('Trạng thái đơn hàng đã thay đổi, vui lòng thử lại.');
    }

    for (const detail of order.details) {
      await tx.product.update({
        where: { id: detail.productId },
        data: { quantity: { increment: detail.quantity } }
      });
    }

    return tx.order.findUnique({
      where: { id: orderId },
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
  });
};

module.exports = {
  findById,
  checkout,
  listByUser,
  findOwnedOrAdminVisible,
  listForAdmin,
  updateStatus,
  cancelOwnOrder,
  ORDER_STATUS_TRANSITIONS,
  CUSTOMER_CANCELLABLE_STATUSES,
};
