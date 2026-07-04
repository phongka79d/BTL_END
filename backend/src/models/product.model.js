const prisma = require('../config/database');

/**
 * Validate product creation data
 * @param {Object} data 
 */
const validateProductData = (data) => {
  const { name, brand, price, quantity, categoryId } = data;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Product name is required.');
  }
  if (!brand || typeof brand !== 'string' || brand.trim() === '') {
    throw new Error('Product brand is required.');
  }
  if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    throw new Error('Price must be a non-negative number.');
  }
  if (quantity === undefined || quantity === null || !Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    throw new Error('Quantity must be a non-negative integer.');
  }
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '') {
    throw new Error('Category ID is required.');
  }
};

/**
 * Validate product update data
 * @param {Object} data 
 */
const validateProductUpdateData = (data) => {
  const { name, brand, price, quantity, categoryId } = data;
  if (name !== undefined && (!name || typeof name !== 'string' || name.trim() === '')) {
    throw new Error('Product name cannot be empty.');
  }
  if (brand !== undefined && (!brand || typeof brand !== 'string' || brand.trim() === '')) {
    throw new Error('Product brand cannot be empty.');
  }
  if (price !== undefined && (price === null || isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
    throw new Error('Price must be a non-negative number.');
  }
  if (quantity !== undefined && (quantity === null || !Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
    throw new Error('Quantity must be a non-negative integer.');
  }
  if (categoryId !== undefined && (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '')) {
    throw new Error('Category ID cannot be empty.');
  }
};

/**
 * Find product by ID with category info
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
 * Find all products matching filters with pagination
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

  const items = await prisma.product.findMany({
    where,
    skip,
    take,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalPages = Math.ceil(total / limitNum);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: totalPages === 0 ? 1 : totalPages
    }
  };
};

/**
 * Create a new product (admin)
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
 * Update an existing product (admin)
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
 * Delete a product (admin)
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
  create,
  update,
  destroy,
};
