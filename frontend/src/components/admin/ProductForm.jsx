import React, { useEffect, useId, useState } from 'react';
import {
  Button,
  Dialog,
  DialogHeader,
  FormLayout,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  NumberInput,
  Selector,
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../common/Alert';
import {
  createProductPayload,
  getProductFormValues,
  validateProductForm
} from './productFormUtils';

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

export const ProductForm = ({
  categories,
  isOpen,
  onOpenChange,
  onSubmit,
  product
}) => {
  const formId = useId();
  const [values, setValues] = useState(() => getProductFormValues(product));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(getProductFormValues(product));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, product]);

  const updateField = (field, value) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors((current) => {
      const fieldError = validateProductForm(nextValues)[field];
      if (fieldError) {
        return { ...current, [field]: fieldError };
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProductForm(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(createProductPayload(values));
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error?.message || 'Không thể lưu sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name
  }));

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
      width={640}
    >
      <Layout
        header={(
          <DialogHeader
            title={product ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm'}
            subtitle="Các trường bắt buộc được kiểm tra tại đây và một lần nữa ở backend."
            onOpenChange={onOpenChange}
            hasDivider
          />
        )}
        content={(
          <LayoutContent isScrollable>
            <form id={formId} onSubmit={handleSubmit}>
              <VStack gap={4}>
                {submitError && (
                  <Alert
                    title="Không thể lưu sản phẩm"
                    description={submitError}
                  />
                )}
                <FormLayout>
                  <TextInput
                    label="Tên sản phẩm"
                    value={values.name}
                    onChange={(value) => updateField('name', value)}
                    status={fieldStatus(errors.name)}
                    isRequired
                    width="100%"
                  />
                  <TextInput
                    label="Thương hiệu"
                    value={values.brand}
                    onChange={(value) => updateField('brand', value)}
                    status={fieldStatus(errors.brand)}
                    isRequired
                    width="100%"
                  />
                  <TextArea
                    label="Mô tả"
                    value={values.description}
                    onChange={(value) => updateField('description', value)}
                    rows={4}
                    isOptional
                    width="100%"
                  />
                  <FormLayout direction="horizontal">
                    <NumberInput
                      label="Giá"
                      value={values.price}
                      onChange={(value) => updateField('price', value)}
                      min={0}
                      step={0.01}
                      hasClear
                      status={fieldStatus(errors.price)}
                      isRequired
                      width="100%"
                    />
                    <TextInput
                      label="Số lượng"
                      value={values.quantity}
                      onChange={(value) => updateField('quantity', value)}
                      inputMode="numeric"
                      status={fieldStatus(errors.quantity)}
                      isRequired
                      width="100%"
                    />
                  </FormLayout>
                  <TextInput
                    label="URL hình ảnh"
                    value={values.imageUrl}
                    onChange={(value) => updateField('imageUrl', value)}
                    placeholder="https://example.com/product.jpg"
                    isOptional
                    width="100%"
                  />
                  <Selector
                    label="Danh mục"
                    options={categoryOptions}
                    value={values.categoryId || undefined}
                    onChange={(value) => updateField('categoryId', value)}
                    placeholder="Chọn danh mục"
                    status={fieldStatus(errors.categoryId)}
                    isRequired
                    width="100%"
                  />
                </FormLayout>
              </VStack>
            </form>
          </LayoutContent>
        )}
        footer={(
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end">
              <Button
                label="Hủy"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                isDisabled={isSubmitting}
              />
              <Button
              label={product ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                type="submit"
                form={formId}
                variant="primary"
                isLoading={isSubmitting}
                isDisabled={isSubmitting || Boolean(errors.quantity)}
              />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default ProductForm;
