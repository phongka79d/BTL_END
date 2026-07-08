const prisma = require('../config/database');

const REVIEW_USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
};

/**
 * List visible reviews for admin moderation, newest first.
 * @param {Object} filters
 * @param {string} [filters.productId]
 * @returns {Promise<Array>}
 */
const listVisibleForAdmin = async ({ productId } = {}) => {
  return prisma.review.findMany({
    where: {
      status: 'visible',
      ...(productId ? { productId } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: REVIEW_USER_SELECT,
      },
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
    },
  });
};

/**
 * List visible reviews for a product, newest first
 * @param {string} productId
 * @returns {Promise<Array>}
 */
const listVisibleByProductId = async (productId) => {
  return prisma.review.findMany({
    where: {
      productId,
      status: 'visible',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: REVIEW_USER_SELECT,
      },
    },
  });
};

/**
 * Find review by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: REVIEW_USER_SELECT,
      },
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
    },
  });
};

/**
 * Create a visible review for a product
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} data.productId
 * @param {number} data.rating
 * @param {string} [data.comment]
 * @returns {Promise<Object>}
 */
const create = async ({ userId, productId, rating, comment }) => {
  const trimmedComment = typeof comment === 'string' ? comment.trim() : undefined;

  return prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      status: 'visible',
      ...(trimmedComment ? { comment: trimmedComment } : {}),
    },
    include: {
      user: {
        select: REVIEW_USER_SELECT,
      },
    },
  });
};

/**
 * Hide a review without deleting the row
 * @param {string} id
 * @returns {Promise<Object>}
 */
const hide = async (id) => {
  return prisma.review.update({
    where: { id },
    data: {
      status: 'hidden',
    },
    include: {
      user: {
        select: REVIEW_USER_SELECT,
      },
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
    },
  });
};

module.exports = {
  listVisibleForAdmin,
  listVisibleByProductId,
  findById,
  create,
  hide,
};
