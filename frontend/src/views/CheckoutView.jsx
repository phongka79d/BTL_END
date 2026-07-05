import React from 'react';
import { VStack, Heading, Text } from '@astryxdesign/core';

/**
 * CheckoutView - Placeholder
 * ponytail: Full checkout form, order summary, and success flow belong to Batch04 (04B).
 * This placeholder is replaced by the full implementation in Batch04.
 */
export const CheckoutView = () => {
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
      <Heading level={1}>Checkout</Heading>
      <Text color="secondary">
        Checkout placeholder — full implementation in Batch04.
      </Text>
    </VStack>
  );
};

export default CheckoutView;
