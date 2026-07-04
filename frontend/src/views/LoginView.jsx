import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  TextInput,
  Banner
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';

/**
 * LoginView Component
 * Renders the login page with email and password fields.
 * Handles client-side validation, loading states, success redirection, and API error banners.
 */
export const LoginView = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Field states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Field validation states (for Astryx status prop)
  const [emailStatus, setEmailStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Form submission and API feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
    setApiError(null);
    setSuccessMsg(null);
    
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
        setSuccessMsg('Login successful! Redirecting...');
        // Small delay to allow the user to see the success message
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        setApiError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } catch (err) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Success Banner */}
      {successMsg && (
        <Banner
          status="success"
          title="Success"
          description={successMsg}
        />
      )}

      {/* Error Banner */}
      {apiError && (
        <Banner
          status="error"
          title="Login Failed"
          description={apiError}
          isDismissable
          onDismiss={() => setApiError(null)}
        />
      )}

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
