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
  Selector,
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../common/Alert';
import { validatePhone } from '../../utils/phoneValidation';
import { validateAddress } from '../../utils/addressValidation';
import VietnamAddressFields from '../address/VietnamAddressFields';
import { EMPTY_ADDRESS, toAddressPayload } from '../address/addressFormUtils';
import { validatePasswordPolicy } from '../../utils/passwordPolicy';

const EMPTY_VALUES = {
  username: '',
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'staff',
  address: EMPTY_ADDRESS
};

const createEmptyValues = () => ({
  ...EMPTY_VALUES,
  address: { ...EMPTY_ADDRESS }
});
const ROLE_OPTIONS = [
  { label: 'Nhân viên vận hành', value: 'staff' },
  { label: 'Quản trị viên', value: 'admin' },
  { label: 'Khách hàng', value: 'customer' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * UserCreateDialog
 *
 * Biểu mẫu tạo tài khoản người dùng / nhân viên mới dành cho quản trị viên.
 * Gọi POST /api/admin/users — backend sẽ băm mật khẩu và gửi email thông tin đăng nhập.
 */
export const UserCreateDialog = ({ isOpen, onOpenChange, onSubmit }) => {
  const formId = useId();
  const [values, setValues] = useState(createEmptyValues);
  const [error, setError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(createEmptyValues());
    setError('');
    setPhoneStatus(null);
    setAddressErrors({});
  }, [isOpen]);

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

  const updateAddress = (address) => {
    setValues((current) => ({ ...current, address }));
    if (Object.keys(addressErrors).length > 0) {
      setAddressErrors(validateAddress(address));
    }
    setError('');
  };

  const buildPayload = () => ({
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password,
    fullName: values.fullName.trim(),
    phone: values.phone,
    role: values.role,
    address: toAddressPayload(values.address)
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const phoneError = validatePhone(values.phone);
    if (phoneError) {
      setPhoneStatus({ type: 'error', message: phoneError });
      return;
    }
    const nextAddressErrors = validateAddress(values.address);
    setAddressErrors(nextAddressErrors);
    if (Object.keys(nextAddressErrors).length > 0) {
      return;
    }

    const payload = buildPayload();

    if (!payload.username) {
      setError('Tên người dùng không được để trống');
      return;
    }
    if (!EMAIL_PATTERN.test(payload.email)) {
      setError('Định dạng email không hợp lệ');
      return;
    }
    const passwordPolicy = validatePasswordPolicy(payload.password);
    if (!passwordPolicy.isValid) {
      setError(passwordPolicy.message);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError?.message || 'Không thể tạo tài khoản người dùng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form">
      <Layout
        header={(
          <DialogHeader
            title="Thêm tài khoản"
            subtitle="Tạo tài khoản nhân viên hoặc quản trị viên mới."
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
                    title="Không thể tạo tài khoản"
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
                    label="Email đăng nhập"
                    value={values.email}
                    onChange={(value) => updateField('email', value)}
                    isRequired
                    width="100%"
                  />
                  <TextInput
                    label="Mật khẩu tạm thời"
                    value={values.password}
                    onChange={(value) => updateField('password', value)}
                    isRequired
                    width="100%"
                  />
                  <Selector
                    label="Vai trò"
                    value={values.role}
                    onChange={(value) => updateField('role', value)}
                    options={ROLE_OPTIONS}
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
                  onBlur={() => setAddressErrors(validateAddress(values.address))}
                  errors={addressErrors}
                  required={false}
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
                label="Tạo tài khoản"
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

export default UserCreateDialog;
