const prisma = require('../config/database');
const { attachReviewSummaries } = require('./product.model');

const HOME_SETTINGS_ID = 'home';
const DEFAULT_FEATURED_PRODUCT_LIMIT = 6;
const MAX_FEATURED_PRODUCT_LIMIT = 24;

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
};

const normalizeLimit = (value) => {
  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_FEATURED_PRODUCT_LIMIT) {
    throw new Error(`Featured product count must be between 1 and ${MAX_FEATURED_PRODUCT_LIMIT}.`);
  }

  return limit;
};

const getStorefrontSettings = async () => {
  const settings = await prisma.storefrontSetting.findUnique({
    where: { id: HOME_SETTINGS_ID },
    select: { featuredProductLimit: true },
  });

  return {
    featuredProductLimit: settings?.featuredProductLimit || DEFAULT_FEATURED_PRODUCT_LIMIT,
  };
};

const toPublicResponse = async (products, settings) => ({
  items: await attachReviewSummaries(products),
  settings,
});

const findPublicFeaturedProducts = async () => {
  const settings = await getStorefrontSettings();
  const featuredRows = await prisma.storefrontFeaturedProduct.findMany({
    where: { isActive: true },
    take: settings.featuredProductLimit,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      product: {
        include: productInclude,
      },
    },
  });

  const configuredProducts = featuredRows.map((row) => row.product).filter(Boolean);
  if (configuredProducts.length > 0) {
    return toPublicResponse(configuredProducts, settings);
  }

  const latestProducts = await prisma.product.findMany({
    take: settings.featuredProductLimit,
    include: productInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return toPublicResponse(latestProducts, settings);
};

const findAdminFeaturedProducts = async () => {
  const [settings, items] = await Promise.all([
    getStorefrontSettings(),
    prisma.storefrontFeaturedProduct.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        product: {
          include: productInclude,
        },
      },
    }),
  ]);

  return { items, settings };
};

const updateStorefrontSettings = async ({ featuredProductLimit }) => {
  const nextLimit = normalizeLimit(featuredProductLimit);
  const settings = await prisma.storefrontSetting.upsert({
    where: { id: HOME_SETTINGS_ID },
    update: { featuredProductLimit: nextLimit },
    create: { id: HOME_SETTINGS_ID, featuredProductLimit: nextLimit },
  });

  return {
    featuredProductLimit: settings.featuredProductLimit,
  };
};

const validateProduct = async (productId) => {
  if (!productId || typeof productId !== 'string' || productId.trim() === '') {
    throw new Error('Featured product is required.');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new Error('Featured product was not found.');
  }
};

const normalizeFeaturedProductPayload = (data) => ({
  productId: data.productId,
  sortOrder: Number.isInteger(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
  isActive: data.isActive !== false,
});

const createFeaturedProduct = async (data) => {
  await validateProduct(data.productId);
  return prisma.storefrontFeaturedProduct.create({
    data: normalizeFeaturedProductPayload(data),
  });
};

const updateFeaturedProduct = async (id, data) => {
  await validateProduct(data.productId);
  return prisma.storefrontFeaturedProduct.update({
    where: { id },
    data: normalizeFeaturedProductPayload(data),
  });
};

const deleteFeaturedProduct = (id) => prisma.storefrontFeaturedProduct.delete({ where: { id } });

module.exports = {
  findPublicFeaturedProducts,
  findAdminFeaturedProducts,
  updateStorefrontSettings,
  createFeaturedProduct,
  updateFeaturedProduct,
  deleteFeaturedProduct,
};
