import React from 'react';
import { Button, Card, Divider, HStack, Text, VStack } from '@astryxdesign/core';
import { formatPrice } from '../product/productUtils';

const SummaryRow = ({ label, value }) => (
  <HStack style={{ justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
    <Text size="supporting" color="secondary">
      {label}
    </Text>
    <Text weight="semibold">
      {value}
    </Text>
  </HStack>
);

export const CartSummary = ({
  subtotal,
  itemCount = 0,
  isDisabled = false,
  onCheckout
}) => {
  return (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Text size="supporting" color="accent" weight="semibold">
            Order summary
          </Text>
          <Text color="secondary">
            Review the backend subtotal before continuing.
          </Text>
        </VStack>

        <VStack gap={3}>
          <SummaryRow label="Items" value={itemCount} />
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
        </VStack>

        <Divider />

        <Button
          label="Checkout"
          variant="primary"
          isDisabled={isDisabled}
          onClick={onCheckout}
        />
      </VStack>
    </Card>
  );
};

export default CartSummary;
