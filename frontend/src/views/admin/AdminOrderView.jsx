import React from 'react';
import { VStack, Heading, Text } from '@astryxdesign/core';

/**
 * AdminOrderView - Placeholder
 * ponytail: Full admin orders table, status selector, detail dialog, and states belong to Batch05 (05B–05D).
 * This placeholder is replaced by the full implementation in Batch05.
 */
export const AdminOrderView = () => {
  return (
    <VStack
      style={{
        width: '100%',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-4)'
      }}
    >
      <Heading level={1}>Manage Orders</Heading>
      <Text color="secondary">
        Admin orders placeholder — full implementation in Batch05.
      </Text>
    </VStack>
  );
};

export default AdminOrderView;
