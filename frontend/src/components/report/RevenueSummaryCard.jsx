import React from 'react';
import {
  Badge,
  Card,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@astryxdesign/core';
import { formatPrice } from '../product/productUtils';

export const RevenueSummaryCard = ({
  completedOrderCount = 0,
  isLoading = false,
  totalRevenue = 0,
}) => (
  <Card padding={4} aria-label="Tổng quan doanh thu">
    <VStack gap={3}>
      <HStack justify="between" align="center" gap={2}>
        <Heading level={2}>Tổng quan doanh thu</Heading>
        <Badge variant="success" label="COD đã thanh toán" />
      </HStack>

      {isLoading ? (
        <VStack gap={2} aria-label="Đang tải tổng quan doanh thu">
          <Skeleton width="60%" height="var(--spacing-8)" radius="rounded" />
          <Skeleton width="40%" height="var(--spacing-5)" radius="rounded" />
        </VStack>
      ) : (
        <VStack gap={1}>
          <Text size="2xl" weight="bold" hasTabularNumbers>
            {formatPrice(totalRevenue)}
          </Text>
          <Text color="secondary" hasTabularNumbers>
            Đơn hàng hoàn tất: {Number(completedOrderCount || 0).toLocaleString('vi-VN')}
          </Text>
        </VStack>
      )}
    </VStack>
  </Card>
);

export default RevenueSummaryCard;
