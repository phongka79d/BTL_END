import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  HStack,
  NumberInput,
  Text,
  VStack
} from '@astryxdesign/core';
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
  onQuantityChange,
  onRemove,
  isBusy = false,
  pendingAction = null
}) => {
  const availableStock = Number(item?.product?.quantity ?? 0);
  const initialQuantity = Number(item?.quantity ?? 1);
  const [draftQuantity, setDraftQuantity] = useState(initialQuantity);

  useEffect(() => {
    setDraftQuantity(initialQuantity);
  }, [initialQuantity, item?.id]);

  const maxQuantity = Math.max(1, availableStock, initialQuantity);
  const quantityChanged = draftQuantity !== initialQuantity;
  const stockLabel = getStockLabel(availableStock);
  const stockVariant = getStockVariant(availableStock);

  const lineSubtotal = useMemo(() => {
    const unitPrice = Number(item?.unitPrice ?? 0);
    const quantity = Number(item?.quantity ?? 0);
    return formatPrice(unitPrice * quantity);
  }, [item?.quantity, item?.unitPrice]);

  const handleQuantityChange = (value) => {
    setDraftQuantity(clampQuantity(value, maxQuantity));
  };

  const handleUpdate = () => {
    const nextQuantity = clampQuantity(draftQuantity, maxQuantity);
    if (nextQuantity === initialQuantity) {
      return;
    }

    onQuantityChange?.(item.id, nextQuantity);
  };

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <Grid columns={{ minWidth: 220, max: 2 }} gap={4} style={{ alignItems: 'start' }}>
          <HStack gap={3} style={{ alignItems: 'flex-start', minWidth: 0 }}>
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

          <VStack gap={3}>
            <NumberInput
              label="Quantity"
              value={draftQuantity}
              onChange={handleQuantityChange}
              min={1}
              max={maxQuantity}
              step={1}
              isIntegerOnly
              isDisabled={isBusy}
              description={`Current stock allows up to ${maxQuantity}.`}
            />

            <HStack gap={2} style={{ flexWrap: 'wrap' }}>
              <Button
                label="Update"
                variant="primary"
                isDisabled={!quantityChanged || isBusy}
                isLoading={isBusy && pendingAction === 'update'}
                onClick={handleUpdate}
              />
              <Button
                label="Remove"
                variant="secondary"
                isDisabled={isBusy}
                isLoading={isBusy && pendingAction === 'remove'}
                onClick={() => onRemove?.(item.id)}
              />
            </HStack>
          </VStack>
        </Grid>

        <Divider />

        <HStack style={{ justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <Text size="supporting" color="secondary">
            Line subtotal
          </Text>
          <Text weight="semibold">
            {lineSubtotal}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
};

export default CartItem;
