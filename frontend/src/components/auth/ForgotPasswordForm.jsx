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
        email: { type: 'error', message: 'Vui lòng nhập email' },
      }));
      return null;
    }

    if (!isValidEmail(email)) {
      setFieldStatus((current) => ({
        ...current,
        email: { type: 'error', message: 'Vui lòng nhập địa chỉ email hợp lệ' },
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
        title: 'Đã gửi OTP',
        description: 'Nếu tài khoản tồn tại, hãy kiểm tra email để nhận mã đặt lại mật khẩu.',
      });
    } catch (error) {
      notification.error({
        title: 'Không thể gửi OTP',
        description: error?.message || 'Không thể gửi mã đặt lại mật khẩu.',
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
        otp: { type: 'error', message: 'Vui lòng nhập OTP' },
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
        title: 'Đã xác minh OTP',
        description: 'Nhập mật khẩu mới cho tài khoản của bạn.',
      });
    } catch (error) {
      notification.error({
        title: 'Không thể xác minh OTP',
        description: error?.message || 'OTP không chính xác hoặc đã hết hạn.',
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
        message: passwordPolicy.message.replace('Mật khẩu', 'Mật khẩu mới'),
      };
    }
    if (!values.confirmPassword) {
      nextStatus.confirmPassword = {
        type: 'error',
        message: 'Vui lòng nhập mật khẩu mới để xác nhận',
      };
    } else if (values.newPassword !== values.confirmPassword) {
      nextStatus.confirmPassword = {
        type: 'error',
        message: 'Mật khẩu mới và mật khẩu xác nhận phải khớp nhau',
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
        title: 'Đã đặt lại mật khẩu',
        description: 'Sử dụng mật khẩu mới để đăng nhập.',
      });
      onResetComplete();
    } catch (error) {
      notification.error({
        title: 'Không thể đặt lại mật khẩu',
        description: error?.message || 'Không thể đặt lại mật khẩu.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <VStack gap={4} style={{ width: '100%' }}>
      <VStack gap={1} style={{ alignItems: 'center' }}>
        <Heading level={2} style={{ fontSize: 'var(--text-heading-2-size)' }}>
          Quên mật khẩu?
        </Heading>
        <Text size="supporting" color="secondary">
          Xác minh email và OTP trước khi đặt mật khẩu mới.
        </Text>
      </VStack>

      <form onSubmit={step === 'email' ? handleSendOtp : step === 'otp' ? handleVerifyOtp : handleResetPassword} style={{ width: '100%' }}>
        <VStack gap={4}>
          <FormLayout>
            <TextInput
              label="Địa chỉ email"
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
                  label="Mật khẩu mới"
                  type="password"
                  value={values.newPassword}
                  onChange={(value) => updateField('newPassword', value)}
                  status={fieldStatus.newPassword}
                  isDisabled={isResetting}
                  isRequired
                  width="100%"
                />
                <TextInput
                  label="Xác nhận mật khẩu mới"
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
            label={step === 'email' ? 'Gửi OTP' : step === 'otp' ? 'Xác minh OTP' : 'Đặt lại mật khẩu'}
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
          label="Quay lại đăng nhập"
          variant="ghost"
          onClick={onBackToLogin}
          isDisabled={isSendingOtp || isVerifyingOtp || isResetting}
        />
      </HStack>
    </VStack>
  );
};

export default ForgotPasswordForm;
