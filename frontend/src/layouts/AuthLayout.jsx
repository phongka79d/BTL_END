import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Center,
  Card,
  VStack,
  HStack,
  Text,
  Icon
} from '@astryxdesign/core';

/**
 * AuthLayout component that serves as the page shell for authentication pages (Login, Register).
 * It centers the card-based auth form and adds branding elements.
 */
export const AuthLayout = () => {
  return (
    <Center
      style={{
        width: '100%',
        minWidth: 0,
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-body)',
        padding: 'var(--spacing-4)'
      }}
    >
      <Card
        width="100%"
        maxWidth="calc(var(--spacing-10) * 10)"
        padding={6}
        style={{
          minWidth: 0,
          boxShadow: 'var(--elevation-2)'
        }}
      >
        <VStack gap={6}>
          {/* Logo & Branding */}
          <VStack style={{ alignItems: 'center', gap: 'var(--spacing-1)' }}>
            <HStack style={{ alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <Icon icon="wrench" color="accent" size="lg" />
              <Text size="large" weight="semibold">tsshop</Text>
            </HStack>
            <Text size="supporting" color="secondary">
              Truy cập tài khoản
            </Text>
          </VStack>

          {/* Render target form (Login / Register view) */}
          <Outlet />

          {/* Footer branding link */}
          <Center>
            <Link
              to="/"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--text-supporting-size)',
                transition: 'color var(--duration-fast)',
                ':hover': {
                  color: 'var(--color-accent)'
                }
              }}
            >
              ← Quay lại trang chủ
            </Link>
          </Center>
        </VStack>
      </Card>
    </Center>
  );
};

export default AuthLayout;
