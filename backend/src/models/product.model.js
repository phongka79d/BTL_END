const prisma = require('../config/database');
const { toQuantity, validateInventoryQuantity } = require('../utils/quantityValidation');

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

// Ánh xạ trạng thái tồn kho được phép sang điều kiện lọc quantity.
// low giữ nguyên ngữ nghĩa cũ của giao diện: quantity <= 5 (bao gồm cả 0).
const STOCK_STATUS_FILTERS = {
  low: { lte: 5 },
  out: { equals: 0 },
};

const STOCK_STATUSES = Object.keys(STOCK_STATUS_FILTERS);

const normalizeSort = (sort) => (
  Object.values(PRODUCT_SORTS).includes(sort) ? sort : PRODUCT_SORTS.DEFAULT
);
const createHttpError = (message, status = 400) => Object.assign(new Error(message), { status });
const PRICE_STRING_PATTERN = /^(?:\+)?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const FILTER_PRICE_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)$/;

const isValidPrice = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0;
  if (typeof value !== 'string' || !PRICE_STRING_PATTERN.test(value.trim())) return false;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0;
};

const normalizeImageUrl = (value) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== 'string') {
    throw createHttpError('URL hình ảnh phải là chuỗi hoặc để trống.');
  }
  const imageUrl = value.trim();
  if (!imageUrl || (imageUrl.startsWith('/') && !imageUrl.startsWith('//'))) return imageUrl;
  try {
    const parsed = new URL(imageUrl);
    if (['http:', 'https:'].includes(parsed.protocol) && parsed.hostname) return imageUrl;
  } catch {
    // Fall through to one validation response for malformed URLs.
  }
  throw createHttpError('URL hình ảnh phải là URL http(s) hợp lệ hoặc đường dẫn bắt đầu bằng /.');
};

const parsePositiveInteger = (value, field, defaultValue, maximum) => {
  if (value === undefined) return defaultValue;
  const parsed = typeof value === 'number'
    ? value
    : (typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || (maximum !== undefined && parsed > maximum)) {
    const range = maximum === undefined ? 'số nguyên dương' : `số nguyên từ 1 đến ${maximum}`;
    throw createHttpError(`${field} phải là ${range}.`);
  }
  return parsed;
};

const validateListParams = ({ page, limit, minPrice, maxPrice } = {}, { allowNumbers = false } = {}) => {
  const parseFilterPrice = (value, field) => {
    if (value === undefined) return undefined;
    const isNumber = allowNumbers && typeof value === 'number';
    if (!isNumber && (typeof value !== 'string' || !FILTER_PRICE_PATTERN.test(value))) {
      throw createHttpError(`${field} phải là số thập phân không âm.`);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw createHttpError(`${field} phải là số thập phân không âm.`);
    }
    return parsed;
  };
  const parsedPage = parsePositiveInteger(page, 'Trang', 1);
  const parsedLimit = parsePositiveInteger(limit, 'Giới hạn', 12, 100);
  const parsedMinPrice = parseFilterPrice(minPrice, 'Giá tối thiểu');
  const parsedMaxPrice = parseFilterPrice(maxPrice, 'Giá tối đa');
  if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined && parsedMinPrice > parsedMaxPrice) {
    throw createHttpError('Giá tối thiểu không được lớn hơn giá tối đa.');
  }
  return { page: parsedPage, limit: parsedLimit, minPrice: parsedMinPrice, maxPrice: parsedMaxPrice };
};

const normalizeProductKey = (value) => value.trim().toLowerCase();
const trimProductText = (value) => typeof value === 'string' ? value.trim() : value;

const ensureUniqueProduct = async ({ name, brand, categoryId }, excludeId) => {
  const existingProducts = await prisma.product.findMany({
    where: { categoryId },
    select: { id: true, name: true, brand: true },
  });
  const duplicate = existingProducts.some((product) => (
    product.id !== excludeId &&
    normalizeProductKey(product.name) === normalizeProductKey(name) &&
    normalizeProductKey(product.brand) === normalizeProductKey(brand)
  ));
  if (duplicate) {
    throw createHttpError(`Sản phẩm "${name}" (${brand}) đã tồn tại trong danh mục này.`, 409);
  }
};


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
    throw createHttpError('Tên sản phẩm là bắt buộc.');
  }
  if (!brand || typeof brand !== 'string' || brand.trim() === '') {
    throw createHttpError('Thương hiệu sản phẩm là bắt buộc.');
  }
  if (price === undefined || price === null || !isValidPrice(price)) {
    throw createHttpError('Giá phải là số không âm.');
  }
  const quantityError = validateInventoryQuantity(quantity);
  if (quantityError) {
    throw createHttpError(quantityError);
  }
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '') {
    throw createHttpError('Category ID là bắt buộc.');
  }
  normalizeImageUrl(data.imageUrl);
};


