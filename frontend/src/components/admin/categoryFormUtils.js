export const EMPTY_CATEGORY_FORM = {
  name: '',
  description: ''
};

export const getCategoryFormValues = (category) => (
  category
    ? {
        name: category.name || '',
        description: category.description || ''
      }
    : EMPTY_CATEGORY_FORM
);

export const validateCategoryForm = (values) => {
  if (!values.name?.trim()) {
    return { name: 'Vui lòng nhập tên danh mục.' };
  }

  return {};
};

export const createCategoryPayload = (values) => ({
  name: values.name.trim(),
  description: values.description?.trim() || ''
});
