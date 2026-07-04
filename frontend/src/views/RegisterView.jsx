import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  TextInput,
  TextArea,
  Banner
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';

/**
 * RegisterView Component
 * Renders the user registration form with username, email, password, confirm password,
 * full name, phone, and address fields.
 * Handles client-side validation, loading states, success redirection, and API error banners.
 */
export const RegisterView = () => {
  const { register } = useAuth();
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
      setUsernameStatus({ type: 'error', message: 'Username is required' });
      hasError = true;
    } else if (username.length < 3) {
      setUsernameStatus({ type: 'error', message: 'Username must be at least 3 characters' });
      hasError = true;
    }

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
    } else if (password.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordStatus({ type: 'error', message: 'Confirm password is required' });
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordStatus({ type: 'error', message: 'Passwords do not match' });
      hasError = true;
    }

    if (!fullName) {
      setFullNameStatus({ type: 'error', message: 'Full name is required' });
      hasError = true;
    }

    // Phone is optional but if filled, it should look like a number
    if (phone && !/^\+?[0-9\s-]{8,15}$/.test(phone)) {
      setPhoneStatus({ type: 'error', message: 'Please enter a valid phone number' });
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
        setSuccessMsg('Account created successfully! Welcome to TechMart.');
        // Small delay to allow user to read success message before routing
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setApiError(res.error || 'Registration failed. Email or username might already be in use.');
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
          Create Account
        </Heading>
        <Text size="supporting" color="secondary">
          Join TechMart to start shopping
        </Text>
      </VStack>

      {/* Success Banner */}
      {successMsg && (
        <Banner
          status="success"
          title="Account Created"
          description={successMsg}
        />
      )}

      {/* Error Banner */}
      {apiError && (
        <Banner
          status="error"
          title="Registration Failed"
          description={apiError}
          isDismissable
          onDismiss={() => setApiError(null)}
        />
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <VStack gap={4}>
          <TextInput
            label="Username"
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
            label="Full Name"
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
            label="Phone Number"
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
            placeholder="At least 6 characters"
          />

          <TextInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(val) => {
              setConfirmPassword(val);
              if (confirmPasswordStatus) setConfirmPasswordStatus(null);
            }}
            status={confirmPasswordStatus}
            isDisabled={isLoading}
            isRequired
            placeholder="Re-enter password"
          />

          <TextArea
            label="Address"
            value={address}
            onChange={(val) => {
              setAddress(val);
              if (addressStatus) setAddressStatus(null);
            }}
            status={addressStatus}
            isDisabled={isLoading}
            placeholder="Enter your delivery address"
          />

          <Button
            label={isLoading ? 'Creating Account...' : 'Register'}
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
          Already have an account?
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
          Login here
        </Link>
      </HStack>
    </VStack>
  );
};

export default RegisterView;
