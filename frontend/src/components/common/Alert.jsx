import React from 'react';
import { Button, Card, Text, VStack } from '@astryxdesign/core';

export const Alert = ({
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text weight="semibold">{title}</Text>
          {description && (
            <Text color="secondary">{description}</Text>
          )}
        </VStack>
        {actionLabel && onAction && (
          <Button
            label={actionLabel}
            variant="secondary"
            onClick={onAction}
          />
        )}
      </VStack>
    </Card>
  );
};

export default Alert;
