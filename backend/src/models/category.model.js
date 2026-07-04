const prisma = require('../config/database');

/**
 * Validate category data for creation
 * @param {Object} data 
 */
const validateCategoryData = async (data) => {
  const { name } = data;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Category name is required.');
  }

  const existing = await prisma.category.findUnique({
    where: { name: name.trim() },
  });
  if (existing) {
    throw new Error('Category name must be unique.');
  }
};

/**
 * Validate category data for update
 * @param {string} id
 * @param {Object} data 
 */
const validateCategoryUpdateData = async (id, data) => {
  const { name } = data;
  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Category name cannot be empty.');
    }

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });
    if (existing && existing.id !== id) {
      throw new Error('Category name must be unique.');
    }
  }
};

/**
 * Find category by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
const findById = async (id) => {
  return prisma.category.findUnique({
    where: { id },
  });
};

/**
 * Find category by name
 * @param {string} name 
 * @returns {Promise<Object|null>}
 */
const findByName = async (name) => {
  if (!name) return null;
  return prisma.category.findUnique({
    where: { name: name.trim() },
  });
};

/**
 * Find all categories returning only id, name, and description
 * @returns {Promise<Array<Object>>}
 */
const findAll = async () => {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Create a new category (admin)
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const create = async (data) => {
  await validateCategoryData(data);
  const formattedData = {
    name: data.name.trim(),
    description: data.description ? data.description.trim() : null,
  };
  return prisma.category.create({
    data: formattedData,
  });
};

/**
 * Update an existing category (admin)
 * @param {string} id 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const update = async (id, data) => {
  await validateCategoryUpdateData(id, data);
  const formattedData = {};
  if (data.name !== undefined) {
    formattedData.name = data.name.trim();
  }
  if (data.description !== undefined) {
    formattedData.description = data.description ? data.description.trim() : null;
  }
  return prisma.category.update({
    where: { id },
    data: formattedData,
  });
};

/**
 * Check if category has associated products
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
const hasProducts = async (id) => {
  const count = await prisma.product.count({
    where: { categoryId: id },
  });
  return count > 0;
};

/**
 * Delete a category (admin)
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const destroy = async (id) => {
  const referenced = await hasProducts(id);
  if (referenced) {
    throw new Error('Cannot delete category: it is referenced by existing products.');
  }
  return prisma.category.delete({
    where: { id },
  });
};

module.exports = {
  findById,
  findByName,
  findAll,
  create,
  update,
  hasProducts,
  destroy,
};
