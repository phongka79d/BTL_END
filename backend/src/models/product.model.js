const prisma = require('../config/database');

const emptyReviewSummary = () => ({
  averageRating: null,
  reviewCount: 0,
});

const productInclude = {
  category: {
    select: {
      id: true,
      name: true
    }
  }
};

const PRODUCT_SORTS = {
  DEFAULT: 'default',
  PRICE: 'price',
  REVIEW: 'review',
  ORDERS: 'orders',
};

const normalizeSort = (sort) => (
  Object.values(PRODUCT_SORTS).includes(sort) ? sort : PRODUCT_SORTS.DEFAULT
);

const toTimestamp = (value) => {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

const attachReviewSummaries = async (items) => {
  if (!items.length) {
    return items;
  }

  const productIds = items.map((item) => item.id).filter(Boolean);
  if (!productIds.length) {
    return items.map((item) => ({
      ...item,
      reviewSummary: emptyReviewSummary(),
    }));
  }

  const reviewGroups = await prisma.review.groupBy({
    by: ['productId'],
    where: {
      productId: { in: productIds },
      status: 'visible',
    },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const summariesByProductId = new Map(
    reviewGroups.map((group) => [
      group.productId,
      {
        averageRating: group._avg.rating === null ? null : Number(group._avg.rating),
        reviewCount: group._count._all,
      },
    ])
  );

  return items.map((item) => ({
    ...item,
    reviewSummary: summariesByProductId.get(item.id) || emptyReviewSummary(),
  }));
};

const sortByReviewSummary = (items) => [...items].sort((first, second) => {
  const firstSummary = first.reviewSummary || emptyReviewSummary();
  const secondSummary = second.reviewSummary || emptyReviewSummary();
  const firstRating = firstSummary.averageRating ?? -1;
  const secondRating = secondSummary.averageRating ?? -1;

  if (firstRating !== secondRating) {
    return secondRating - firstRating;
  }

  if (firstSummary.reviewCount !== secondSummary.reviewCount) {
    return secondSummary.reviewCount - firstSummary.reviewCount;
  }

  return toTimestamp(second.createdAt) - toTimestamp(first.createdAt);
});

const sortByOrderedQuantity = async (items) => {
  if (!items.length) {
    return items;
  }

  const productIds = items.map((item) => item.id).filter(Boolean);
  const orderGroups = await prisma.orderDetail.groupBy({
    by: ['productId'],
    where: {
      productId: { in: productIds },
    },
    _sum: { quantity: true },
  });
  const orderedQuantityByProductId = new Map(
    orderGroups.map((group) => [group.productId, Number(group._sum.quantity || 0)])
  );

  return [...items].sort((first, second) => {
    const firstQuantity = orderedQuantityByProductId.get(first.id) || 0;
    const secondQuantity = orderedQuantityByProductId.get(second.id) || 0;

    if (firstQuantity !== secondQuantity) {
      return secondQuantity - firstQuantity;
    }

    return toTimestamp(second.createdAt) - toTimestamp(first.createdAt);
  });
};

/**
 * Kiểm tra dữ liệu tạo sản phẩm
 * @param {Object} data 
 */
const validateProductData = (data) => {
  const { name, brand, price, quantity, categoryId } = data;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Tên sản phẩm là bắt buộc.');
  }
  if (!brand || typeof brand !== 'string' || brand.trim() === '') {
    throw new Error('Thương hiệu sản phẩm là bắt buộc.');
  }
  if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    throw new Error('Giá phải là số không âm.');
  }
  if (quantity === undefined || quantity === null || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    throw new Error('Số lượng phải là số nguyên không âm.');
  }
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '') {
    throw new Error('Category ID là bắt buộc.');
  }
};

/**
 * Kiểm tra dữ liệu cập nhật sản phẩm
 * @param {Object} data 
 */
