import React, { useState } from 'react';
import {
  Button,
  Card,
  FormLayout,
  Heading,
  HStack,
  Text,
  TextInput,
  VStack
} from '@astryxdesign/core';
import { authApi } from '../../api/authApi';
import { validatePasswordPolicy } from '../../utils/passwordPolicy';
import Alert from '../common/Alert';

const EMPTY_VALUES = {
  currentPassword: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

const EMPTY_FIELD_STATUS = {};

export const ChangePasswordPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [fieldStatus, setFieldStatus] = useState(EMPTY_FIELD_STATUS);
  const [feedback, setFeedback] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldStatus((current) => ({ ...current, [field]: null }));
    setFeedback(null);
  };

  const resetFlow = () => {
    setValues(EMPTY_VALUES);
    setFieldStatus(EMPTY_FIELD_STATUS);
    setFeedback(null);
    setOtpRequested(false);
  };

  const handleToggle = () => {
    setIsOpen((current) => !current);
    resetFlow();
  };

  const handleSendOtp = async () => {
    if (!values.currentPassword.trim()) {
      setFieldStatus({
        currentPassword: { type: 'error', message: 'Current password is required' },
      });
      return;
    }

    setIsSendingOtp(true);
    setFeedback(null);

    try {
      await authApi.requestPasswordChangeOtp({
        currentPassword: values.currentPassword,
      });
      setOtpRequested(true);
      setFeedback({
        title: 'OTP sent',
        description: 'Check your email for the password change code.',
        status: 'success',
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to send OTP',
        description: error?.message || 'Current password could not be verified.',
        status: 'error',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const validateSubmit = () => {
    const nextStatus = {};

    if (!values.currentPassword.trim()) {
      nextStatus.currentPassword = { type: 'error', message: 'Current password is required' };
    }
    if (!values.otp.trim()) {
      nextStatus.otp = { type: 'error', message: 'OTP is required' };
    }
    const passwordPolicy = validatePasswordPolicy(values.newPassword);
    if (!passwordPolicy.isValid) {
      nextStatus.newPassword = {
        type: 'error',
        message: passwordPolicy.message.replace('Password', 'New password'),
      };
    }
    if (!values.confirmPassword) {
      nextStatus.confirmPassword = { type: 'error', message: 'Confirm new password is required' };
    } else if (values.newPassword !== values.confirmPassword) {
      nextStatus.confirmPassword = {
        type: 'error',
        message: 'New password and confirmation password must match',
      };
    }

    setFieldStatus(nextStatus);
    return Object.keys(nextStatus).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateSubmit()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await authApi.confirmPasswordChange({
        currentPassword: values.currentPassword,
        otp: values.otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      resetFlow();
      setIsOpen(false);
      setFeedback({
        title: 'Password changed',
        description: 'Use your new password the next time you sign in.',
        status: 'success',
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to change password',
        description: error?.message || 'The password was not changed.',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={3} justify="between" align="center" wrap="wrap">
          <VStack gap={1}>
            <Heading level={2}>Password</Heading>
            <Text color="secondary">Verify your current password and email OTP before changing it.</Text>
          </VStack>
          {isOpen ? (
            <Button
              label="Cancel"
              variant="secondary"
              onClick={handleToggle}
              isDisabled={isSendingOtp || isSubmitting}
            />
          ) : (
            <Button
              label="Change Password"
              variant="primary"
              onClick={handleToggle}
              isDisabled={isSendingOtp || isSubmitting}
            />
          )}
        </HStack>

        {feedback && <Alert title={feedback.title} description={feedback.description} status={feedback.status} />}

        {isOpen && (
          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              <FormLayout>
                <TextInput
                  label="Current password"
                  type="password"
                  value={values.currentPassword}
                  onChange={(value) => updateField('currentPassword', value)}
                  status={fieldStatus.currentPassword}
                  isRequired
                  isDisabled={isSendingOtp || isSubmitting}
                  width="100%"
                />
              </FormLayout>

              <HStack gap={2} justify="start" wrap="wrap">
                <Button
                  label="Send OTP"
                  type="button"
                  variant="secondary"
                  onClick={handleSendOtp}
                  isLoading={isSendingOtp}
                  isDisabled={isSubmitting}
                />
              </HStack>

              {otpRequested && (
                <FormLayout>
                  <TextInput
                    label="OTP"
                    value={values.otp}
                    onChange={(value) => updateField('otp', value)}
                    status={fieldStatus.otp}
                    isRequired
                    isDisabled={isSubmitting}
                    width="100%"
                  />
                  <TextInput
                    label="New password"
                    type="password"
                    value={values.newPassword}
                    onChange={(value) => updateField('newPassword', value)}
                    status={fieldStatus.newPassword}
                    isRequired
                    isDisabled={isSubmitting}
                    width="100%"
                  />
                  <TextInput
                    label="Confirm new password"
                    type="password"
                    value={values.confirmPassword}
                    onChange={(value) => updateField('confirmPassword', value)}
                    status={fieldStatus.confirmPassword}
                    isRequired
                    isDisabled={isSubmitting}
                    width="100%"
                  />
                </FormLayout>
              )}

              {otpRequested && (
                <HStack gap={2} justify="end" wrap="wrap">
                  <Button
                    label="Reset"
                    type="button"
                    variant="secondary"
                    onClick={resetFlow}
                    isDisabled={isSubmitting}
                  />
                  <Button
                    label="Save new password"
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  />
                </HStack>
              )}
            </VStack>
          </form>
        )}
      </VStack>
    </Card>
  );
};

export default ChangePasswordPanel;
