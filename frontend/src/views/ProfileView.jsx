import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
import { useAuth } from '../contexts/AuthContext';

const EMPTY_PROFILE = {
  username: '',
  fullName: '',
  phone: '',
  address: '',
};

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
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to save profile',
        description: error?.message || 'Your profile could not be updated.',
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
        />
      )}

      <Grid columns={{ minWidth: 280, max: 2 }} gap={4} style={{ alignItems: 'start' }}>
        <Card padding={4}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={2}>Account summary</Heading>
              <Text color="secondary">{accountName}</Text>
            </VStack>
            <VStack gap={3}>
              <HStack gap={2} align="center" wrap="wrap">
                <Text weight="semibold">Email</Text>
                <Text color="secondary">{profile?.email || user?.email || 'Not available'}</Text>
              </HStack>
              <HStack gap={2} align="center" wrap="wrap">
                <Text weight="semibold">Role</Text>
                <Badge label={profile?.role || user?.role || 'customer'} />
              </HStack>
              {profile?.isBlocked && (
                <Alert
                  title="Account blocked"
                  description="This account cannot place protected requests until an admin unblocks it."
                />
              )}
            </VStack>
          </VStack>
        </Card>

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
                  value={values.phone}
                  onChange={(value) => updateField('phone', value)}
                  isOptional
                  isDisabled={isSaving}
                  width="100%"
                />
                <TextArea
                  label="Address"
                  value={values.address}
                  onChange={(value) => updateField('address', value)}
                  rows={4}
                  isOptional
                  isDisabled={isSaving}
                  width="100%"
                />
              </FormLayout>

              <HStack gap={2} justify="end" wrap="wrap">
                <Button
                  label="Reset"
                  variant="secondary"
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
