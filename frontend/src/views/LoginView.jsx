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

const BLOCKED_ACCOUNT_MESSAGE = 'Your account has been blocked';
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

const getLoginErrorTitle = (message) => (
  message === BLOCKED_ACCOUNT_MESSAGE ? 'Account Blocked' : 'Login Failed'
);

const getLoginErrorDescription = (message) => (
  message === INVALID_CREDENTIALS_MESSAGE ? 'Incorrect email or password' : message
);

/**
 * LoginView Component
 * Renders the login page with email and password fields.
 * Handles client-side validation, loading states, success redirection, and API error banners.
 */
export const LoginView = () => {
  const { login } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();

  // Field states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Field validation states (for Astryx status prop)
  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Form submission and API feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

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

    // Reset status
    setEmailStatus(null);
    setPasswordStatus(null);

    // Client-side validations
    if (!email) {
      setEmailStatus({ type: 'error', message: 'Email is required' });
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address' });
      hasError = true;
    }

    if (!password) {
      setPasswordStatus({ type: 'error', message: 'Password is required' });
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        notification.success({
          title: 'Success',
          description: 'Login successful! Redirecting...',
        });
        // Small delay to allow the user to see the success message
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        const message = res.error || 'Failed to sign in. Please verify your credentials.';
        notification.error({
          title: getLoginErrorTitle(message),
          description: getLoginErrorDescription(message),
        });
      }
    } catch (err) {
      notification.error({
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
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
        <Heading level={2} style={{ fontSize: 'var(--text-title-2-size)' }}>
          Welcome Back
        </Heading>
        <Text size="supporting" color="secondary">
          Enter your details to access your account
        </Text>
      </VStack>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <VStack gap={4}>
          <TextInput
            label="Email Address"
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
            label="Password"
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
              label="Forgot Password?"
              variant="ghost"
              type="button"
              onClick={() => setMode('forgot-password')}
              isDisabled={isLoading}
            />
          </HStack>

          <Button
            label={isLoading ? 'Signing In...' : 'Sign In'}
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
          Don't have an account?
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
          Register here
        </Link>
      </HStack>
    </VStack>
  );
};

export default LoginView;
