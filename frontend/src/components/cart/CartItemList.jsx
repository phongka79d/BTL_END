import React from 'react';
import { Button, Card, CheckboxInput, EmptyState, Grid, Heading, HStack, Skeleton, Text, VStack } from '@astryxdesign/core';
import Alert from '../common/Alert';
import { CartIcon } from '../common/LayoutIcons';
import CartItem from './CartItem';

const CartItemSkeleton = () => (
  <Card padding={4}>
    <VStack gap={4}>
      <Grid columns={{ minWidth: 220, max: 3 }} gap={4} style={{ alignItems: 'center' }}>
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
  draftQuantities = {},
  selectedItemIds = [],
  onSelectAll,
  onSelectionChange,
  onRemove,
  pendingItemId = null,
  pendingAction = null,
  isBusy = false
}) => {
  const selectedItemIdSet = new Set(selectedItemIds);
  const selectedProductCount = items.filter((item) => selectedItemIdSet.has(item.id)).length;
  const selectAllValue = selectedProductCount === 0
    ? false
    : selectedProductCount === items.length
      ? true
      : 'indeterminate';

  if (isLoading) {
    return (
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={2}>Sản phẩm trong giỏ hàng</Heading>
          <Text color="secondary">Đang tải giỏ hàng từ backend.</Text>
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
        title="Không thể tải giỏ hàng"
        description={error}
        actionLabel="Thử lại"
        onAction={onRetry}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Hãy xem danh mục và thêm sản phẩm để bắt đầu tạo đơn hàng."
        icon={<CartIcon />}
        actions={(
          <Button
            label="Xem sản phẩm"
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
        <HStack gap={3} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <CheckboxInput
            label="Chọn tất cả sản phẩm"
            value={selectAllValue}
            onChange={onSelectAll}
            size="sm"
            isDisabled={isBusy}
          />
          <Heading level={2}>Sản phẩm trong giỏ hàng</Heading>
        </HStack>
        <Text color="secondary">
          Đã chọn {selectedProductCount}/{items.length} sản phẩm để thanh toán. Hãy lưu thay đổi số lượng trước khi thanh toán.
        </Text>
      </VStack>

      <VStack gap={3}>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            quantity={draftQuantities[item.id] ?? item.quantity}
            isSelected={selectedItemIdSet.has(item.id)}
            onSelectionChange={(isSelected) => onSelectionChange?.(item.id, isSelected)}
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
