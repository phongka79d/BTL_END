import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  FormLayout,
  Grid,
  Heading,
  HStack,
  Text,
  TextInput,
  VStack
} from '@astryxdesign/core';
import { userApi } from '../api/userApi';
import Alert from '../components/common/Alert';
import ChangePasswordPanel from '../components/profile/ChangePasswordPanel';
import VietnamAddressFields from '../components/address/VietnamAddressFields.jsx';
import {
  EMPTY_ADDRESS,
  addressFromUser,
  hasLegacyAddress,
  toAddressPayload
} from '../components/address/addressFormUtils.js';
import { useAuth } from '../contexts/AuthContext';
import { validateAddress } from '../utils/addressValidation.js';
import { validatePhone } from '../utils/phoneValidation.js';

const EMPTY_PROFILE = {
  username: '',
  fullName: '',
  phone: '',
  address: EMPTY_ADDRESS,
};

const profileIconStyle = {
  width: 'var(--spacing-4)',
  height: 'var(--spacing-4)',
  color: 'var(--color-text-secondary)',
  flexShrink: 0,
};

const EmailIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={profileIconStyle}>
    <path d="M4 6h16v12H4z" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const RoleIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={profileIconStyle}>
    <path d="M12 3 5 6v5c0 4.2 2.9 8.1 7 10 4.1-1.9 7-5.8 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const PhoneIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={profileIconStyle}>
    <path d="M6.5 4h3l1.5 4-2 1.2a11 11 0 0 0 5.8 5.8l1.2-2 4 1.5v3A2.5 2.5 0 0 1 17.2 20 13.2 13.2 0 0 1 4 6.8 2.5 2.5 0 0 1 6.5 4Z" />
  </svg>
);

const toProfileValues = (profile) => ({
  username: profile?.username || '',
  fullName: profile?.fullName || '',
  phone: profile?.phone ?? '',
  address: addressFromUser(profile),
});

const toProfilePayload = (values) => ({
  username: values.username.trim(),
  fullName: values.fullName.trim(),
  phone: values.phone,
  address: toAddressPayload(values.address),
});

const getAccountName = (profile, fallbackUser) => (
  profile?.fullName ||
  profile?.username ||
  fallbackUser?.fullName ||
  fallbackUser?.username ||
  fallbackUser?.email ||
  'Tài khoản của bạn'
);

const ProfileInfoRow = ({ icon, label, children }) => (
  <HStack gap={3} align="center" wrap="wrap" width="100%">
    {icon}
    <VStack gap={0}>
      <Text weight="semibold">{label}</Text>
      {children}
    </VStack>
  </HStack>
);


