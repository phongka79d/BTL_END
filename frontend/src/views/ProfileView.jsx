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
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';
import { userApi } from '../api/userApi';
import Alert from '../components/common/Alert';
import ChangePasswordPanel from '../components/profile/ChangePasswordPanel';
import { useAuth } from '../contexts/AuthContext';

const EMPTY_PROFILE = {
  username: '',
  fullName: '',
  phone: '',
  address: '',
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

const AddressIcon = () => (
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={profileIconStyle}>
    <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" />
    <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
  </svg>
);

const toProfileValues = (profile) => ({
  username: profile?.username || '',
  fullName: profile?.fullName || '',
  phone: profile?.phone || '',
  address: profile?.address || '',
});

const toProfilePayload = (values) => ({
  username: values.username.trim(),
  fullName: values.fullName.trim(),
  phone: values.phone.trim(),
  address: values.address.trim(),
});

const getAccountName = (profile, fallbackUser) => (
  profile?.fullName ||
  profile?.username ||
  fallbackUser?.fullName ||
  fallbackUser?.username ||
  fallbackUser?.email ||
  'Your account'
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
  const { user, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [values, setValues] = useState(EMPTY_PROFILE);
  const [usernameStatus, setUsernameStatus] = useState(null);
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
      setProfile(nextProfile);
      setValues(toProfileValues(nextProfile));
      setUsernameStatus(null);
    } catch (error) {
      setProfile(null);
      setLoadError(error?.message || 'Unable to load your profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const accountName = useMemo(() => getAccountName(profile, user), [profile, user]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === 'username' && usernameStatus) {
      setUsernameStatus(null);
    }
    setFeedback(null);
  };

  const resetForm = () => {
    setValues(toProfileValues(profile));
    setUsernameStatus(null);
    setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = toProfilePayload(values);

    if (!payload.username) {
      setUsernameStatus({ type: 'error', message: 'Username cannot be empty' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await userApi.updateProfile(payload);
      const updatedProfile = response?.data?.user || { ...profile, ...payload };
      setProfile(updatedProfile);
      setValues(toProfileValues(updatedProfile));
      setFeedback({
        title: 'Profile saved',
        description: 'Your account details were updated.',
        status: 'success',
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to save profile',
        description: error?.message || 'Your profile could not be updated.',
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
          <Text weight="semibold">Loading profile</Text>
          <Text color="secondary">Fetching your account details.</Text>
        </VStack>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Alert
        title="Unable to load profile"
        description={loadError}
        actionLabel="Retry"
        onAction={loadProfile}
      />
    );
  }

  return (
    <VStack gap={6} width="100%">
      <HStack gap={4} align="center" justify="between" wrap="wrap" width="100%">
        <VStack gap={1}>
          <Heading level={1}>My profile</Heading>
          <Text color="secondary">
            Manage account details used for checkout and account display.
          </Text>
        </VStack>
        <HStack gap={2} wrap="wrap">
          <Button
            label="Order history"
            variant="secondary"
            onClick={() => navigate('/orders')}
          />
          {isAdmin && (
            <Button
              label="Admin dashboard"
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
                <Heading level={2}>Account summary</Heading>
                <Text color="secondary">{accountName}</Text>
              </VStack>
              <VStack gap={4}>
                <ProfileInfoRow icon={<EmailIcon />} label="Email">
                  <Text color="secondary">{profile?.email || user?.email || 'Not available'}</Text>
                </ProfileInfoRow>
                <ProfileInfoRow icon={<RoleIcon />} label="Role">
                  <Badge label={profile?.role || user?.role || 'customer'} />
                </ProfileInfoRow>
                {profile?.isBlocked && (
                  <Alert
                    title="Account blocked"
                    description="This account cannot place protected requests until an admin unblocks it."
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
                <Heading level={2}>Profile details</Heading>
                <Text color="secondary">
                  Update your public name, contact phone, and delivery address.
                </Text>
              </VStack>

              <FormLayout>
                <TextInput
                  label="Username"
                  value={values.username}
                  onChange={(value) => updateField('username', value)}
                  status={usernameStatus}
                  isRequired
                  isDisabled={isSaving}
                  width="100%"
                />
                <TextInput
                  label="Full name"
                  value={values.fullName}
                  onChange={(value) => updateField('fullName', value)}
                  isOptional
                  isDisabled={isSaving}
                  width="100%"
                />
                <TextInput
                  label="Phone"
                  startIcon={<PhoneIcon />}
                  value={values.phone}
                  onChange={(value) => updateField('phone', value)}
                  isOptional
                  isDisabled={isSaving}
                  width="100%"
                />
                <TextArea
                  label="Address"
                  startIcon={<AddressIcon />}
                  value={values.address}
                  onChange={(value) => updateField('address', value)}
                  rows={4}
                  isOptional
                  isDisabled={isSaving}
                  width="100%"
                />
              </FormLayout>

              <HStack gap={3} justify="end" wrap="wrap" style={{ paddingTop: 'var(--spacing-2)' }}>
                <Button
                  label="Reset"
                  variant="ghost"
                  onClick={resetForm}
                  isDisabled={isSaving}
                />
                <Button
                  label="Save profile"
                  type="submit"
                  variant="primary"
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
