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
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../common/Alert';
import {
  createCategoryPayload,
  getCategoryFormValues,
  validateCategoryForm
} from './categoryFormUtils';

export const CategoryForm = ({
  category,
  isOpen,
  onOpenChange,
  onSubmit
}) => {
  const formId = useId();
  const [values, setValues] = useState(() => getCategoryFormValues(category));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(getCategoryFormValues(category));
      setErrors({});
      setSubmitError('');
    }
  }, [category, isOpen]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCategoryForm(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(createCategoryPayload(values));
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error?.message || 'Unable to save the category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="form"
    >
      <Layout
        header={(
          <DialogHeader
            title={category ? 'Edit category' : 'Create category'}
            subtitle="Category names must be unique."
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
                    title="Unable to save category"
                    description={submitError}
                  />
                )}
                <FormLayout>
                  <TextInput
                    label="Category name"
                    value={values.name}
                    onChange={(value) => updateField('name', value)}
                    status={
                      errors.name
                        ? { type: 'error', message: errors.name }
                        : undefined
                    }
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
                label={category ? 'Save changes' : 'Create category'}
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

export default CategoryForm;
