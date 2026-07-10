import React from 'react';
import { Badge, Button, Card, Divider, HStack, Text, VStack } from '@astryxdesign/core';
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
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
  selectedProductCount = 0,
  hasUnsavedChanges = false,
  isSaving = false,
  isDisabled = false,
  onSaveChanges,
  onCheckout,
  onContinueShopping
}) => {
  const checkoutDisabled = isDisabled || hasUnsavedChanges || selectedProductCount === 0;

  return (
    <Card padding={4} style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Text size="supporting" color="accent" weight="semibold">
            Order summary
          </Text>
          <Text color="secondary">
            Checkout includes only selected products. Save quantity changes before continuing.
          </Text>
        </VStack>

        <VStack gap={3}>
          <SummaryRow label="Selected products" value={selectedProductCount} />
          <SummaryRow label="Selected units" value={itemCount} />
          <SummaryRow label="Selected subtotal" value={formatPrice(subtotal)} />
        </VStack>

        <Divider />

        <VStack gap={3}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <Text weight="bold">Current total</Text>
            <Text weight="bold" color="accent" style={{ fontSize: 'var(--text-title-3-size)' }}>
              {formatPrice(subtotal)}
            </Text>
          </HStack>
          <HStack gap={2} style={{ justifyContent: 'flex-end' }}>
            <Badge variant="info">COD</Badge>
            <Text size="supporting" color="secondary">Cash on Delivery</Text>
          </HStack>
          {hasUnsavedChanges && (
            <Text size="supporting" color="accent">
              Save quantity changes before checkout.
            </Text>
          )}
          {selectedProductCount === 0 && (
            <Text size="supporting" color="accent">
              Select at least one product to continue.
            </Text>
          )}
          <ButtonGroup
            label="Cart actions"
            size="md"
            style={{ width: '100%' }}
          >
            <Button
              label="Save changes"
              variant="secondary"
              isDisabled={!hasUnsavedChanges || isDisabled}
              isLoading={isSaving}
              onClick={onSaveChanges}
              width="100%"
            />
            <Button
              label="Checkout"
              variant="secondary"
              isDisabled={checkoutDisabled}
              onClick={onCheckout}
              width="100%"
            />
            <Button
              label="Continue shopping"
              variant="secondary"
              isDisabled={isDisabled || hasUnsavedChanges}
              onClick={onContinueShopping}
              width="100%"
            />
          </ButtonGroup>
        </VStack>
      </VStack>
    </Card>
  );
};

export default CartSummary;
