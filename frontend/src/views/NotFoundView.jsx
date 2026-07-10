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
            404 · Page not found
          </Text>
          <VStack gap={2} style={{ alignItems: 'center' }}>
            <Heading level={1}>We could not find that page</Heading>
            <Text color="secondary">
              The address may be incorrect, or the page may have moved. Use one of
              the options below to continue browsing tsshop.
            </Text>
          </VStack>
          <HStack gap={3} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button label="Back to store" variant="primary" onClick={() => navigate('/')} />
            <Button label="Browse products" variant="secondary" onClick={() => navigate('/products')} />
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
};

export default NotFoundView;
