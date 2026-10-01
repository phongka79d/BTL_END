import React from 'react';
import { Card, HStack, Table, Text, VStack } from '@astryxdesign/core';
import { formatPrice } from '../product/productUtils';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import { getOrderRecipient } from './orderRecipientUtils.js';

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
 * Trình bày đầy đủ chi tiết một đơn hàng: địa chỉ giao hàng, các mục đơn hàng,
 * trạng thái đơn hàng, trạng thái thanh toán và tổng tiền.
 *
 * Tuân thủ tài liệu thiết kế: §12.2 OrderDetailPanel (thông tin đơn hàng,
 * địa chỉ giao hàng, thông tin thanh toán, các mục đơn hàng, trạng thái đơn hàng).
 *
 * ponytail: Nếu phản hồi backend bổ sung mã theo dõi, ngày giao hàng
 *           hoặc các trường thanh toán khác, hãy mở rộng các phần liên quan
 *           mà không thay đổi chiến lược bố cục tổng thể của bảng.
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

  const recipient = getOrderRecipient(order);

  const columns = [
    {
      key: 'product',
      header: 'Sản phẩm',
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
      header: 'SL',
      align: 'end',
      renderCell: (detail) => (
        <Text hasTabularNumbers>×{detail.quantity}</Text>
      ),
    },
    {
      key: 'price',
      header: 'Đơn giá',
      align: 'end',
      renderCell: (detail) => (
        <Text hasTabularNumbers>{formatPrice(detail.price)}</Text>
      ),
    },
    {
      key: 'subtotal',
      header: 'Tạm tính',
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
      {/* Thông tin đơn hàng */}
      <Card padding={4}>
        <VStack gap={3}>
          <Text size="supporting" color="accent" weight="semibold" style={sectionLabelStyle}>
            Order Information
          </Text>
          <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Text color="secondary">Đơn hàng</Text>
            <Text weight="semibold" hasTabularNumbers>
              #{id.slice(0, 8)}…
            </Text>
            <OrderStatusBadge status={status} />
          </HStack>
          <HStack gap={1}>
            <Text color="secondary">Ngày đặt</Text>
            <Text>{formatDate(createdAt)}</Text>
          </HStack>
        </VStack>
      </Card>

      {/* Thông tin người nhận và địa chỉ giao hàng */}
      <Card padding={4}>
        <VStack gap={2}>
          <Text size="supporting" color="accent" weight="semibold" style={sectionLabelStyle}>
            Shipping Address
          </Text>
          <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Text color="secondary">Người nhận</Text>
            <Text weight="semibold">{recipient.name}</Text>
          </HStack>
          <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Text color="secondary">Số điện thoại</Text>
            <Text>{recipient.phone}</Text>
          </HStack>
          <Text>{shippingAddress || '—'}</Text>
          {recipient.note && (
            <HStack gap={2} style={{ alignItems: 'flex-start' }}>
              <Text color="secondary">Ghi chú</Text>
              <Text>{recipient.note}</Text>
            </HStack>
          )}
        </VStack>
      </Card>

      {/* Thông tin thanh toán */}
      {payment && (
        <Card padding={4}>
          <VStack gap={3}>
            <Text size="supporting" color="accent" weight="semibold" style={sectionLabelStyle}>
              Payment Information
            </Text>
            <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Text color="secondary">Phương thức</Text>
              <Text weight="semibold">{payment.paymentMethod}</Text>
            </HStack>
            <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Text color="secondary">Trạng thái</Text>
              <PaymentStatusBadge status={payment.paymentStatus} />
            </HStack>
            {payment.paymentDate && (
              <HStack gap={1}>
                <Text color="secondary">Ngày thanh toán</Text>
                <Text>{formatDate(payment.paymentDate)}</Text>
              </HStack>
            )}
          </VStack>
        </Card>
      )}

      {/* Các mục đơn hàng */}
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

      {/* Tổng tiền đơn hàng */}
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
