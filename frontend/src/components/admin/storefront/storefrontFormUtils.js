export const LINK_TYPE_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'category', label: 'Category' },
  { value: 'customUrl', label: 'Custom URL' },
];

export const NAV_ITEM_TYPE_OPTIONS = [
  { value: 'link', label: 'Simple link' },
  { value: 'mega_menu', label: 'Mega menu' },
];

export const NAV_ICON_OPTIONS = [
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'copy', label: 'Copy' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'warning', label: 'Warning' },
  { value: 'check', label: 'Check' },
  { value: 'externalLink', label: 'External link' },
];

export const EMPTY_CAROUSEL_FORM = {
  title: '',
  description: '',
  imageUrl: '',
  primaryButtonLabel: 'Shop now',
  linkType: 'product',
  productId: '',
  categoryId: '',
  customUrl: '',
  sortOrder: 0,
  isActive: true,
};

export const EMPTY_NAVIGATION_FORM = {
  label: '',
  description: '',
  itemType: 'link',
  parentId: '',
  icon: 'info',
  linkType: 'product',
  productId: '',
  categoryId: '',
  customUrl: '',
  featuredTitle: '',
  featuredDescription: '',
  featuredImageUrl: '',
  featuredLinkLabel: '',
  featuredLinkType: 'customUrl',
  featuredProductId: '',
  featuredCategoryId: '',
  featuredCustomUrl: '',
  sortOrder: 0,
  isActive: true,
};

const trim = (value) => (typeof value === 'string' ? value.trim() : value);
const asNumber = (value) => (Number.isInteger(Number(value)) ? Number(value) : 0);

export const getCarouselFormValues = (slide) => (
  slide
    ? {
        ...EMPTY_CAROUSEL_FORM,
        title: slide.title || '',
        description: slide.description || '',
        imageUrl: slide.imageUrl || '',
        primaryButtonLabel: slide.primaryButtonLabel || 'Shop now',
        linkType: slide.linkType || slide.linkTarget?.type || 'product',
        productId: slide.productId || slide.linkTarget?.productId || '',
        categoryId: slide.categoryId || slide.linkTarget?.categoryId || '',
        customUrl: slide.customUrl || slide.linkTarget?.customUrl || '',
        sortOrder: slide.sortOrder || 0,
        isActive: slide.isActive !== false,
      }
    : EMPTY_CAROUSEL_FORM
);

