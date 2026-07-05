import React from 'react';
import { Card, HStack, Table, Text, VStack } from '@astryxdesign/core';
import { formatPrice } from '../product/productUtils';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

const sectionLabelStyle = {
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

/**
 * OrderDetailPanel
 *
 * Presents a single order's full detail: shipping address, order items,
 * order status, payment status, and total.
 *
 * Design doc compliance: §12.2 OrderDetailPanel (Order information,
 * Shipping address, Payment information, Order items, Order status).
 *
 * ponytail: If the backend response adds tracking numbers, delivery dates,
 *           or additional payment fields, extend the relevant sections
 *           without changing the panel's overall layout strategy.
 */
export const OrderDetailPanel = ({ order }) => {
  const {
    id,
    status,
    totalAmount,
    shippingAddress,
    createdAt,
    payment,
    details = [],
  } = order;

  const columns = [
    {
      key: 'product',
      header: 'Product',
      renderCell: (detail) => (
        <VStack gap={0}>
          <Text weight="semibold">{detail.product?.name || '—'}</Text>
          <Text size="supporting" color="secondary">
            {detail.product?.brand || '—'}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'end',
      renderCell: (detail) => (
        <Text hasTabularNumbers>×{detail.quantity}</Text>
      ),
    },
    {
      key: 'price',
      header: 'Unit Price',
      align: 'end',
      renderCell: (detail) => (
        <Text hasTabularNumbers>{formatPrice(detail.price)}</Text>
      ),
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      align: 'end',
      renderCell: (detail) => (
        <Text weight="semibold" hasTabularNumbers>
          {formatPrice(Number(detail.price) * Number(detail.quantity))}
        </Text>
      ),
    },
  ];

  return (
    <VStack gap={4} style={{ width: '100%' }}>
      {/* Order Information */}
      <Card padding={4}>
        <VStack gap={3}>
          <Text size="supporting" color="accent" weight="semibold" style={sectionLabelStyle}>
            Order Information
          </Text>
          <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Text color="secondary">Order</Text>
            <Text weight="semibold" hasTabularNumbers>
              #{id.slice(0, 8)}…
            </Text>
            <OrderStatusBadge status={status} />
          </HStack>
          <HStack gap={1}>
            <Text color="secondary">Placed on</Text>
            <Text>{formatDate(createdAt)}</Text>
          </HStack>
        </VStack>
      </Card>

      {/* Shipping Address */}
      <Card padding={4}>
        <VStack gap={2}>
          <Text size="supporting" color="accent" weight="semibold" style={sectionLabelStyle}>
            Shipping Address
          </Text>
          <Text>{shippingAddress || '—'}</Text>
        </VStack>
      </Card>

      {/* Payment Information */}
      {payment && (
        <Card padding={4}>
          <VStack gap={3}>
            <Text size="supporting" color="accent" weight="semibold" style={sectionLabelStyle}>
              Payment Information
            </Text>
            <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Text color="secondary">Method</Text>
              <Text weight="semibold">{payment.paymentMethod}</Text>
            </HStack>
            <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Text color="secondary">Status</Text>
              <PaymentStatusBadge status={payment.paymentStatus} />
            </HStack>
            {payment.paymentDate && (
              <HStack gap={1}>
                <Text color="secondary">Paid on</Text>
                <Text>{formatDate(payment.paymentDate)}</Text>
              </HStack>
            )}
          </VStack>
        </Card>
      )}

      {/* Order Items */}
      <Card padding={0}>
        <VStack gap={0}>
          <VStack gap={1} style={{ padding: 'var(--spacing-4)' }}>
            <Text size="supporting" color="accent" weight="semibold" style={sectionLabelStyle}>
              Order Items
            </Text>
          </VStack>
          <Table
            columns={columns}
            data={details}
            idKey="id"
            density="balanced"
            dividers="rows"
            hasHover
            textOverflow="truncate"
          />
        </VStack>
      </Card>

      {/* Order Total */}
      <Card padding={4}>
        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text weight="semibold" size="supporting">
            Order Total
          </Text>
          <Text weight="bold" color="accent" hasTabularNumbers>
            {formatPrice(totalAmount)}
          </Text>
        </HStack>
      </Card>
    </VStack>
  );
};

export default OrderDetailPanel;
