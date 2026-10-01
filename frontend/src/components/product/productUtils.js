const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

export const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#e9ecef"/><rect x="120" y="120" width="560" height="360" rx="24" fill="#d0d7de"/><path d="M200 390h400" stroke="#b0b7c3" stroke-width="24" stroke-linecap="round"/><circle cx="280" cy="250" r="36" fill="#b0b7c3"/><path d="M370 278l62-74 62 74" fill="none" stroke="#b0b7c3" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  );

export const getProductImageSrc = (imageUrl) => {
  const normalizedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';

  return normalizedImageUrl || FALLBACK_PRODUCT_IMAGE;
};

export const handleProductImageError = (event) => {
  const imageElement = event?.currentTarget;

  if (!imageElement || imageElement.getAttribute('src') === FALLBACK_PRODUCT_IMAGE) {
    return;
  }

  imageElement.src = FALLBACK_PRODUCT_IMAGE;
};

export const formatPrice = (value) => {
  const numericValue = Number(value ?? 0);

  if (Number.isNaN(numericValue)) {
    return currencyFormatter.format(0);
  }

  return currencyFormatter.format(numericValue);
};

export const getStockLabel = (quantity) => {
  const stock = Number(quantity ?? 0);

  if (stock <= 0) {
    return 'Hết hàng';
  }

  if (stock <= 5) {
    return 'Sắp hết hàng';
  }

  return 'Còn hàng';
};

export const getStockVariant = (quantity) => {
  const stock = Number(quantity ?? 0);

  if (stock <= 0) {
    return 'error';
  }

  if (stock <= 5) {
    return 'warning';
  }

  return 'success';
};

export const truncateText = (value, limit = 120) => {
  if (!value) {
    return '';
  }

  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1).trimEnd()}…`;
};