const targetField = (prefix, fieldName) => {
  if (!prefix) return fieldName;
  return `${prefix}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
};

const validateLinkTarget = (values, errors, prefix = '') => {
  const linkTypeKey = targetField(prefix, 'linkType');
  const productIdKey = targetField(prefix, 'productId');
  const categoryIdKey = targetField(prefix, 'categoryId');
  const customUrlKey = targetField(prefix, 'customUrl');
  const linkType = values[linkTypeKey];

  if (linkType === 'product' && !values[productIdKey]) {
    errors[productIdKey] = 'Product target is required.';
  }

  if (linkType === 'category' && !values[categoryIdKey]) {
    errors[categoryIdKey] = 'Category target is required.';
  }

  if (linkType === 'customUrl') {
    const customUrl = trim(values[customUrlKey] || '');
    if (!customUrl) {
      errors[customUrlKey] = 'Custom URL is required.';
    } else if (!customUrl.startsWith('/') && !customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      errors[customUrlKey] = 'Custom URL must start with /, http://, or https://.';
    }
  }
};

export const validateCarouselForm = (values) => {
  const errors = {};
  if (!trim(values.title)) errors.title = 'Title is required.';
  if (values.isActive && !trim(values.imageUrl)) errors.imageUrl = 'Image URL is required for active slides.';
  if (!trim(values.primaryButtonLabel)) errors.primaryButtonLabel = 'Button label is required.';
  validateLinkTarget(values, errors);
  return errors;
};

const normalizedLinkTarget = (values, prefix = '') => {
  const linkTypeKey = targetField(prefix, 'linkType');
  const productIdKey = targetField(prefix, 'productId');
  const categoryIdKey = targetField(prefix, 'categoryId');
  const customUrlKey = targetField(prefix, 'customUrl');
  const linkType = values[linkTypeKey];

  return {
    [linkTypeKey]: linkType,
    [productIdKey]: linkType === 'product' ? values[productIdKey] : null,
    [categoryIdKey]: linkType === 'category' ? values[categoryIdKey] : null,
    [customUrlKey]: linkType === 'customUrl' ? trim(values[customUrlKey] || '') : null,
  };
};

const hasFeaturedCardInput = (values) => (
  Boolean(
    trim(values.featuredTitle || '') ||
    trim(values.featuredDescription || '') ||
    trim(values.featuredImageUrl || '') ||
    trim(values.featuredLinkLabel || '') ||
    values.featuredProductId ||
    values.featuredCategoryId ||
    trim(values.featuredCustomUrl || '')
  )
);

export const createCarouselPayload = (values) => ({
  title: trim(values.title),
  description: trim(values.description || ''),
  imageUrl: trim(values.imageUrl || ''),
  primaryButtonLabel: trim(values.primaryButtonLabel),
  ...normalizedLinkTarget(values),
  sortOrder: asNumber(values.sortOrder),
  isActive: values.isActive !== false,
});

export const getNavigationFormValues = (item) => (
  item
    ? {
        ...EMPTY_NAVIGATION_FORM,
        label: item.label || '',
        description: item.description || '',
        itemType: item.itemType || 'link',
        parentId: item.parentId || '',
        icon: item.icon || 'info',
        linkType: item.linkType || item.linkTarget?.type || 'product',
        productId: item.productId || item.linkTarget?.productId || '',
        categoryId: item.categoryId || item.linkTarget?.categoryId || '',
        customUrl: item.customUrl || item.linkTarget?.customUrl || '',
        featuredTitle: item.featuredTitle || item.featured?.title || '',
        featuredDescription: item.featuredDescription || item.featured?.description || '',
        featuredImageUrl: item.featuredImageUrl || item.featured?.imageUrl || '',
        featuredLinkLabel: item.featuredLinkLabel || item.featured?.linkLabel || '',
        featuredLinkType: item.featuredLinkType || item.featured?.linkTarget?.type || 'customUrl',
        featuredProductId: item.featuredProductId || item.featured?.linkTarget?.productId || '',
        featuredCategoryId: item.featuredCategoryId || item.featured?.linkTarget?.categoryId || '',
        featuredCustomUrl: item.featuredCustomUrl || item.featured?.linkTarget?.customUrl || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive !== false,
      }
    : EMPTY_NAVIGATION_FORM
);

export const validateNavigationForm = (values) => {
  const errors = {};
  if (!trim(values.label)) errors.label = 'Label is required.';
  const isTopLevelMegaMenu = values.itemType === 'mega_menu' && !values.parentId;
  if (!isTopLevelMegaMenu) validateLinkTarget(values, errors);
  if (trim(values.featuredLinkLabel || '') || trim(values.featuredTitle || '')) {
    validateLinkTarget(values, errors, 'featured');
  }
  return errors;
};

export const createNavigationPayload = (values) => {
  const isTopLevelMegaMenu = values.itemType === 'mega_menu' && !values.parentId;
  const hasFeatured = hasFeaturedCardInput(values);
  const linkTarget = isTopLevelMegaMenu
    ? { linkType: null, productId: null, categoryId: null, customUrl: null }
    : normalizedLinkTarget(values);
  const featuredTarget = hasFeatured
    ? normalizedLinkTarget(values, 'featured')
    : {
        featuredLinkType: null,
        featuredProductId: null,
        featuredCategoryId: null,
        featuredCustomUrl: null,
      };

  return {
    label: trim(values.label),
    description: trim(values.description || ''),
    itemType: values.itemType,
    parentId: values.parentId || null,
    icon: values.icon || '',
    ...linkTarget,
    featuredTitle: trim(values.featuredTitle || ''),
    featuredDescription: trim(values.featuredDescription || ''),
    featuredImageUrl: trim(values.featuredImageUrl || ''),
    featuredLinkLabel: trim(values.featuredLinkLabel || ''),
    ...featuredTarget,
    sortOrder: asNumber(values.sortOrder),
    isActive: values.isActive !== false,
  };
};