export const ProfileView = () => {
  const navigate = useNavigate();
  const { user, isAdmin, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState(EMPTY_PROFILE);
  const [addressErrors, setAddressErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    setFeedback(null);

    try {
      const response = await userApi.getProfile();
      const nextProfile = response?.data?.user || null;
      const nextValues = toProfileValues(nextProfile);
      const phoneError = validatePhone(nextValues.phone);
      setProfile(nextProfile);
      setValues(nextValues);
      setPhoneStatus(phoneError ? { type: 'error', message: phoneError } : null);
      setUsernameStatus(null);
      setAddressErrors({});
    } catch (error) {
      setProfile(null);
      setLoadError(error?.message || 'Không thể tải hồ sơ của bạn.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const accountName = useMemo(() => getAccountName(profile, user), [profile, user]);
  const requiresAddressSelection = hasLegacyAddress(profile);
  const updateField = (field, value) => {

    if (field === 'address') {
      setAddressErrors((current) => (
        Object.keys(current).length > 0
          ? validateAddress(value, { required: requiresAddressSelection })
          : current
      ));
    }
    setValues((current) => ({ ...current, [field]: value }));

    if (field === 'phone') {
      const phoneError = validatePhone(value);
      setPhoneStatus(phoneError ? { type: 'error', message: phoneError } : null);
      if (!phoneError) {
        setFeedback(null);
      }
      return;
    }

    if (field === 'username' && usernameStatus) {
      setUsernameStatus(null);
    }
    setFeedback(null);
  };

  const resetForm = () => {
    setValues(toProfileValues(profile));
    setUsernameStatus(null);
    setPhoneStatus(null);
    setAddressErrors({});
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextAddressErrors = validateAddress(values.address, {
      required: requiresAddressSelection
    });
    setAddressErrors(nextAddressErrors);
    if (Object.keys(nextAddressErrors).length > 0) {
      return;
    }

    const payload = toProfilePayload(values);
    const phoneError = validatePhone(values.phone);
    if (phoneError) {
      setPhoneStatus({ type: 'error', message: phoneError });
      return;
    }


    if (!payload.username) {
      setUsernameStatus({ type: 'error', message: 'Tên người dùng không được để trống' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await userApi.updateProfile(payload);
      const savedProfile = response?.data?.user;
      if (savedProfile) {
        setProfile(savedProfile);
        updateUser(savedProfile);
        setValues(toProfileValues(savedProfile));
      }
      setFeedback({
        title: 'Đã lưu hồ sơ',
        description: 'Thông tin tài khoản của bạn đã được cập nhật.',
        status: 'success',
      });
    } catch (error) {
      setFeedback({
        title: 'Không thể lưu hồ sơ',
        description: error?.message || 'Không thể cập nhật hồ sơ của bạn.',
        status: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card padding={4}>
        <VStack gap={2}>
          <Text weight="semibold">Đang tải hồ sơ</Text>
          <Text color="secondary">Đang tải thông tin tài khoản của bạn.</Text>
        </VStack>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Alert
        title="Không thể tải hồ sơ"
        description={loadError}
        actionLabel="Thử lại"
        onAction={loadProfile}
      />
    );
  }

  return (
    <VStack gap={6} width="100%">
      <HStack gap={4} align="center" justify="between" wrap="wrap" width="100%">
        <VStack gap={1}>
          <Heading level={1}>Hồ sơ của tôi</Heading>
          <Text color="secondary">
            Quản lý thông tin tài khoản dùng cho thanh toán và hiển thị tài khoản.
          </Text>
        </VStack>
        <HStack gap={2} wrap="wrap">
          <Button
            label="Lịch sử đơn hàng"
            variant="secondary"
            onClick={() => navigate('/orders')}
          />
          {isAdmin && (
            <Button
            label="Bảng điều khiển quản trị"
              variant="secondary"
              onClick={() => navigate('/admin')}
            />
          )}
        </HStack>
      </HStack>

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
          status={feedback.status}
        />
      )}

      <Grid columns={{ minWidth: 320, max: 2 }} gap={4} style={{ alignItems: 'start' }}>
        <VStack gap={4}>
          <Card padding={4}>
            <VStack gap={4}>
              <HStack justify="center" width="100%">
                <Avatar name={accountName} size="large" />
              </HStack>
              <VStack gap={1}>
                <Heading level={2}>Tổng quan tài khoản</Heading>
                <Text color="secondary">{accountName}</Text>
              </VStack>
              <VStack gap={4}>
                <ProfileInfoRow icon={<EmailIcon />} label="Email">
                  <Text color="secondary">{profile?.email || user?.email || 'Không có thông tin'}</Text>
                </ProfileInfoRow>
                <ProfileInfoRow icon={<RoleIcon />} label="Vai trò">
                  <Badge label={profile?.role || user?.role || 'customer'} />
                </ProfileInfoRow>
                {profile?.isBlocked && (
                  <Alert
                    title="Tài khoản bị khóa"
                    description="Tài khoản này không thể thực hiện các yêu cầu được bảo vệ cho đến khi quản trị viên mở khóa."
                  />
                )}
              </VStack>
            </VStack>
          </Card>

          <ChangePasswordPanel />
        </VStack>

        <Card padding={4}>
          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={2}>Thông tin hồ sơ</Heading>
                <Text color="secondary">
                  Cập nhật tên hiển thị, số điện thoại liên hệ và địa chỉ giao hàng.
                </Text>
              </VStack>

              <FormLayout>
                <TextInput
                  label="Tên người dùng"
                  value={values.username}
                  onChange={(value) => updateField('username', value)}
                  status={usernameStatus}
                  isRequired
                  isDisabled={isSaving}
                  width="100%"
                />
                <TextInput
                  label="Họ và tên"
                  value={values.fullName}
                  onChange={(value) => updateField('fullName', value)}
                  isOptional
                  isDisabled={isSaving}
                  width="100%"
                />
                <TextInput
                  label="Số điện thoại"
                  type="text"
                  startIcon={<PhoneIcon />}
                  value={values.phone}
                  status={phoneStatus}
                  inputMode="numeric"
                  onChange={(value) => updateField('phone', value)}
                  isOptional
                  isDisabled={isSaving}
                  width="100%"
                />
              </FormLayout>

              {requiresAddressSelection && (
                <Alert
                  title="Địa chỉ cũ cần xác nhận"
                  description={`Địa chỉ "${profile.address}" được lưu dạng văn bản tự do và chưa được xác minh. Hãy chọn Tỉnh/Thành phố, Phường/Xã và nhập số nhà, tên đường bên dưới trước khi lưu.`}
                />
              )}
              <VietnamAddressFields
                value={values.address}
                onChange={(value) => updateField('address', value)}
                onBlur={() => setAddressErrors(validateAddress(values.address, {
                  required: requiresAddressSelection
                }))}
                errors={addressErrors}
                disabled={isSaving}
                required={requiresAddressSelection}
                idPrefix="profile-address"
              />

              <HStack gap={3} justify="end" wrap="wrap" style={{ paddingTop: 'var(--spacing-2)' }}>
                <Button
                  label="Đặt lại"
                  variant="ghost"
                  onClick={resetForm}
                  isDisabled={isSaving}
                />
                <Button
                  label="Lưu hồ sơ"
                  type="submit"
                  variant="primary"
                  isDisabled={isSaving || Boolean(validatePhone(values.phone))}
                  isLoading={isSaving}
                />
              </HStack>
            </VStack>
          </form>
        </Card>
      </Grid>
    </VStack>
  );
};

export default ProfileView;
