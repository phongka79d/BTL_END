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
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
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
      setSubmitError(error?.message || 'Unable to save the product.');
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
            title={product ? 'Edit product' : 'Create product'}
            subtitle="Required fields are validated here and again by the backend."
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
                    title="Unable to save product"
                    description={submitError}
                  />
                )}
                <FormLayout>
                  <TextInput
                    label="Product name"
                    value={values.name}
                    onChange={(value) => updateField('name', value)}
                    status={fieldStatus(errors.name)}
                    isRequired
                    width="100%"
                  />
                  <TextInput
                    label="Brand"
                    value={values.brand}
                    onChange={(value) => updateField('brand', value)}
                    status={fieldStatus(errors.brand)}
                    isRequired
                    width="100%"
                  />
                  <TextArea
                    label="Description"
                    value={values.description}
                    onChange={(value) => updateField('description', value)}
                    rows={4}
                    isOptional
                    width="100%"
                  />
                  <FormLayout direction="horizontal">
                    <NumberInput
                      label="Price"
                      value={values.price}
                      onChange={(value) => updateField('price', value)}
                      min={0}
                      step={0.01}
                      hasClear
                      status={fieldStatus(errors.price)}
                      isRequired
                      width="100%"
                    />
                    <NumberInput
                      label="Quantity"
                      value={values.quantity}
                      onChange={(value) => updateField('quantity', value)}
                      min={0}
                      step={1}
                      isIntegerOnly
                      hasClear
                      status={fieldStatus(errors.quantity)}
                      isRequired
                      width="100%"
                    />
                  </FormLayout>
                  <TextInput
                    label="Image URL"
                    value={values.imageUrl}
                    onChange={(value) => updateField('imageUrl', value)}
                    placeholder="https://example.com/product.jpg"
                    isOptional
                    width="100%"
                  />
                  <Selector
                    label="Category"
                    options={categoryOptions}
                    value={values.categoryId || undefined}
                    onChange={(value) => updateField('categoryId', value)}
                    placeholder="Select a category"
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
                label="Cancel"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                isDisabled={isSubmitting}
              />
              <Button
                label={product ? 'Save changes' : 'Create product'}
                type="submit"
                form={formId}
                variant="primary"
                isLoading={isSubmitting}
              />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default ProductForm;
