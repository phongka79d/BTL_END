import React from 'react';
import { VStack, Heading, Text } from '@astryxdesign/core';

/**
 * OrderHistoryView - Placeholder
 * ponytail: Full order history table, status/payment badges, and states belong to Batch04 (04C).
 * This placeholder is replaced by the full implementation in Batch04.
 */
export const OrderHistoryView = () => {
  return (
    <VStack
      style={{
        width: '100%',
        maxWidth: '800px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-4)'
      }}
    >
      <Heading level={1}>My Orders</Heading>
      <Text color="secondary">
        Order history placeholder — full implementation in Batch04.
      </Text>
    </VStack>
  );
};

export default OrderHistoryView;
