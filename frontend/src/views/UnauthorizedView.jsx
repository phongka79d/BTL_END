import React from 'react';
import { Button, Card, Heading, HStack, Text, VStack } from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedView = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <VStack
      gap={6}
      width="100%"
      style={{
        maxWidth: '760px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-8)'
      }}
    >
      <Card padding={6} style={{ width: '100%' }}>
        <VStack gap={4} style={{ alignItems: 'center', textAlign: 'center' }}>
          <Text size="supporting" color="accent" weight="semibold">
            Quyền truy cập bị hạn chế
          </Text>
          <VStack gap={2} style={{ alignItems: 'center' }}>
            <Heading level={1}>Bạn không có quyền xem trang này</Heading>
            <Text color="secondary">
              Khu vực này chỉ dành cho tài khoản có vai trò phù hợp.
              Hãy chọn một điểm đến bên dưới để tiếp tục.
            </Text>
          </VStack>
          <HStack gap={3} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button label="Quay lại cửa hàng" variant="primary" onClick={() => navigate('/')} />
            <Button
              label={isAuthenticated ? 'Hồ sơ của tôi' : 'Đăng nhập'}
              variant="secondary"
              onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
            />
            {isAdmin && (
              <Button label="Bảng điều khiển quản trị" variant="secondary" onClick={() => navigate('/admin')} />
            )}
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default UnauthorizedView;
