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
import { validateAddress } from '../../utils/addressValidation';
import VietnamAddressFields from '../address/VietnamAddressFields';
import {
  addressFromUser,
  hasLegacyAddress,
  toAddressPayload
} from '../address/addressFormUtils';

const getProfileValues = (user) => ({
  username: user?.username || '',
  fullName: user?.fullName || '',
  phone: user?.phone ?? '',
  address: addressFromUser(user)
});

const createUserProfilePayload = (values) => ({
  username: values.username.trim(),
  fullName: values.fullName.trim(),
  phone: values.phone,
  address: toAddressPayload(values.address)
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
  const [addressErrors, setAddressErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextValues = getProfileValues(user);
    const phoneError = isOpen ? validatePhone(nextValues.phone) : null;
    setValues(nextValues);
    setError('');
    setPhoneStatus(phoneError ? { type: 'error', message: phoneError } : null);
    setAddressErrors({});
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

  const requiresAddressSelection = hasLegacyAddress(user);

  const updateAddress = (address) => {
    setValues((current) => ({ ...current, address }));
    if (Object.keys(addressErrors).length > 0) {
      setAddressErrors(validateAddress(address, { required: requiresAddressSelection }));
    }
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const phoneError = validatePhone(values.phone);
    setPhoneStatus(phoneError ? { type: 'error', message: phoneError } : null);
    const nextAddressErrors = validateAddress(values.address, {
      required: requiresAddressSelection
    });
    setAddressErrors(nextAddressErrors);
    if (phoneError || Object.keys(nextAddressErrors).length > 0) {
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
                {requiresAddressSelection && (
                  <div role="status">
                    <p>
                      Địa chỉ cũ: {typeof user?.address === 'string' ? user.address : ''}
                    </p>
                    <p>
                      Vui lòng chọn lại Tỉnh/Thành phố, Phường/Xã, Đường/Phố và nhập số nhà/ngõ/ngách hoặc thông tin chi tiết trước khi lưu.
                    </p>
                  </div>
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
                </FormLayout>
                <VietnamAddressFields
                  value={values.address}
                  onChange={updateAddress}
                  onBlur={() => setAddressErrors(validateAddress(values.address, {
                    required: requiresAddressSelection
                  }))}
                  errors={addressErrors}
                  required={requiresAddressSelection}
                  disabled={isSubmitting}
                  idPrefix={`${formId}-address`}
                />
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
