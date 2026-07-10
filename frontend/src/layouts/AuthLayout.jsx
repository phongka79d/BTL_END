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
 * Thành phần AuthLayout đóng vai trò khung trang cho các trang xác thực (Login, Register).
 * Thành phần căn giữa biểu mẫu xác thực dạng card và thêm các thành phần nhận diện thương hiệu.
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
          {/* Biểu trưng và nhận diện thương hiệu */}
          <VStack style={{ alignItems: 'center', gap: 'var(--spacing-1)' }}>
            <HStack style={{ alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <Icon icon="wrench" color="accent" size="lg" />
              <Text size="large" weight="semibold">tsshop</Text>
            </HStack>
            <Text size="supporting" color="secondary">
              Truy cập tài khoản
            </Text>
          </VStack>

          {/* Hiển thị biểu mẫu đích (giao diện Login / Register) */}
          <Outlet />

          {/* Liên kết nhận diện thương hiệu ở chân trang */}
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
