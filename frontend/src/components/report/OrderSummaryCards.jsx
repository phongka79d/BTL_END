import React from 'react';
import {
  Card,
  Grid,
  Skeleton,
  Text,
  VStack,
} from '@astryxdesign/core';
import OrderStatusBadge from '../order/OrderStatusBadge';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
} from '../../constants/orderConstants';

export const OrderSummaryCards = ({
  isLoading = false,
  summary = {},
}) => (
  <VStack gap={3}>
    <VStack gap={1}>
      <Text weight="semibold">Order summary</Text>
      <Text color="secondary">Order counts by current status.</Text>
    </VStack>

    <Grid columns={{ minWidth: 180, max: 5, repeat: 'fit' }} gap={3}>
      {ORDER_STATUS_VALUES.map((status) => (
        <Card key={status} padding={3} aria-label={`${ORDER_STATUS_LABELS[status]} orders`}>
          <VStack gap={2}>
            <OrderStatusBadge status={status} />
            {isLoading ? (
              <Skeleton
                width="50%"
                height="var(--spacing-7)"
                radius="rounded"
              />
            ) : (
              <Text size="2xl" weight="bold" hasTabularNumbers>
                {Number(summary[status] || 0).toLocaleString('vi-VN')}
              </Text>
            )}
          </VStack>
        </Card>
      ))}
    </Grid>
  </VStack>
);

export default OrderSummaryCards;
