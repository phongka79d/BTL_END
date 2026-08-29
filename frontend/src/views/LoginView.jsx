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
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const BLOCKED_ACCOUNT_MESSAGE = 'Tài khoản của bạn đã bị khóa';
const INVALID_CREDENTIALS_MESSAGE = 'Email hoặc mật khẩu không hợp lệ';

const getLoginErrorTitle = (message) => (
  message === BLOCKED_ACCOUNT_MESSAGE ? 'Tài khoản bị khóa' : 'Đăng nhập thất bại'
);

const getLoginErrorDescription = (message) => (
  message === INVALID_CREDENTIALS_MESSAGE ? 'Email hoặc mật khẩu không chính xác' : message
);

/**
 * Thành phần LoginView
 * Hiển thị trang đăng nhập với các trường email và password.
 * Xử lý kiểm tra phía máy khách, trạng thái loading, chuyển hướng khi thành công và banner lỗi API.
 */
export const LoginView = () => {
  const { login } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();

  // Trạng thái các trường
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Trạng thái kiểm tra của các trường (cho thuộc tính status của Astryx)
  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Trạng thái gửi biểu mẫu và phản hồi API
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

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

    // Đặt lại trạng thái
    setEmailStatus(null);
    setPasswordStatus(null);

    // Kiểm tra phía máy khách
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
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        notification.success({
          title: 'Thành công',
          description: 'Đăng nhập thành công! Đang chuyển hướng...',
        });
        // Tạm dừng ngắn để người dùng kịp đọc thông báo thành công
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        const message = res.error || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
        notification.error({
          title: getLoginErrorTitle(message),
          description: getLoginErrorDescription(message),
        });
      }
    } catch (err) {
      notification.error({
        title: 'Đăng nhập thất bại',
        description: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'forgot-password') {
    return (
      <ForgotPasswordForm
        onBackToLogin={() => setMode('login')}
        onResetComplete={() => setMode('login')}
      />
    );
  }

  return (
    <VStack gap={4} style={{ width: '100%' }}>
      <VStack gap={1} style={{ alignItems: 'center' }}>
        <Heading level={2} style={{ fontSize: 'var(--text-heading-2-size)' }}>
          Chào mừng bạn quay trở lại
        </Heading>
        <Text size="supporting" color="secondary">
          Nhập thông tin để truy cập tài khoản của bạn
        </Text>
      </VStack>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <VStack gap={4}>
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
            placeholder="••••••••"
          />

          <HStack justify="end">
            <Button
              label="Quên mật khẩu?"
              variant="ghost"
              type="button"
              onClick={() => setMode('forgot-password')}
              isDisabled={isLoading}
            />
          </HStack>

          <Button
            label={isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
          Chưa có tài khoản?
        </Text>
        <Link
          to="/register"
          style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontSize: 'var(--text-supporting-size)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          Đăng ký tại đây
        </Link>
      </HStack>
    </VStack>
  );
};

export default LoginView;
