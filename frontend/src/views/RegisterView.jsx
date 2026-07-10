import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  TextInput,
  TextArea
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { validatePasswordPolicy } from '../utils/passwordPolicy';

/**
 * RegisterView Component
 * Renders the user registration form with username, email, password, confirm password,
 * full name, phone, and address fields.
 * Handles client-side validation, loading states, success redirection, and API error banners.
 */
export const RegisterView = () => {
  const { register } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();

  // Field states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Field validation states (for Astryx status prop)
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [confirmPasswordStatus, setConfirmPasswordStatus] = useState(null);
  const [fullNameStatus, setFullNameStatus] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [addressStatus, setAddressStatus] = useState(null);

  // Form submission and API feedback states
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Helper to validate email format
   */
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let hasError = false;

    // Reset all field statuses
    setUsernameStatus(null);
    setEmailStatus(null);
    setPasswordStatus(null);
    setConfirmPasswordStatus(null);
    setFullNameStatus(null);
    setPhoneStatus(null);
    setAddressStatus(null);

    // Client-side validations
    if (!username) {
      setUsernameStatus({ type: 'error', message: 'Vui lòng nhập tên người dùng' });
      hasError = true;
    } else if (username.length < 3) {
      setUsernameStatus({ type: 'error', message: 'Tên người dùng phải có ít nhất 3 ký tự' });
      hasError = true;
    }

    if (!email) {
      setEmailStatus({ type: 'error', message: 'Vui lòng nhập email' });
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailStatus({ type: 'error', message: 'Vui lòng nhập địa chỉ email hợp lệ' });
      hasError = true;
    }

    if (!password) {
      setPasswordStatus({ type: 'error', message: 'Vui lòng nhập mật khẩu' });
      hasError = true;
    } else {
      const passwordPolicy = validatePasswordPolicy(password);
      if (!passwordPolicy.isValid) {
        setPasswordStatus({ type: 'error', message: passwordPolicy.message });
        hasError = true;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordStatus({ type: 'error', message: 'Vui lòng nhập mật khẩu xác nhận' });
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordStatus({ type: 'error', message: 'Mật khẩu không khớp' });
      hasError = true;
    }

    if (!fullName) {
      setFullNameStatus({ type: 'error', message: 'Vui lòng nhập họ và tên' });
      hasError = true;
    }

    // Phone is optional but if filled, it should look like a number
    if (phone && !/^\+?[0-9\s-]{8,15}$/.test(phone)) {
      setPhoneStatus({ type: 'error', message: 'Vui lòng nhập số điện thoại hợp lệ' });
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const res = await register({
        username,
        email,
        password,
        fullName,
        phone: phone || undefined,
        address: address || undefined
      });

      if (res.success) {
        notification.success({
          title: 'Tạo tài khoản thành công',
          description: 'Tạo tài khoản thành công! Chào mừng bạn đến với tsshop.',
        });
        // Small delay to allow user to read success message before routing
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        notification.error({
          title: 'Đăng ký thất bại',
          description: res.error || 'Đăng ký thất bại. Email hoặc tên người dùng có thể đã được sử dụng.',
        });
      }
    } catch (err) {
      notification.error({
        title: 'Đăng ký thất bại',
        description: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack gap={4} style={{ width: '100%' }}>
      <VStack gap={1} style={{ alignItems: 'center' }}>
        <Heading level={2} style={{ fontSize: 'var(--text-title-2-size)' }}>
          Tạo tài khoản
        </Heading>
        <Text size="supporting" color="secondary">
          Tham gia tsshop để bắt đầu mua sắm
        </Text>
      </VStack>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <VStack gap={4}>
          <TextInput
            label="Tên người dùng"
            value={username}
            onChange={(val) => {
              setUsername(val);
              if (usernameStatus) setUsernameStatus(null);
            }}
            status={usernameStatus}
            isDisabled={isLoading}
            isRequired
            placeholder="johndoe"
          />

          <TextInput
            label="Địa chỉ email"
            type="email"
            value={email}
            onChange={(val) => {
              setEmail(val);
              if (emailStatus) setEmailStatus(null);
            }}
            status={emailStatus}
            isDisabled={isLoading}
            isRequired
            placeholder="you@example.com"
          />

          <TextInput
            label="Họ và tên"
            value={fullName}
            onChange={(val) => {
              setFullName(val);
              if (fullNameStatus) setFullNameStatus(null);
            }}
            status={fullNameStatus}
            isDisabled={isLoading}
            isRequired
            placeholder="John Doe"
          />

          <TextInput
            label="Số điện thoại"
            type="text"
            value={phone}
            onChange={(val) => {
              setPhone(val);
              if (phoneStatus) setPhoneStatus(null);
            }}
            status={phoneStatus}
            isDisabled={isLoading}
            placeholder="0901234567"
          />

          <TextInput
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              if (passwordStatus) setPasswordStatus(null);
            }}
            status={passwordStatus}
            isDisabled={isLoading}
            isRequired
            placeholder="Ít nhất 12 ký tự"
          />

          <TextInput
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(val) => {
              setConfirmPassword(val);
              if (confirmPasswordStatus) setConfirmPasswordStatus(null);
            }}
            status={confirmPasswordStatus}
            isDisabled={isLoading}
            isRequired
            placeholder="Nhập lại mật khẩu"
          />

          <TextArea
            label="Địa chỉ"
            value={address}
            onChange={(val) => {
              setAddress(val);
              if (addressStatus) setAddressStatus(null);
            }}
            status={addressStatus}
            isDisabled={isLoading}
            placeholder="Nhập địa chỉ giao hàng của bạn"
          />

          <Button
            label={isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            variant="primary"
            type="submit"
            isLoading={isLoading}
            isDisabled={isLoading}
            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
          />
        </VStack>
      </form>

      <HStack style={{ justifyContent: 'center', gap: 'var(--spacing-1)' }}>
        <Text size="supporting" color="secondary">
          Đã có tài khoản?
        </Text>
        <Link
          to="/login"
          style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontSize: 'var(--text-supporting-size)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          Đăng nhập tại đây
        </Link>
      </HStack>
    </VStack>
  );
};

export default RegisterView;
