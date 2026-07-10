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
  Switch,
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../../common/Alert';
import LinkTargetFields from './LinkTargetFields';
import {
  createCarouselPayload,
  getCarouselFormValues,
  validateCarouselForm
} from './storefrontFormUtils';

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

export const CarouselSlideForm = ({
  categories,
  isOpen,
  onOpenChange,
  onSubmit,
  slide,
}) => {
  const formId = useId();
  const [values, setValues] = useState(() => getCarouselFormValues(slide));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(getCarouselFormValues(slide));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, slide]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCarouselForm(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(createCarouselPayload(values));
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error?.message || 'Không thể lưu slide băng chuyền.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={720}>
      <Layout
        header={(
          <DialogHeader
            title={slide ? 'Chỉnh sửa slide băng chuyền' : 'Tạo slide băng chuyền'}
            subtitle="Các slide đang kích hoạt sẽ được xuất bản ngay lập tức."
            onOpenChange={onOpenChange}
            hasDivider
          />
        )}
        content={(
          <LayoutContent isScrollable>
            <form id={formId} onSubmit={handleSubmit}>
              <VStack gap={4}>
                {submitError && <Alert title="Không thể lưu slide" description={submitError} />}
                <FormLayout>
                  <TextInput label="Tiêu đề" value={values.title} onChange={(value) => updateField('title', value)} status={fieldStatus(errors.title)} isRequired width="100%" />
                  <TextArea label="Mô tả" value={values.description} onChange={(value) => updateField('description', value)} rows={3} isOptional width="100%" />
                  <TextInput label="URL hình ảnh" value={values.imageUrl} onChange={(value) => updateField('imageUrl', value)} status={fieldStatus(errors.imageUrl)} placeholder="https://example.com/hero.jpg" isRequired={values.isActive} width="100%" />
                  <TextInput label="Nhãn nút" value={values.primaryButtonLabel} onChange={(value) => updateField('primaryButtonLabel', value)} status={fieldStatus(errors.primaryButtonLabel)} isRequired width="100%" />
                  <NumberInput label="Thứ tự sắp xếp" value={values.sortOrder} onChange={(value) => updateField('sortOrder', value)} step={1} isIntegerOnly width="100%" />
                  <Switch label="Kích hoạt" value={values.isActive} onChange={(checked) => updateField('isActive', checked)} />
                </FormLayout>
                <LinkTargetFields
                  categories={categories}
                  errors={errors}
                  updateField={updateField}
                  values={values}
                />
              </VStack>
            </form>
          </LayoutContent>
        )}
        footer={(
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end">
              <Button label="Hủy" variant="secondary" onClick={() => onOpenChange(false)} isDisabled={isSubmitting} />
              <Button label={slide ? 'Lưu thay đổi' : 'Tạo slide'} type="submit" form={formId} variant="primary" isLoading={isSubmitting} />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default CarouselSlideForm;
