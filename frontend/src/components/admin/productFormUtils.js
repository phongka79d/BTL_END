export const EMPTY_PRODUCT_FORM = {
  name: '',
  brand: '',
  description: '',
  price: null,
  quantity: null,
  imageUrl: '',
  categoryId: ''
};

export const getProductFormValues = (product) => {
  if (!product) {
    return EMPTY_PRODUCT_FORM;
  }

  return {
    name: product.name || '',
    brand: product.brand || '',
    description: product.description || '',
    price: product.price === null || product.price === undefined ? null : Number(product.price),
    quantity: product.quantity === null || product.quantity === undefined ? null : Number(product.quantity),
    imageUrl: product.imageUrl || '',
    categoryId: product.categoryId || product.category?.id || ''
  };
};

export const validateProductForm = (values) => {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Product name is required.';
  }
  if (!values.brand?.trim()) {
    errors.brand = 'Brand is required.';
  }
  if (values.price === '' || values.price === null || values.price === undefined) {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(Number(values.price)) || Number(values.price) < 0) {
    errors.price = 'Price must be a non-negative number.';
  }
  if (values.quantity === '' || values.quantity === null || values.quantity === undefined) {
    errors.quantity = 'Quantity is required.';
  } else if (!Number.isInteger(Number(values.quantity)) || Number(values.quantity) < 0) {
    errors.quantity = 'Quantity must be a non-negative integer.';
  }
  if (!values.categoryId) {
    errors.categoryId = 'Category is required.';
  }

  return errors;
};

export const createProductPayload = (values) => ({
  name: values.name.trim(),
  brand: values.brand.trim(),
  description: values.description?.trim() || '',
  price: Number(values.price),
  quantity: Number(values.quantity),
  imageUrl: values.imageUrl?.trim() || '',
  categoryId: values.categoryId
});
