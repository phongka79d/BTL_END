import React from 'react';
import { Button, Card, Heading, HStack, Text, VStack } from '@astryxdesign/core';
import { useNavigate } from 'react-router-dom';

export const NotFoundView = () => {
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
            404 · Không tìm thấy trang
          </Text>
          <VStack gap={2} style={{ alignItems: 'center' }}>
            <Heading level={1}>Không tìm thấy trang này</Heading>
            <Text color="secondary">
              Địa chỉ có thể không chính xác hoặc trang đã được chuyển. Hãy chọn một
              trong các tùy chọn bên dưới để tiếp tục duyệt tsshop.
            </Text>
          </VStack>
          <HStack gap={3} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button label="Quay lại cửa hàng" variant="primary" onClick={() => navigate('/')} />
            <Button label="Xem sản phẩm" variant="secondary" onClick={() => navigate('/products')} />
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default NotFoundView;
