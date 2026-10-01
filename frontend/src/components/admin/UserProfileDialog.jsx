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
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../common/Alert';
import { validatePhone } from '../../utils/phoneValidation';

const getProfileValues = (user) => ({
  username: user?.username || '',
  fullName: user?.fullName || '',
  phone: user?.phone ?? '',
  address: user?.address || '',
});

const createUserProfilePayload = (values) => ({
  username: values.username.trim(),
  fullName: values.fullName.trim(),
  phone: values.phone,
  address: values.address.trim(),
});

export const UserProfileDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  user
}) => {
  const formId = useId();
  const [values, setValues] = useState(() => getProfileValues(user));
  const [error, setError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const nextValues = getProfileValues(user);
      const phoneError = validatePhone(nextValues.phone);
      setValues(nextValues);
      setError('');
      setPhoneStatus(phoneError ? { type: 'error', message: phoneError } : null);
    }
  }, [isOpen, user]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));

    if (field === 'phone') {
      const phoneError = validatePhone(value);
      setPhoneStatus(phoneError ? { type: 'error', message: phoneError } : null);
      if (!phoneError) {
        setError('');
      }
      return;
    }

    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const phoneError = validatePhone(values.phone);
    if (phoneError) {
      setPhoneStatus({ type: 'error', message: phoneError });
      return;
    }

    const payload = createUserProfilePayload(values);

    if (!payload.username) {
      setError('Tên người dùng không được để trống');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError?.message || 'Không thể lưu hồ sơ người dùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form">
      <Layout
        header={(
          <DialogHeader
            title="Chỉnh sửa hồ sơ"
            subtitle={user?.email || 'Cập nhật thông tin tài khoản cơ bản.'}
            onOpenChange={onOpenChange}
            hasDivider
          />
        )}
        content={(
          <LayoutContent isScrollable>
            <form id={formId} onSubmit={handleSubmit}>
              <VStack gap={4}>
                {error && (
                  <Alert
                    title="Không thể lưu hồ sơ"
                    description={error}
                  />
                )}
                <FormLayout>
                  <TextInput
                    label="Tên người dùng"
                    value={values.username}
                    onChange={(value) => updateField('username', value)}
                    isRequired
                    width="100%"
                  />
                  <TextInput
                    label="Họ và tên"
                    value={values.fullName}
                    onChange={(value) => updateField('fullName', value)}
                    isOptional
                    width="100%"
                  />
                  <TextInput
                    label="Số điện thoại"
                    value={values.phone}
                    onChange={(value) => updateField('phone', value)}
                    status={phoneStatus}
                    inputMode="numeric"
                    isOptional
                    width="100%"
                  />
                  <TextInput
                    label="Địa chỉ"
                    value={values.address}
                    onChange={(value) => updateField('address', value)}
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
                label="Hủy"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                isDisabled={isSubmitting}
              />
              <Button
                label="Lưu hồ sơ"
                type="submit"
                form={formId}
                isDisabled={isSubmitting || Boolean(validatePhone(values.phone))}
                isLoading={isSubmitting}
              />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default UserProfileDialog;
