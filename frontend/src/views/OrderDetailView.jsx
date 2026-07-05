import React from 'react';
import { useParams } from 'react-router-dom';
import { VStack, Heading, Text } from '@astryxdesign/core';

/**
 * OrderDetailView - Placeholder
 * ponytail: Full order detail panel, status/payment info, and states belong to Batch04 (04D).
 * This placeholder is replaced by the full implementation in Batch04.
 */
export const OrderDetailView = () => {
  const { id } = useParams();

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
      <Heading level={1}>Order Detail</Heading>
      <Text color="secondary">
        Order #{id} detail placeholder — full implementation in Batch04.
      </Text>
    </VStack>
  );
};

export default OrderDetailView;
