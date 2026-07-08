export const resolveStorefrontHref = (linkTarget) => {
  if (!linkTarget) {
    return '/products';
  }

  if (linkTarget.type === 'product' && linkTarget.productId) {
    return `/products/${linkTarget.productId}`;
  }

  if (linkTarget.type === 'category' && linkTarget.categoryId) {
    return `/products?categoryId=${encodeURIComponent(linkTarget.categoryId)}`;
  }

  if (linkTarget.type === 'customUrl' && linkTarget.customUrl) {
    return linkTarget.customUrl;
  }

  return '/products';
};

export const describeLinkTarget = (linkTarget) => {
  if (!linkTarget) {
    return 'No link target';
  }

  if (linkTarget.type === 'product' && linkTarget.productId) {
    return `Product ${linkTarget.productId}`;
  }

  if (linkTarget.type === 'category' && linkTarget.categoryId) {
    return `Category ${linkTarget.categoryId}`;
  }

  if (linkTarget.type === 'customUrl' && linkTarget.customUrl) {
    return linkTarget.customUrl;
  }

  return 'Incomplete link target';
};