/**
 * Kiểm tra dữ liệu cập nhật sản phẩm
 * @param {Object} data 
 */
const validateProductUpdateData = (data) => {
  const { name, brand, price, quantity, categoryId } = data;
  if (name !== undefined && (!name || typeof name !== 'string' || name.trim() === '')) {
    throw createHttpError('Tên sản phẩm không được để trống.');
  }
  if (brand !== undefined && (!brand || typeof brand !== 'string' || brand.trim() === '')) {
    throw createHttpError('Thương hiệu sản phẩm không được để trống.');
  }
  if (price !== undefined && (price === null || !isValidPrice(price))) {
    throw createHttpError('Giá phải là số không âm.');
  }
  if (quantity !== undefined) {
    const quantityError = validateInventoryQuantity(quantity);
    if (quantityError) {
      throw createHttpError(quantityError);
    }
  }
  if (categoryId !== undefined && (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '')) {
    throw createHttpError('Category ID không được để trống.');
  }
  if (data.imageUrl !== undefined) normalizeImageUrl(data.imageUrl);
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
 * @param {string} [params.sort]
 * @param {string} [params.stockStatus] - 'low' (quantity <= 5, gồm cả 0) hoặc 'out' (quantity = 0)
 * @returns {Promise<Object>}
 */
const findAll = async (params = {}) => {
  const { keyword, categoryId, stockStatus } = params;
  const { minPrice, maxPrice, page: pageNum, limit: limitNum } = validateListParams(params, { allowNumbers: true });
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

  if (minPrice !== undefined) {
    where.price = {
      ...where.price,
      gte: minPrice
    };
  }

  if (maxPrice !== undefined) {
    where.price = {
      ...where.price,
      lte: maxPrice
    };
  }

  // Chỉ ánh xạ các giá trị chuỗi đã được allowlist; giá trị khác không tạo thêm field Prisma.
  if (typeof stockStatus === 'string' && Object.prototype.hasOwnProperty.call(STOCK_STATUS_FILTERS, stockStatus)) {
    where.quantity = STOCK_STATUS_FILTERS[stockStatus];
  }

  const total = await prisma.product.count({ where });
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
    name: trimProductText(data.name),
    brand: trimProductText(data.brand),
    categoryId: trimProductText(data.categoryId),
    imageUrl: normalizeImageUrl(data.imageUrl),
    price: Number(data.price),
    quantity: toQuantity(data.quantity),
  };
  await ensureUniqueProduct(formattedData);
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
  if (data.name !== undefined) formattedData.name = trimProductText(data.name);
  if (data.brand !== undefined) formattedData.brand = trimProductText(data.brand);
  if (data.categoryId !== undefined) formattedData.categoryId = trimProductText(data.categoryId);
  if (data.imageUrl !== undefined) formattedData.imageUrl = normalizeImageUrl(data.imageUrl);
  if (data.price !== undefined) formattedData.price = Number(data.price);
  if (data.quantity !== undefined) formattedData.quantity = toQuantity(data.quantity);

  if (data.name !== undefined || data.brand !== undefined || data.categoryId !== undefined) {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, brand: true, categoryId: true },
    });
    if (existing) {
      await ensureUniqueProduct({
        name: formattedData.name ?? existing.name,
        brand: formattedData.brand ?? existing.brand,
        categoryId: formattedData.categoryId ?? existing.categoryId,
      }, id);
    }
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
/**
 * Cập nhật số lượng tồn kho của sản phẩm (dành cho staff và admin)
 * @param {string} id 
 * @param {number|string} quantity 
 * @returns {Promise<Object>}
 */
const updateStock = async (id, quantity) => {
  const quantityError = validateInventoryQuantity(quantity);
  if (quantityError) {
    throw createHttpError(quantityError);
  }
  const parsedQuantity = toQuantity(quantity);
  return prisma.product.update({
    where: { id },
    data: { quantity: parsedQuantity },
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

module.exports = {
  validateListParams,
  STOCK_STATUSES,
  findById,
  findAll,
  attachReviewSummaries,
  create,
  update,
  updateStock,
  destroy,
};
