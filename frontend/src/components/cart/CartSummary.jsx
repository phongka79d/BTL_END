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
  isSaveDisabled = false,
  isCheckoutDisabled = false,
  onSaveChanges,
  onCheckout,
  onContinueShopping
}) => {
  const checkoutDisabled = isDisabled || isCheckoutDisabled || hasUnsavedChanges || selectedProductCount === 0;
  return (
    <Card padding={4} style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Text size="supporting" color="accent" weight="semibold">
            Tổng quan giỏ hàng
          </Text>
          <Text color="secondary">
            Thanh toán chỉ bao gồm các sản phẩm đã chọn. Hãy lưu thay đổi số lượng trước khi tiếp tục.
          </Text>
        </VStack>

        <VStack gap={3}>
          <SummaryRow label="Sản phẩm đã chọn" value={selectedProductCount} />
          <SummaryRow label="Số lượng đã chọn" value={itemCount} />
          <SummaryRow label="Tạm tính đã chọn" value={formatPrice(subtotal)} />
        </VStack>

        <Divider />

        <VStack gap={3}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <Text weight="bold">Tổng hiện tại</Text>
            <Text weight="bold" color="accent" style={{ fontSize: 'var(--text-heading-3-size)' }}>
              {formatPrice(subtotal)}
            </Text>
          </HStack>
          <HStack gap={2} style={{ justifyContent: 'flex-end' }}>
            <Badge variant="info">COD</Badge>
            <Text size="supporting" color="secondary">Thanh toán khi nhận hàng</Text>
          </HStack>
          {hasUnsavedChanges && (
            <Text size="supporting" color="accent">
              Hãy lưu thay đổi số lượng trước khi thanh toán.
            </Text>
          )}
          {selectedProductCount === 0 && (
            <Text size="supporting" color="accent">
              Chọn ít nhất một sản phẩm để tiếp tục.
            </Text>
          )}
          <ButtonGroup
          label="Thao tác giỏ hàng"
            size="md"
            style={{ width: '100%' }}
          >
            <Button
              label="Lưu thay đổi"
              variant="secondary"
              isDisabled={!hasUnsavedChanges || isDisabled || isSaveDisabled}
              isLoading={isSaving}
              onClick={onSaveChanges}
              width="100%"
            />
            <Button
              label="Thanh toán"
              variant="secondary"
              isDisabled={checkoutDisabled}
              onClick={onCheckout}
              width="100%"
            />
            <Button
            label="Tiếp tục mua sắm"
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
