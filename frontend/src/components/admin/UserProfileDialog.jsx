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

const getProfileValues = (user) => ({
  username: user?.username || '',
  fullName: user?.fullName || '',
  phone: user?.phone || '',
  address: user?.address || '',
});

const createUserProfilePayload = (values) => ({
  username: values.username.trim(),
  fullName: values.fullName.trim(),
  phone: values.phone.trim(),
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(getProfileValues(user));
      setError('');
    }
  }, [isOpen, user]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = createUserProfilePayload(values);

    if (!payload.username) {
      setError('Username cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError?.message || 'Unable to save user profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form">
      <Layout
        header={(
          <DialogHeader
            title="Edit profile"
            subtitle={user?.email || 'Update soft account information.'}
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
                    title="Unable to save profile"
                    description={error}
                  />
                )}
                <FormLayout>
                  <TextInput
                    label="Username"
                    value={values.username}
                    onChange={(value) => updateField('username', value)}
                    isRequired
                    width="100%"
                  />
                  <TextInput
                    label="Full name"
                    value={values.fullName}
                    onChange={(value) => updateField('fullName', value)}
                    isOptional
                    width="100%"
                  />
                  <TextInput
                    label="Phone"
                    value={values.phone}
                    onChange={(value) => updateField('phone', value)}
                    isOptional
                    width="100%"
                  />
                  <TextInput
                    label="Address"
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
                label="Cancel"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                isDisabled={isSubmitting}
              />
              <Button
                label="Save profile"
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

export default UserProfileDialog;
