import React from 'react';
import { Button, Card, EmptyState, Grid, Heading, HStack, Skeleton, Text, VStack } from '@astryxdesign/core';
import Alert from '../common/Alert';
import { CartIcon } from '../common/LayoutIcons';
import CartItem from './CartItem';

const CartItemSkeleton = () => (
  <Card padding={4}>
    <VStack gap={4}>
      <Grid columns={{ minWidth: 220, max: 2 }} gap={4} style={{ alignItems: 'start' }}>
        <HStack gap={3} style={{ alignItems: 'flex-start' }}>
          <VStack
            style={{
              width: '6rem',
              aspectRatio: '1',
              overflow: 'hidden',
              borderRadius: 'var(--radius-element)'
            }}
          >
            <Skeleton width="100%" height="100%" radius="rounded" />
          </VStack>

          <VStack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Skeleton width="72%" height="var(--spacing-5)" radius="rounded" />
            <Skeleton width="46%" height="var(--spacing-4)" radius="rounded" />
            <Skeleton width="60%" height="var(--spacing-4)" radius="rounded" />
          </VStack>
        </HStack>

        <VStack gap={3}>
          <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
          <Skeleton width="70%" height="var(--spacing-10)" radius="rounded" />
        </VStack>
      </Grid>

      <Skeleton width="100%" height="var(--spacing-4)" radius="rounded" />
    </VStack>
  </Card>
);

export const CartItemList = ({
  items = [],
  isLoading = false,
  error = null,
  onRetry,
  onBrowseProducts,
  onQuantityChange,
  onRemove,
  pendingItemId = null,
  pendingAction = null,
  isBusy = false
}) => {
  if (isLoading) {
    return (
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Cart items</Heading>
          <Text color="secondary">Loading your cart from the backend.</Text>
        </VStack>

        <VStack gap={3}>
          <CartItemSkeleton />
          <CartItemSkeleton />
        </VStack>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert
        title="Unable to load cart"
        description={error}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the catalog and add products to start building an order."
        icon={<CartIcon />}
        actions={(
          <Button
            label="Browse products"
            variant="primary"
            onClick={onBrowseProducts}
          />
        )}
      />
    );
  }

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Cart items</Heading>
        <Text color="secondary">
          Update quantities or remove items. The backend will refresh the subtotal after each change.
        </Text>
      </VStack>

      <VStack gap={3}>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            isBusy={isBusy && pendingItemId === item.id}
            pendingAction={pendingItemId === item.id ? pendingAction : null}
          />
        ))}
      </VStack>
    </VStack>
  );
};

export default CartItemList;
