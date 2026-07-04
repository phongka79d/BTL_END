import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, HStack, Heading, Text, VStack } from '@astryxdesign/core';

export const PlaceholderView = ({
  eyebrow,
  title,
  description,
  actions = []
}) => {
  const navigate = useNavigate();

  return (
    <VStack
      style={{
        width: '100%',
        gap: 'var(--spacing-4)',
        alignItems: 'stretch'
      }}
    >
      <Card
        style={{
          padding: 'var(--spacing-6)',
          backgroundColor: 'var(--color-background-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-container)'
        }}
      >
        <VStack gap={4}>
          {eyebrow && (
            <Text size="supporting" color="accent" weight="semibold">
              {eyebrow}
            </Text>
          )}
          <VStack gap={2}>
            <Heading level={1}>{title}</Heading>
            <Text color="secondary">{description}</Text>
          </VStack>
          {actions.length > 0 && (
            <HStack gap={3} style={{ flexWrap: 'wrap' }}>
              {actions.map((action) => (
                <Button
                  key={action.to}
                  label={action.label}
                  variant={action.variant || 'secondary'}
                  onClick={() => navigate(action.to)}
                />
              ))}
            </HStack>
          )}
        </VStack>
      </Card>
    </VStack>
  );
};

export default PlaceholderView;
