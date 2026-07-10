import React from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  HStack,
  Text,
  VStack
} from '@astryxdesign/core';
import { formatPrice } from '../product/productUtils';

/**
 * CheckoutOrderSummary
 *
 * Displays cart-derived order summary with item list, subtotal,
 * COD badge, and the submit button. Totals are displayed from
 * backend data — this component is display-only.
 *
 * ponytail: If the backend adds shipping fees or discounts,
 *           add those rows to the summary and accept them via props.
 */

const SummaryRow = ({ label, value, isTotal = false }) => (
  <HStack
    style={{
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 'var(--spacing-4)'
    }}
  >
    <Text
      size={isTotal ? 'body' : 'supporting'}
      weight={isTotal ? 'bold' : 'regular'}
      color={isTotal ? undefined : 'secondary'}
    >
      {label}
    </Text>
    <Text
      size={isTotal ? 'body' : 'supporting'}
      weight={isTotal ? 'bold' : 'semibold'}
      color={isTotal ? 'accent' : undefined}
    >
      {value}
    </Text>
  </HStack>
);

export const CheckoutOrderSummary = ({
  items = [],
  subtotal,
  isSubmitting = false,
  onSubmit
}) => {
  const itemCount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Text size="supporting" color="accent" weight="semibold">
            Order summary
          </Text>
          <Text color="secondary">
            Your order will be paid via Cash on Delivery.
          </Text>
        </VStack>

        {items.length > 0 && (
          <VStack gap={2}>
            {items.map((item) => (
              <HStack
                key={item.id}
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 'var(--spacing-3)'
                }}
              >
                <VStack gap={0} style={{ minWidth: 0, flex: 1 }}>
                  <Text weight="medium" style={{ wordBreak: 'break-word' }}>
                    {item.product?.name || 'Sản phẩm'}
                  </Text>
                  <Text size="supporting" color="secondary">
                    {item.product?.brand && `${item.product.brand} · `}
                    Qty: {item.quantity}
                  </Text>
                </VStack>
                <Text weight="semibold" style={{ whiteSpace: 'nowrap' }}>
                  {formatPrice(item.unitPrice)}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}

        <Divider />

        <VStack gap={2}>
          <SummaryRow label="Sản phẩm" value={itemCount} />
          <SummaryRow label="Tạm tính" value={formatPrice(subtotal)} />
        </VStack>

        <Divider />

        <VStack gap={3}>
          <SummaryRow
            label="Tổng cộng"
            value={formatPrice(subtotal)}
            isTotal
          />

          <HStack gap={2} style={{ justifyContent: 'flex-end' }}>
            <Badge variant="info">COD</Badge>
            <Text size="supporting" color="secondary">
              Thanh toán khi nhận hàng
            </Text>
          </HStack>
        </VStack>

        <Button
          label="Đặt hàng"
          variant="primary"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          onClick={onSubmit}
          width="100%"
        />
      </VStack>
    </Card>
  );
};

export default CheckoutOrderSummary;
