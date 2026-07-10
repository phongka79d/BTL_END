import React, { useMemo } from 'react';
import {
  Badge,
  Button,
  Card,
  CheckboxInput,
  Divider,
  Grid,
  HStack,
  IconButton,
  NumberInput,
  Text,
  VStack
} from '@astryxdesign/core';
import { TrashIcon } from '../common/LayoutIcons';
import { formatPrice, getProductImageSrc, getStockLabel, getStockVariant } from '../product/productUtils';

const clampQuantity = (value, maxQuantity) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  const upperBound = Math.max(1, Number(maxQuantity) || 1);
  return Math.min(Math.max(1, Math.floor(parsed)), upperBound);
};

export const CartItem = ({
  item,
  quantity,
  isSelected = false,
  onSelectionChange,
  onQuantityChange,
  onRemove,
  isBusy = false,
  pendingAction = null
}) => {
  const availableStock = Number(item?.product?.quantity ?? 0);
  const currentQuantity = Number(quantity ?? item?.quantity ?? 1);
  const maxQuantity = Math.max(1, availableStock, currentQuantity);
  const stockLabel = getStockLabel(availableStock);
  const stockVariant = getStockVariant(availableStock);

  const lineSubtotal = useMemo(() => {
    const unitPrice = Number(item?.unitPrice ?? 0);
    return formatPrice(unitPrice * currentQuantity);
  }, [currentQuantity, item?.unitPrice]);

  const handleQuantityChange = (value) => {
    onQuantityChange?.(item.id, clampQuantity(value, maxQuantity));
  };

  const handleStepQuantity = (step) => {
    onQuantityChange?.(item.id, clampQuantity(currentQuantity + step, maxQuantity));
  };

  return (
    <Card padding={4}>
      <Grid columns={{ minWidth: 240, max: 2 }} gap={4} style={{ alignItems: 'stretch' }}>
        <HStack gap={3} style={{ alignItems: 'center', minWidth: 0 }}>
          <CheckboxInput
            label={`Select ${item?.product?.name || 'product'} for checkout`}
            isLabelHidden
            value={isSelected}
            onChange={onSelectionChange}
            size="sm"
            isDisabled={isBusy}
          />
          <VStack
            style={{
              width: '6rem',
              aspectRatio: '1',
              overflow: 'hidden',
              borderRadius: 'var(--radius-element)',
              backgroundColor: 'var(--color-background-muted)',
              flexShrink: 0
            }}
          >
            <img
              src={getProductImageSrc(item?.product?.imageUrl)}
              alt={item?.product?.name || 'Cart item'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </VStack>

          <VStack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <VStack gap={1} style={{ minWidth: 0 }}>
              <Text weight="semibold" style={{ overflowWrap: 'anywhere' }}>
                {item?.product?.name || 'Unnamed product'}
              </Text>
              <Text size="supporting" color="secondary" style={{ overflowWrap: 'anywhere' }}>
                {item?.product?.brand || 'Unknown brand'}
              </Text>
            </VStack>

            <HStack gap={2} style={{ flexWrap: 'wrap' }}>
              <Badge variant={stockVariant} label={stockLabel} />
              <Badge variant="blue" label={`Unit ${formatPrice(item?.unitPrice ?? 0)}`} />
            </HStack>
          </VStack>
        </HStack>

        <VStack gap={3} style={{ minWidth: 0 }}>
          <VStack gap={2} style={{ minWidth: 0 }}>
            <Text size="supporting" color="secondary" weight="semibold">
              Quantity
            </Text>
            <HStack gap={1} style={{ alignItems: 'center' }}>
              <Button
                label="-"
                variant="secondary"
                size="sm"
                isDisabled={isBusy || currentQuantity <= 1}
                onClick={() => handleStepQuantity(-1)}
                aria-label={`Decrease quantity for ${item?.product?.name || 'product'}`}
              />
              <NumberInput
                label="Quantity"
                isLabelHidden
                value={currentQuantity}
                onChange={handleQuantityChange}
                min={1}
                max={maxQuantity}
                step={1}
                size="sm"
                isIntegerOnly
                isDisabled={isBusy}
                width="var(--spacing-16)"
              />
              <Button
                label="+"
                variant="secondary"
                size="sm"
                isDisabled={isBusy || currentQuantity >= maxQuantity}
                onClick={() => handleStepQuantity(1)}
                aria-label={`Increase quantity for ${item?.product?.name || 'product'}`}
              />
              <IconButton
                label={`Remove ${item?.product?.name || 'product'} from cart`}
                tooltip="Remove from cart"
                icon={<TrashIcon />}
                variant="destructive"
                size="sm"
                isDisabled={isBusy}
                isLoading={isBusy && pendingAction === 'remove'}
                onClick={() => onRemove?.(item.id)}
              />
            </HStack>
          </VStack>

          <Divider />

          <VStack gap={1}>
            <Text size="supporting" color="secondary">
              Line total
            </Text>
            <Text weight="bold" color="accent" style={{ fontSize: 'var(--text-title-3-size)' }}>
              {lineSubtotal}
            </Text>
          </VStack>
        </VStack>
      </Grid>
    </Card>
  );
};

export default CartItem;
