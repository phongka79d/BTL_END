import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  EmptyState,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@astryxdesign/core';
import { orderApi } from '../api/orderApi';
import Alert from '../components/common/Alert';
import OrderDetailPanel from '../components/order/OrderDetailPanel';

/**
 * OrderDetailView
 *
 * Displays the full detail for a single customer-owned order.
 * Consumes GET /api/orders/:id via orderApi.getOrderById.
 *
 * States handled: loading, not found (404), permission denied (403),
 * API error (other 4xx/5xx/network), and success.
 *
 * Design doc compliance: §§12.2, 24.9 (OrderDetailPanel with order
 * information, shipping address, payment information, order items,
 * order status, navigation back to order history).
 *
 * ponytail: If order detail API grows new fields (tracking, delivery
 *           timeline, multiple payments), extend OrderDetailPanel
 *           rather than adding more sections to this view directly.
 */
export const OrderDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [httpStatus, setHttpStatus] = useState(null);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHttpStatus(null);

    try {
      const response = await orderApi.getOrderById(id);
      const data = response?.data || response;

      if (!data || !data.id) {
        setError('Order not found.');
        setHttpStatus(404);
        return;
      }

      setOrder(data);
    } catch (err) {
      setError(
        err?.message || 'Unable to load order details. Please try again.'
      );
      setHttpStatus(err?.status || null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Skeleton width="220px" height="var(--spacing-8)" radius="rounded" />
          <Skeleton width="300px" height="var(--spacing-5)" radius="rounded" />
        </VStack>

        <Card padding={4}>
          <VStack gap={3}>
            {[0, 1, 2, 3].map((index) => (
              <Skeleton
                key={index}
                width="100%"
                height="var(--spacing-10)"
                radius={2}
              />
            ))}
          </VStack>
        </Card>
      </VStack>
    );
  }

  /* ---------- Not Found ---------- */
  if (httpStatus === 404) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <EmptyState
          title="Order not found"
          description="The order you are looking for does not exist or may have been removed."
          actions={
            <HStack
              gap={3}
              style={{ justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                label="Back to orders"
                variant="primary"
                onClick={() => navigate('/orders')}
              />
              <Button
                label="Browse products"
                variant="secondary"
                onClick={() => navigate('/products')}
              />
            </HStack>
          }
        />
      </VStack>
    );
  }

  /* ---------- Permission Denied ---------- */
  if (httpStatus === 403) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <EmptyState
          title="Access denied"
          description="You do not have permission to view this order."
          actions={
            <HStack
              gap={3}
              style={{ justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                label="Back to orders"
                variant="primary"
                onClick={() => navigate('/orders')}
              />
              <Button
                label="Return home"
                variant="secondary"
                onClick={() => navigate('/')}
              />
            </HStack>
          }
        />
      </VStack>
    );
  }

  /* ---------- API Error ---------- */
  if (error) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <Alert
          title="Unable to load order"
          description={error}
          actionLabel="Retry"
          onAction={fetchOrder}
        />

        <HStack style={{ justifyContent: 'center' }}>
          <Button
            label="Back to orders"
            variant="secondary"
            onClick={() => navigate('/orders')}
          />
        </HStack>
      </VStack>
    );
  }

  /* ---------- Success ---------- */
  return (
    <VStack
      style={{
        width: '100%',
        maxWidth: '800px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)',
      }}
    >
      <VStack gap={1}>
        <HStack
          gap={2}
          style={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Heading level={1}>Order Detail</Heading>
        </HStack>
        <Text color="secondary">
          View the details for your order.
        </Text>
      </VStack>

      <HStack style={{ justifyContent: 'flex-start' }}>
        <Button
          label="← Back to orders"
          variant="ghost"
          size="small"
          onClick={() => navigate('/orders')}
        />
      </HStack>

      <OrderDetailPanel order={order} />

      <HStack style={{ justifyContent: 'flex-start' }}>
        <Button
          label="← Back to orders"
          variant="ghost"
          size="small"
          onClick={() => navigate('/orders')}
        />
      </HStack>
    </VStack>
  );
};

export default OrderDetailView;
