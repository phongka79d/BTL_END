import React, { useEffect, useId, useMemo, useState } from 'react';
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
  Switch,
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../../common/Alert';
import LinkTargetFields from './LinkTargetFields';
import {
  NAV_ICON_OPTIONS,
  NAV_ITEM_TYPE_OPTIONS,
  createNavigationPayload,
  getNavigationFormValues,
  validateNavigationForm
} from './storefrontFormUtils';

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

export const NavigationItemForm = ({
  categories,
  isOpen,
  item,
  onOpenChange,
  onSubmit,
  parentOptions,
  products,
}) => {
  const formId = useId();
  const [values, setValues] = useState(() => getNavigationFormValues(item));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(getNavigationFormValues(item));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, item]);

  const parentSelectorOptions = useMemo(
    () => parentOptions.map((parent) => ({
      label: parent.label,
      value: parent.id,
    })),
    [parentOptions]
  );

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateNavigationForm(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(createNavigationPayload(values));
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error?.message || 'Unable to save the navigation item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTopLevelMegaMenu = values.itemType === 'mega_menu' && !values.parentId;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={760}>
      <Layout
        header={(
          <DialogHeader
            title={item?.id ? 'Edit navigation item' : 'Create navigation item'}
            subtitle="Saved active items publish immediately."
            onOpenChange={onOpenChange}
            hasDivider
          />
        )}
        content={(
          <LayoutContent isScrollable>
            <form id={formId} onSubmit={handleSubmit}>
              <VStack gap={4}>
                {submitError && <Alert title="Unable to save navigation item" description={submitError} />}
                <FormLayout>
                  <Selector
                    label="Item type"
                    options={NAV_ITEM_TYPE_OPTIONS}
                    value={values.itemType}
                    onChange={(value) => updateField('itemType', value)}
                    width="100%"
                    isDisabled={Boolean(values.parentId)}
                  />
                  <Selector
                    label="Parent mega menu"
                    options={parentSelectorOptions}
                    value={values.parentId || undefined}
                    onChange={(value) => updateField('parentId', value || '')}
                    placeholder="Top-level item"
                    width="100%"
                  />
                  <TextInput
                    label="Label"
                    value={values.label}
                    onChange={(value) => updateField('label', value)}
                    status={fieldStatus(errors.label)}
                    isRequired
                    width="100%"
                  />
                  <TextArea
                    label="Description"
                    value={values.description}
                    onChange={(value) => updateField('description', value)}
                    rows={3}
                    isOptional
                    width="100%"
                  />
                  <Selector
                    label="Icon"
                    options={NAV_ICON_OPTIONS}
                    value={values.icon}
                    onChange={(value) => updateField('icon', value)}
                    width="100%"
                  />
                  <NumberInput
                    label="Sort order"
                    value={values.sortOrder}
                    onChange={(value) => updateField('sortOrder', value)}
                    step={1}
                    isIntegerOnly
                    width="100%"
                  />
                  <Switch
                    label="Active"
                    value={values.isActive}
                    onChange={(checked) => updateField('isActive', checked)}
                  />
                </FormLayout>
                {!isTopLevelMegaMenu && (
                  <LinkTargetFields
                    categories={categories}
                    errors={errors}
                    products={products}
                    updateField={updateField}
                    values={values}
                  />
                )}
                {isTopLevelMegaMenu && (
                  <VStack gap={4}>
                    <TextInput label="Featured title" value={values.featuredTitle} onChange={(value) => updateField('featuredTitle', value)} width="100%" />
                    <TextArea label="Featured description" value={values.featuredDescription} onChange={(value) => updateField('featuredDescription', value)} rows={3} isOptional width="100%" />
                    <TextInput label="Featured image URL" value={values.featuredImageUrl} onChange={(value) => updateField('featuredImageUrl', value)} width="100%" />
                    <TextInput label="Featured link label" value={values.featuredLinkLabel} onChange={(value) => updateField('featuredLinkLabel', value)} width="100%" />
                    <LinkTargetFields
                      categories={categories}
                      errors={errors}
                      fieldPrefix="featured"
                      products={products}
                      updateField={updateField}
                      values={values}
                    />
                  </VStack>
                )}
              </VStack>
            </form>
          </LayoutContent>
        )}
        footer={(
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} isDisabled={isSubmitting} />
              <Button label={item?.id ? 'Save changes' : 'Create navigation item'} type="submit" form={formId} variant="primary" isLoading={isSubmitting} />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default NavigationItemForm;
