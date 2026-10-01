import React, { useMemo } from 'react';
import {
  Badge,
  Button,
  Card,
  Collapsible,
  CollapsibleGroup,
  Divider,
  Grid,
  Heading,
  HStack,
  TextInput,
  Text,
  VStack
} from '@astryxdesign/core';
import { formatPrice } from './productUtils';

const getAverageRating = (reviews = []) => {
  const ratings = reviews
    .map((review) => Number(review?.rating))
    .filter((rating) => Number.isFinite(rating));

  if (!ratings.length) {
    return null;
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return total / ratings.length;
};

const ProductMetaItem = ({ label, value }) => (
  <VStack gap={1}>
    <Text size="supporting" color="secondary" weight="semibold">
      {label}
    </Text>
    <Text>{value}</Text>
  </VStack>
);

const getSteppedQuantity = (quantity, step, maxQuantity) => {
  const parsed = Number(quantity);
  const baseQuantity = Number.isInteger(parsed) ? parsed : 1;
  const upperBound = Math.max(1, Number(maxQuantity) || 1);
  return String(Math.min(Math.max(1, baseQuantity + step), upperBound));
};

export const ProductPurchasePanel = ({
  actionLoading,
  availableQuantity,
  isAuthenticated,
  isReviewsLoading,
  maxSelectableQuantity,
  onAddToCart,
  onBackToProducts,
  onQuantityChange,
  product,
  quantity,
  quantityStatus,
  reviews = [],
  stockLabel,
  stockVariant
}) => {
  const averageRating = useMemo(() => getAverageRating(reviews), [reviews]);
  const reviewCount = reviews.length;
  const currentQuantity = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
  const upperBound = Math.max(1, Number(maxSelectableQuantity) || 1);

  return (
    <Card padding={5}>
      <VStack gap={5}>
        <VStack gap={3}>
          <HStack gap={2} style={{ flexWrap: 'wrap' }}>
            <Badge variant="blue" label={product.category?.name || 'Chưa phân loại'} />
            <Badge variant={stockVariant} label={stockLabel} />
          </HStack>

          <VStack gap={1}>
            <Heading level={1}>{product.name}</Heading>
            <Text size="supporting" color="secondary">
              {product.brand || 'Chưa có thương hiệu'}
            </Text>
          </VStack>

          <HStack gap={3} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Text weight="semibold" color="accent" style={{ fontSize: 'var(--text-heading-3-size)' }}>
              {formatPrice(product.price)}
            </Text>
            {isReviewsLoading ? (
              <Text size="supporting" color="secondary">
                Loading reviews
              </Text>
            ) : averageRating !== null ? (
              <Badge
                variant="yellow"
                label={`${averageRating.toFixed(1)}/5 (${reviewCount})`}
              />
            ) : (
              <Text size="supporting" color="secondary">
                No reviews yet
              </Text>
            )}
          </HStack>
        </VStack>

        <Text>{product.description || 'Chưa có mô tả cho sản phẩm này.'}</Text>

        <Divider />

        <VStack gap={3}>
          <HStack gap={1} style={{ alignItems: 'flex-start' }}>
            <Button
              label="-"
              variant="secondary"
              size="sm"
              isDisabled={availableQuantity < 1 || actionLoading || currentQuantity <= 1}
              onClick={() => onQuantityChange?.(getSteppedQuantity(quantity, -1, upperBound))}
              aria-label="Giảm số lượng"
            />
            <TextInput
              label="Quantity"
              value={String(quantity ?? '')}
              onChange={onQuantityChange}
              inputMode="numeric"
              isDisabled={availableQuantity < 1 || actionLoading}
              description={
                availableQuantity > 0
                  ? `Choose a quantity from 1 to ${maxSelectableQuantity}. Final stock validation still happens on the backend.`
                  : 'Sản phẩm này chưa khả dụng cho đến khi được bổ sung tồn kho.'
              }
              status={quantityStatus || undefined}
              width="100%"
            />
            <Button
              label="+"
              variant="secondary"
              size="sm"
              isDisabled={availableQuantity < 1 || actionLoading || currentQuantity >= upperBound}
              onClick={() => onQuantityChange?.(getSteppedQuantity(quantity, 1, upperBound))}
              aria-label="Tăng số lượng"
            />
          </HStack>

          <VStack gap={2}>
            <Button
              label="Add to cart"
              variant="primary"
              size="lg"
              isLoading={actionLoading}
              isDisabled={availableQuantity < 1 || actionLoading || quantityStatus?.type === 'error'}
              onClick={onAddToCart}
            />
            <Button
              label="Back to products"
              variant="secondary"
              size="lg"
              onClick={onBackToProducts}
            />
          </VStack>
        </VStack>

        {!isAuthenticated && (
          <Text size="supporting" color="secondary">
            Sign in to complete cart actions and keep your cart synchronized across sessions.
          </Text>
        )}

        <CollapsibleGroup type="multiple" defaultValue={['description', 'details']}>
          <Divider />
          <Collapsible value="description" trigger={<Heading level={3}>Description</Heading>}>
            <Text>{product.description || 'Chưa có mô tả cho sản phẩm này.'}</Text>
          </Collapsible>
          <Divider />
          <Collapsible value="details" trigger={<Heading level={3}>Product details</Heading>}>
            <Grid columns={{ minWidth: 160, max: 2 }} gap={3}>
              <ProductMetaItem label="Danh mục" value={product.category?.name || 'Chưa phân loại'} />
              <ProductMetaItem label="Thương hiệu" value={product.brand || 'Chưa có thương hiệu'} />
              <ProductMetaItem label="Stock status" value={stockLabel} />
              <ProductMetaItem label="Available quantity" value={availableQuantity} />
            </Grid>
          </Collapsible>
          <Divider />
        </CollapsibleGroup>
      </VStack>
    </Card>
  );
};

export default ProductPurchasePanel;
