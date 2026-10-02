import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  TextInput
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import VietnamAddressFields from '../components/address/VietnamAddressFields.jsx';
import { EMPTY_ADDRESS, toAddressPayload } from '../components/address/addressFormUtils.js';
import { validateAddress } from '../utils/addressValidation.js';
import { validatePhone } from '../utils/phoneValidation.js';
import { validatePasswordPolicy } from '../utils/passwordPolicy';

/**
 * Thành phần RegisterView
 * Hiển thị biểu mẫu đăng ký người dùng với các trường username, email, password, confirm password,
 * họ tên, điện thoại và địa chỉ.
 * Xử lý kiểm tra phía máy khách, trạng thái loading, chuyển hướng khi thành công và banner lỗi API.
 */
export const RegisterView = () => {
  const { register } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();

  // Trạng thái các trường
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(EMPTY_ADDRESS);

  // Trạng thái kiểm tra của các trường (cho thuộc tính status của Astryx)
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [confirmPasswordStatus, setConfirmPasswordStatus] = useState(null);
  const [fullNameStatus, setFullNameStatus] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});

  // Trạng thái gửi biểu mẫu và phản hồi API
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Hàm hỗ trợ kiểm tra định dạng email
   */
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  /**
   * Xử lý việc gửi biểu mẫu
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let hasError = false;

    // Đặt lại trạng thái của tất cả các trường
    setUsernameStatus(null);
    setEmailStatus(null);
    setPasswordStatus(null);
    setConfirmPasswordStatus(null);
    setFullNameStatus(null);
    setPhoneStatus(null);
    setAddressErrors({});

    // Kiểm tra phía máy khách
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setUsernameStatus({ type: 'error', message: 'Vui lòng nhập tên người dùng' });
      hasError = true;
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      setUsernameStatus({ type: 'error', message: 'Tên người dùng phải có từ 3 đến 50 ký tự' });
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

    if (!fullName.trim()) {
      setFullNameStatus({ type: 'error', message: 'Vui lòng nhập họ và tên' });
      hasError = true;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setPhoneStatus({ type: 'error', message: phoneError });
      hasError = true;
    }

    const nextAddressErrors = validateAddress(address);
    setAddressErrors(nextAddressErrors);
    if (Object.keys(nextAddressErrors).length > 0) {
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
        address: toAddressPayload(address)
      });

      if (res.success) {
        notification.success({
          title: 'Tạo tài khoản thành công',
          description: 'Tạo tài khoản thành công! Chào mừng bạn đến với tsshop.',
        });
        // Tạm dừng ngắn để người dùng kịp đọc thông báo thành công trước khi chuyển route
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
        <Heading level={2} style={{ fontSize: 'var(--text-heading-2-size)' }}>
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

          <VietnamAddressFields
            value={address}
            onChange={(nextAddress) => {
              setAddress(nextAddress);
              if (Object.keys(addressErrors).length > 0) {
                setAddressErrors(validateAddress(nextAddress));
              }
            }}
            onBlur={() => setAddressErrors(validateAddress(address))}
            errors={addressErrors}
            disabled={isLoading}
            required={false}
            idPrefix="register-address"
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
