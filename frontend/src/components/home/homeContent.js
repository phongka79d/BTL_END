export const homeProductQuery = {
  page: 1,
  limit: 6
};

export const toCategoryProductCount = (products = []) => {
  return products.reduce((counts, product) => {
    const categoryId = product?.category?.id || product?.categoryId || 'uncategorized';
    counts[categoryId] = (counts[categoryId] || 0) + 1;
    return counts;
  }, {});
};
