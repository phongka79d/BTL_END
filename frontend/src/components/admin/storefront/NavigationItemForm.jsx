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
    () => parentOptions
      .filter((parent) => parent.id !== item?.id)
      .map((parent) => ({
        label: parent.label,
        value: parent.id,
      })),
    [item?.id, parentOptions]
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
      setSubmitError(error?.message || 'Không thể lưu mục điều hướng.');
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
            title={item?.id ? 'Chỉnh sửa mục điều hướng' : 'Tạo mục điều hướng'}
            subtitle="Các mục đang kích hoạt sẽ được xuất bản ngay lập tức."
            onOpenChange={onOpenChange}
            hasDivider
          />
        )}
        content={(
          <LayoutContent isScrollable>
            <form id={formId} onSubmit={handleSubmit}>
              <VStack gap={4}>
                {submitError && <Alert title="Không thể lưu mục điều hướng" description={submitError} />}
                <FormLayout>
                  <Selector
                    label="Loại mục"
                    options={NAV_ITEM_TYPE_OPTIONS}
                    value={values.itemType}
                    onChange={(value) => updateField('itemType', value)}
                    width="100%"
                    isDisabled={Boolean(values.parentId)}
                  />
                  <Selector
                    label="Mega menu cha"
                    options={parentSelectorOptions}
                    value={values.parentId || undefined}
                    onChange={(value) => updateField('parentId', value || '')}
                    placeholder="Mục cấp cao nhất"
                    width="100%"
                  />
                  <TextInput
                    label="Nhãn"
                    value={values.label}
                    onChange={(value) => updateField('label', value)}
                    status={fieldStatus(errors.label)}
                    isRequired
                    width="100%"
                  />
                  <TextArea
                    label="Mô tả"
                    value={values.description}
                    onChange={(value) => updateField('description', value)}
                    rows={3}
                    isOptional
                    width="100%"
                  />
                  <Selector
                    label="Biểu tượng"
                    options={NAV_ICON_OPTIONS}
                    value={values.icon}
                    onChange={(value) => updateField('icon', value)}
                    width="100%"
                  />
                  <NumberInput
                    label="Thứ tự sắp xếp"
                    value={values.sortOrder}
                    onChange={(value) => updateField('sortOrder', value)}
                    step={1}
                    isIntegerOnly
                    width="100%"
                  />
                  <Switch
                    label="Kích hoạt"
                    value={values.isActive}
                    onChange={(checked) => updateField('isActive', checked)}
                  />
                </FormLayout>
                {!isTopLevelMegaMenu && (
                  <LinkTargetFields
                    categories={categories}
                    errors={errors}
                    updateField={updateField}
                    values={values}
                  />
                )}
                {isTopLevelMegaMenu && (
                  <VStack gap={4}>
                    <TextInput label="Tiêu đề nổi bật" value={values.featuredTitle} onChange={(value) => updateField('featuredTitle', value)} width="100%" />
                    <TextArea label="Mô tả nổi bật" value={values.featuredDescription} onChange={(value) => updateField('featuredDescription', value)} rows={3} isOptional width="100%" />
                    <TextInput label="URL hình ảnh nổi bật" value={values.featuredImageUrl} onChange={(value) => updateField('featuredImageUrl', value)} width="100%" />
                    <TextInput label="Nhãn liên kết nổi bật" value={values.featuredLinkLabel} onChange={(value) => updateField('featuredLinkLabel', value)} width="100%" />
                    <LinkTargetFields
                      categories={categories}
                      errors={errors}
                      fieldPrefix="featured"
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
              <Button label="Hủy" variant="secondary" onClick={() => onOpenChange(false)} isDisabled={isSubmitting} />
              <Button label={item?.id ? 'Lưu thay đổi' : 'Tạo mục điều hướng'} type="submit" form={formId} variant="primary" isLoading={isSubmitting} />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default NavigationItemForm;
