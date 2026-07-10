import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  ClickableCard,
  HStack,
  Text,
  VStack
} from '@astryxdesign/core';
import {
  formatPrice,
  getProductImageSrc,
  getStockLabel,
  getStockVariant,
  truncateText
} from './productUtils';
import ProductRatingBadge from './ProductRatingBadge';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const categoryName = product?.category?.name || 'Chưa phân loại';
  const stockLabel = getStockLabel(product?.quantity);
  const stockVariant = getStockVariant(product?.quantity);

  return (
    <ClickableCard
      label={`Xem chi tiết ${product.name}`}
      onClick={() => navigate(`/products/${product.id}`)}
      padding={4}
      variant="default"
      style={{ '--_card-radius': 'var(--radius-none)' }}
    >
      <VStack gap={3}>
        <VStack
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            borderRadius: 'var(--radius-none)',
            backgroundColor: 'var(--color-background-muted)'
          }}
        >
          <img
            src={getProductImageSrc(product.imageUrl)}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            loading="lazy"
          />
        </VStack>

        <HStack gap={2} style={{ flexWrap: 'wrap' }}>
          <Badge variant="blue" label={categoryName} />
          <Badge variant={stockVariant} label={stockLabel} />
          <ProductRatingBadge product={product} />
        </HStack>

        <VStack gap={1}>
          <Text weight="semibold">{product.name}</Text>
          <Text size="supporting" color="secondary">
            {product.brand}
          </Text>
          <Text weight="semibold" color="accent">
            {formatPrice(product.price)}
          </Text>
        </VStack>

        {product.description && (
          <Text size="supporting" color="secondary">
            {truncateText(product.description, 110)}
          </Text>
        )}
      </VStack>
    </ClickableCard>
  );
};

export default ProductCard;
