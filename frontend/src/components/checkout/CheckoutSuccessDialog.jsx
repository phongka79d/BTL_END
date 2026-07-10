import React from 'react';
import {
  Badge,
  Button,
  Dialog,
  HStack,
  Text,
  VStack
} from '@astryxdesign/core';

/**
 * CheckoutSuccessDialog
 *
 * Shown after a successful order placement. Displays the new order ID
 * and offers navigation to view the order or continue shopping.
 *
 * ponytail: If email confirmation is added in a later phase,
 *           add a note about email delivery here without breaking
 *           the existing dialog layout.
 */

export const CheckoutSuccessDialog = ({
  isOpen = false,
  orderId,
  onViewOrder,
  onContinueShopping
}) => {
  if (!orderId) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} purpose="default">
      <VStack style={{ padding: 'var(--spacing-6)' }} gap={5} align="center">
        <VStack gap={2} align="center">
          <Text size="body" weight="bold" color="success">
            Order placed successfully
          </Text>
          <Text color="secondary" align="center">
            Your order has been created and will be processed shortly.
            You will pay via Cash on Delivery when your order arrives.
          </Text>
        </VStack>

        <VStack gap={1} align="center">
          <Text size="supporting" color="secondary">
            Order ID
          </Text>
          <Badge variant="success">{`#${orderId}`}</Badge>
        </VStack>

        <HStack gap={3} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            label="Xem đơn hàng"
            variant="primary"
            onClick={onViewOrder}
          />
          <Button
            label="Tiếp tục mua sắm"
            variant="secondary"
            onClick={onContinueShopping}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
};

export default CheckoutSuccessDialog;