const validateProductUpdateData = (data) => {
  const { name, brand, price, quantity, categoryId } = data;
  if (name !== undefined && (!name || typeof name !== 'string' || name.trim() === '')) {
    throw new Error('Tên sản phẩm không được để trống.');
  }
  if (brand !== undefined && (!brand || typeof brand !== 'string' || brand.trim() === '')) {
    throw new Error('Thương hiệu sản phẩm không được để trống.');
  }
  if (price !== undefined && (price === null || isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
    throw new Error('Giá phải là số không âm.');
  }
  if (quantity !== undefined && (quantity === null || !Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
    throw new Error('Số lượng phải là số nguyên không âm.');
  }
  if (categoryId !== undefined && (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '')) {
    throw new Error('Category ID không được để trống.');
  }
};

/**
 * Tìm sản phẩm theo ID kèm thông tin danh mục
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

/**
 * Tìm tất cả sản phẩm phù hợp với bộ lọc và phân trang
 * @param {Object} params 
 * @param {string} [params.keyword]
 * @param {string} [params.categoryId]
 * @param {number|string} [params.minPrice]
 * @param {number|string} [params.maxPrice]
 * @param {number|string} [params.page]
 * @param {number|string} [params.limit]
 * @returns {Promise<Object>}
 */
const findAll = async (params = {}) => {
  const { keyword, categoryId, minPrice, maxPrice, page, limit } = params;
  const sort = normalizeSort(params.sort);
  const where = {};

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { brand: { contains: keyword, mode: 'insensitive' } }
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    where.price = {
      ...where.price,
      gte: parseFloat(minPrice)
    };
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    where.price = {
      ...where.price,
      lte: parseFloat(maxPrice)
    };
  }

  const total = await prisma.product.count({ where });

  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 12;
  
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  if (sort === PRODUCT_SORTS.REVIEW || sort === PRODUCT_SORTS.ORDERS) {
    // ponytail: tổng hợp và sắp xếp trang sau khi tải sản phẩm phù hợp; chuyển sang SQL/chỉ số tính sẵn khi quy mô danh mục yêu cầu.
    const matchingItems = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: {
        createdAt: 'desc'
      }
    });
    const matchingItemsWithReviewSummaries = await attachReviewSummaries(matchingItems);
    const sortedItems = sort === PRODUCT_SORTS.REVIEW
      ? sortByReviewSummary(matchingItemsWithReviewSummaries)
      : await sortByOrderedQuantity(matchingItemsWithReviewSummaries);
    const totalPages = Math.ceil(total / limitNum);

    return {
      items: sortedItems.slice(skip, skip + take),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: totalPages === 0 ? 1 : totalPages
      }
    };
  }

  const orderBy = sort === PRODUCT_SORTS.PRICE
    ? { price: 'asc' }
    : { createdAt: 'desc' };

  const items = await prisma.product.findMany({
    where,
    skip,
    take,
    include: productInclude,
    orderBy
  });

  const itemsWithReviewSummaries = await attachReviewSummaries(items);
  const totalPages = Math.ceil(total / limitNum);

  return {
    items: itemsWithReviewSummaries,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: totalPages === 0 ? 1 : totalPages
    }
  };
};

/**
 * Tạo sản phẩm mới (admin)
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const create = async (data) => {
  validateProductData(data);
  const formattedData = {
    ...data,
    price: parseFloat(data.price),
    quantity: parseInt(data.quantity, 10),
  };
  return prisma.product.create({
    data: formattedData,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

/**
 * Cập nhật sản phẩm hiện có (admin)
 * @param {string} id 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const update = async (id, data) => {
  validateProductUpdateData(data);
  const formattedData = { ...data };
  if (data.price !== undefined) {
    formattedData.price = parseFloat(data.price);
  }
  if (data.quantity !== undefined) {
    formattedData.quantity = parseInt(data.quantity, 10);
  }
  return prisma.product.update({
    where: { id },
    data: formattedData,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

/**
 * Xóa sản phẩm (admin)
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const destroy = async (id) => {
  return prisma.product.delete({
    where: { id }
  });
};

module.exports = {
  findById,
  findAll,
  attachReviewSummaries,
  create,
  update,
  destroy,
};
