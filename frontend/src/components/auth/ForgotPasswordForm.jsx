import React, { useState } from 'react';
import {
  Button,
  FormLayout,
  Heading,
  HStack,
  Text,
  TextInput,
  VStack
} from '@astryxdesign/core';
import { authApi } from '../../api/authApi';
import { useNotification } from '../../contexts/NotificationContext';
import { validatePasswordPolicy } from '../../utils/passwordPolicy';

const EMPTY_VALUES = {
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const ForgotPasswordForm = ({ onBackToLogin, onResetComplete }) => {
  const notification = useNotification();
  const [step, setStep] = useState('email');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [fieldStatus, setFieldStatus] = useState({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldStatus((current) => ({ ...current, [field]: null }));
  };

  const validateEmail = () => {
    const email = values.email.trim();
    if (!email) {
      setFieldStatus((current) => ({
        ...current,
        email: { type: 'error', message: 'Email is required' },
      }));
      return null;
    }

    if (!isValidEmail(email)) {
      setFieldStatus((current) => ({
        ...current,
        email: { type: 'error', message: 'Please enter a valid email address' },
      }));
      return null;
    }

    return email;
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    const email = validateEmail();
    if (!email) {
      return;
    }

    setIsSendingOtp(true);
    try {
      await authApi.requestForgotPasswordOtp({ email });
      setStep('otp');
      notification.info({
        title: 'OTP sent',
        description: 'If an account exists, check your email for the password reset code.',
      });
    } catch (error) {
      notification.error({
        title: 'Unable to send OTP',
        description: error?.message || 'The password reset code could not be sent.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const email = validateEmail();
    if (!email) {
      return;
    }

    if (!values.otp.trim()) {
      setFieldStatus((current) => ({
        ...current,
        otp: { type: 'error', message: 'OTP is required' },
      }));
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await authApi.verifyForgotPasswordOtp({
        email,
        otp: values.otp.trim(),
      });
      setStep('reset');
      notification.success({
        title: 'OTP verified',
        description: 'Enter a new password for your account.',
      });
    } catch (error) {
      notification.error({
        title: 'Unable to verify OTP',
        description: error?.message || 'The OTP is incorrect or expired.',
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const validatePassword = () => {
    const nextStatus = {};

    const passwordPolicy = validatePasswordPolicy(values.newPassword);
    if (!passwordPolicy.isValid) {
      nextStatus.newPassword = {
        type: 'error',
        message: passwordPolicy.message.replace('Password', 'New password'),
      };
    }
    if (!values.confirmPassword) {
      nextStatus.confirmPassword = {
        type: 'error',
        message: 'Confirm new password is required',
      };
    } else if (values.newPassword !== values.confirmPassword) {
      nextStatus.confirmPassword = {
        type: 'error',
        message: 'New password and confirmation password must match',
      };
    }

    setFieldStatus((current) => ({ ...current, ...nextStatus }));
    return Object.keys(nextStatus).length === 0;
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    const email = validateEmail();
    if (!email || !validatePassword()) {
      return;
    }

    setIsResetting(true);
    try {
      await authApi.resetForgotPassword({
        email,
        otp: values.otp.trim(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setValues(EMPTY_VALUES);
      setStep('email');
      notification.success({
        title: 'Password reset',
        description: 'Use your new password to sign in.',
      });
      onResetComplete();
    } catch (error) {
      notification.error({
        title: 'Unable to reset password',
        description: error?.message || 'The password could not be reset.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <VStack gap={4} style={{ width: '100%' }}>
      <VStack gap={1} style={{ alignItems: 'center' }}>
        <Heading level={2} style={{ fontSize: 'var(--text-title-2-size)' }}>
          Forgot Password?
        </Heading>
        <Text size="supporting" color="secondary">
          Verify your email and OTP before setting a new password.
        </Text>
      </VStack>

      <form onSubmit={step === 'email' ? handleSendOtp : step === 'otp' ? handleVerifyOtp : handleResetPassword} style={{ width: '100%' }}>
        <VStack gap={4}>
          <FormLayout>
            <TextInput
              label="Email Address"
              type="email"
              value={values.email}
              onChange={(value) => updateField('email', value)}
              status={fieldStatus.email}
              isDisabled={isSendingOtp || isVerifyingOtp || isResetting || step !== 'email'}
              isRequired
              placeholder="you@example.com"
              width="100%"
            />

            {step !== 'email' && (
              <TextInput
                label="OTP"
                value={values.otp}
                onChange={(value) => updateField('otp', value)}
                status={fieldStatus.otp}
                isDisabled={isVerifyingOtp || isResetting || step === 'reset'}
                isRequired
                width="100%"
              />
            )}

            {step === 'reset' && (
              <>
                <TextInput
                  label="New Password"
                  type="password"
                  value={values.newPassword}
                  onChange={(value) => updateField('newPassword', value)}
                  status={fieldStatus.newPassword}
                  isDisabled={isResetting}
                  isRequired
                  width="100%"
                />
                <TextInput
                  label="Confirm New Password"
                  type="password"
                  value={values.confirmPassword}
                  onChange={(value) => updateField('confirmPassword', value)}
                  status={fieldStatus.confirmPassword}
                  isDisabled={isResetting}
                  isRequired
                  width="100%"
                />
              </>
            )}
          </FormLayout>

          <Button
            label={step === 'email' ? 'Send OTP' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}
            variant="primary"
            type="submit"
            isLoading={isSendingOtp || isVerifyingOtp || isResetting}
            isDisabled={isSendingOtp || isVerifyingOtp || isResetting}
            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
          />
        </VStack>
      </form>

      <HStack justify="center" wrap="wrap">
        <Button
          label="Back to login"
          variant="ghost"
          onClick={onBackToLogin}
          isDisabled={isSendingOtp || isVerifyingOtp || isResetting}
        />
      </HStack>
    </VStack>
  );
};

export default ForgotPasswordForm;
