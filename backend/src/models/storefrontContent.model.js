const prisma = require('../config/database');

const LINK_TYPES = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  CUSTOM_URL: 'customUrl',
};

const NAV_ITEM_TYPES = {
  LINK: 'link',
  MEGA_MENU: 'mega_menu',
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidCustomUrl = (value) => (
  isNonEmptyString(value) &&
  (value.trim().startsWith('/') || value.trim().startsWith('http://') || value.trim().startsWith('https://'))
);

const toNullableString = (value) => (isNonEmptyString(value) ? value.trim() : null);

const buildLinkTarget = ({ linkType, productId, categoryId, customUrl }) => ({
  type: linkType,
  productId: productId || null,
  categoryId: categoryId || null,
  customUrl: customUrl || null,
});

const targetField = (prefix, fieldName) => {
  if (!prefix) return fieldName;
  return `${prefix}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
};

const hasResolvedTarget = (item, prefix = '') => {
  const linkType = item[targetField(prefix, 'linkType')];
  if (!linkType) return false;
  if (linkType === LINK_TYPES.PRODUCT) return Boolean(item[targetField(prefix, 'productId')]);
  if (linkType === LINK_TYPES.CATEGORY) return Boolean(item[targetField(prefix, 'categoryId')]);
  if (linkType === LINK_TYPES.CUSTOM_URL) return isValidCustomUrl(item[targetField(prefix, 'customUrl')]);
  return false;
};

const validateLinkTarget = async ({ linkType, productId, categoryId, customUrl }, { isRequired = true } = {}) => {
  if (!linkType) {
    if (isRequired) throw new Error('Link type is required.');
    return;
  }

  if (!Object.values(LINK_TYPES).includes(linkType)) {
    throw new Error('Link type is invalid.');
  }

  if (linkType === LINK_TYPES.PRODUCT) {
    if (!isNonEmptyString(productId)) {
      throw new Error('Product link target is required.');
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new Error('Product link target was not found.');
    }
  }

  if (linkType === LINK_TYPES.CATEGORY) {
    if (!isNonEmptyString(categoryId)) {
      throw new Error('Category link target is required.');
    }
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new Error('Category link target was not found.');
    }
  }

  if (linkType === LINK_TYPES.CUSTOM_URL && !isValidCustomUrl(customUrl)) {
    throw new Error('Custom URL must start with /, http://, or https://.');
  }
};

const normalizeLinkTargetData = ({ linkType, productId, categoryId, customUrl }) => ({
  linkType,
  productId: linkType === LINK_TYPES.PRODUCT ? productId : null,
  categoryId: linkType === LINK_TYPES.CATEGORY ? categoryId : null,
  customUrl: linkType === LINK_TYPES.CUSTOM_URL ? customUrl.trim() : null,
});

const validateCarouselPayload = async (data) => {
  if (!isNonEmptyString(data.title)) throw new Error('Carousel title is required.');
  if (data.isActive !== false && !isNonEmptyString(data.imageUrl)) throw new Error('Carousel image URL is required.');
  if (!isNonEmptyString(data.primaryButtonLabel)) throw new Error('Carousel button label is required.');
  await validateLinkTarget(data);
};

const normalizeCarouselPayload = (data) => ({
  title: data.title.trim(),
  description: toNullableString(data.description),
  imageUrl: toNullableString(data.imageUrl),
  primaryButtonLabel: data.primaryButtonLabel.trim(),
  ...normalizeLinkTargetData(data),
  sortOrder: Number.isInteger(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
  isActive: data.isActive !== false,
});

const findPublicCarouselSlides = async () => {
  const slides = await prisma.carouselSlide.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      product: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  return slides
    .filter(hasResolvedTarget)
    .map((slide) => ({
      id: slide.id,
      title: slide.title,
      description: slide.description || '',
      imageUrl: slide.imageUrl || '',
      primaryButtonLabel: slide.primaryButtonLabel,
      linkTarget: buildLinkTarget(slide),
      sortOrder: slide.sortOrder,
    }));
};

const findAdminCarouselSlides = () => prisma.carouselSlide.findMany({
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  include: {
    product: { select: { id: true, name: true } },
    category: { select: { id: true, name: true } },
  },
});

const createCarouselSlide = async (data) => {
  await validateCarouselPayload(data);
  return prisma.carouselSlide.create({ data: normalizeCarouselPayload(data) });
};

const updateCarouselSlide = async (id, data) => {
  await validateCarouselPayload(data);
  return prisma.carouselSlide.update({
    where: { id },
    data: normalizeCarouselPayload(data),
  });
};

const deleteCarouselSlide = (id) => prisma.carouselSlide.delete({ where: { id } });

const validateNavigationPayload = async (data) => {
  if (!isNonEmptyString(data.label)) throw new Error('Navigation label is required.');
  if (!Object.values(NAV_ITEM_TYPES).includes(data.itemType)) throw new Error('Navigation item type is invalid.');

  if (data.parentId) {
    const parent = await prisma.storefrontNavItem.findUnique({
      where: { id: data.parentId },
      select: { id: true, parentId: true, itemType: true },
    });
    if (!parent || parent.parentId || parent.itemType !== NAV_ITEM_TYPES.MEGA_MENU) {
      throw new Error('Navigation children must belong to a top-level mega menu.');
    }
  }

  if (!data.parentId && data.itemType === NAV_ITEM_TYPES.LINK) {
    await validateLinkTarget(data);
  }

  if (data.parentId) {
    await validateLinkTarget(data);
  }

  if (isNonEmptyString(data.featuredLinkLabel) || data.featuredLinkType) {
    await validateLinkTarget({
      linkType: data.featuredLinkType,
      productId: data.featuredProductId,
      categoryId: data.featuredCategoryId,
      customUrl: data.featuredCustomUrl,
    });
  }
};

const normalizeNavigationPayload = (data) => {
  const linkData = data.itemType === NAV_ITEM_TYPES.MEGA_MENU && !data.parentId
    ? { linkType: null, productId: null, categoryId: null, customUrl: null }
    : normalizeLinkTargetData(data);

  return {
    parentId: toNullableString(data.parentId),
    label: data.label.trim(),
    description: toNullableString(data.description),
    itemType: data.itemType,
    icon: toNullableString(data.icon),
    ...linkData,
    featuredTitle: toNullableString(data.featuredTitle),
    featuredDescription: toNullableString(data.featuredDescription),
    featuredImageUrl: toNullableString(data.featuredImageUrl),
    featuredLinkLabel: toNullableString(data.featuredLinkLabel),
    featuredLinkType: data.featuredLinkType || null,
    featuredProductId: data.featuredLinkType === LINK_TYPES.PRODUCT ? data.featuredProductId : null,
    featuredCategoryId: data.featuredLinkType === LINK_TYPES.CATEGORY ? data.featuredCategoryId : null,
    featuredCustomUrl: data.featuredLinkType === LINK_TYPES.CUSTOM_URL ? (data.featuredCustomUrl || '').trim() : null,
    sortOrder: Number.isInteger(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== false,
  };
};

const navInclude = {
  product: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  featuredProduct: { select: { id: true, name: true } },
  featuredCategory: { select: { id: true, name: true } },
};

const toFeaturedCard = (item) => {
  if (!item.featuredTitle || !item.featuredLinkLabel || !hasResolvedTarget(item, 'featured')) {
    return null;
  }

  return {
    title: item.featuredTitle,
    description: item.featuredDescription || '',
    imageUrl: item.featuredImageUrl || '',
    linkLabel: item.featuredLinkLabel,
    linkTarget: buildLinkTarget({
      linkType: item.featuredLinkType,
      productId: item.featuredProductId,
      categoryId: item.featuredCategoryId,
      customUrl: item.featuredCustomUrl,
    }),
  };
};

const toPublicChildNavItem = (item) => ({
  id: item.id,
  label: item.label,
  description: item.description || '',
  icon: item.icon || 'info',
  linkTarget: buildLinkTarget(item),
  sortOrder: item.sortOrder,
});

const findPublicNavigation = async () => {
  const items = await prisma.storefrontNavItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: navInclude,
  });

  const childrenByParentId = new Map();
  items
    .filter((item) => item.parentId && hasResolvedTarget(item))
    .forEach((item) => {
      const children = childrenByParentId.get(item.parentId) || [];
      children.push(toPublicChildNavItem(item));
      childrenByParentId.set(item.parentId, children);
    });

  return items
    .filter((item) => !item.parentId)
    .filter((item) => item.itemType === NAV_ITEM_TYPES.MEGA_MENU || hasResolvedTarget(item))
    .map((item) => {
      if (item.itemType === NAV_ITEM_TYPES.MEGA_MENU) {
        return {
          id: item.id,
          label: item.label,
          itemType: item.itemType,
          sortOrder: item.sortOrder,
          featured: toFeaturedCard(item),
          children: childrenByParentId.get(item.id) || [],
        };
      }

      return {
        id: item.id,
        label: item.label,
        itemType: item.itemType,
        linkTarget: buildLinkTarget(item),
        sortOrder: item.sortOrder,
      };
    });
};

const findAdminNavigation = () => prisma.storefrontNavItem.findMany({
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  include: navInclude,
});

const createNavigationItem = async (data) => {
  await validateNavigationPayload(data);
  return prisma.storefrontNavItem.create({ data: normalizeNavigationPayload(data) });
};

const updateNavigationItem = async (id, data) => {
  await validateNavigationPayload(data);
  return prisma.storefrontNavItem.update({
    where: { id },
    data: normalizeNavigationPayload(data),
  });
};

const deleteNavigationItem = (id) => prisma.storefrontNavItem.delete({ where: { id } });

module.exports = {
  LINK_TYPES,
  NAV_ITEM_TYPES,
  validateLinkTarget,
  findPublicCarouselSlides,
  findAdminCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  findPublicNavigation,
  findAdminNavigation,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
};
