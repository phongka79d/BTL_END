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
 * Hiển thị sau khi đặt đơn hàng thành công. Hiển thị ID đơn hàng mới
 * và cung cấp điều hướng để xem đơn hàng hoặc tiếp tục mua sắm.
 *
 * ponytail: Nếu bổ sung xác nhận email trong giai đoạn sau,
 *           hãy thêm ghi chú về việc gửi email tại đây mà không phá vỡ
 *           bố cục dialog hiện có.
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
