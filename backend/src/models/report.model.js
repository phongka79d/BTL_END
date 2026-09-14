const { Prisma } = require('@prisma/client');
const prisma = require('../config/database');

const COMPLETED_PAID_COD_ORDER = {
  status: 'completed',
  payment: {
    is: {
      paymentMethod: 'COD',
      paymentStatus: 'paid',
    },
  },
};

/**
 * Tạo điều kiện lọc theo khoảng thời gian đặt hàng.
 * Trả về null khi không có khoảng để giữ nguyên hình dạng truy vấn cũ.
 * @param {{startDate?: Date, endDate?: Date}|null} range
 * @returns {Object|null}
 */
const buildCreatedAtRange = (range) => {
  if (!range || (!range.startDate && !range.endDate)) {
    return null;
  }

  const createdAt = {};
  if (range.startDate) createdAt.gte = range.startDate;
  if (range.endDate) createdAt.lte = range.endDate;

  return { createdAt };
};

const getRevenue = async (range) => {
  const result = await prisma.order.aggregate({
    where: { ...COMPLETED_PAID_COD_ORDER, ...buildCreatedAtRange(range) },
    _sum: { totalAmount: true },
    _count: { _all: true },
  });

  return {
    totalRevenue: new Prisma.Decimal(result._sum.totalAmount || 0).toFixed(2),
    completedOrderCount: result._count._all,
  };
};

const getBestSellingProducts = async (range) => {
  const groups = await prisma.orderDetail.groupBy({
    by: ['productId', 'price'],
    where: { order: { ...COMPLETED_PAID_COD_ORDER, ...buildCreatedAtRange(range) } },
    _sum: { quantity: true },
  });

  const totalsByProduct = new Map();
  for (const group of groups) {
    const quantity = group._sum.quantity || 0;
    const current = totalsByProduct.get(group.productId) || {
      productId: group.productId,
      soldQuantity: 0,
      revenue: new Prisma.Decimal(0),
    };

    current.soldQuantity += quantity;
    current.revenue = current.revenue.plus(
      new Prisma.Decimal(group.price).times(quantity)
    );
    totalsByProduct.set(group.productId, current);
  }

  const topProducts = [...totalsByProduct.values()]
    .sort((left, right) => (
      right.soldQuantity - left.soldQuantity
      || right.revenue.comparedTo(left.revenue)
    ))
    .slice(0, 5);

  if (topProducts.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { id: { in: topProducts.map(({ productId }) => productId) } },
    select: { id: true, name: true, brand: true },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  return topProducts
    .filter(({ productId }) => productsById.has(productId))
    .map(({ productId, soldQuantity, revenue }) => {
      const product = productsById.get(productId);
      return {
        productId,
        name: product.name,
        brand: product.brand,
        soldQuantity,
        revenue: revenue.toFixed(2),
      };
    });
};

const getOrderSummary = async (range) => {
  const rangeFilter = buildCreatedAtRange(range);
  const groups = await prisma.order.groupBy({
    by: ['status'],
    ...(rangeFilter ? { where: rangeFilter } : {}),
    _count: { _all: true },
  });
  const summary = {
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const group of groups) {
    summary[group.status] = group._count._all;
  }

  return summary;
};

module.exports = {
  getRevenue,
  getBestSellingProducts,
  getOrderSummary,
};
