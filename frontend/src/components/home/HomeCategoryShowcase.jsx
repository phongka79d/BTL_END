import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, ClickableCard, Grid, HStack, Heading, Text, VStack } from '@astryxdesign/core';
import {
  formatPrice,
  getProductImageSrc,
  getStockLabel,
  getStockVariant
} from '../product/productUtils';
import ProductRatingBadge from '../product/ProductRatingBadge';

export const HomeProductTile = ({ product }) => {
  const navigate = useNavigate();

  return (
    <ClickableCard
      label={`Xem ${product.name}`}
      onClick={() => navigate(`/products/${product.id}`)}
      padding={0}
      variant="transparent"
      style={{ '--_card-radius': 'var(--radius-container)' }}
    >
      <VStack gap={2}>
        <VStack
          style={{
            aspectRatio: '16 / 9',
            borderRadius: 'var(--radius-container)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-background-muted)'
          }}
        >
          <img
            src={getProductImageSrc(product.imageUrl)}
            alt={product.name}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </VStack>
        <VStack gap={1}>
          <Text weight="semibold">{product.name}</Text>
          <HStack gap={2} style={{ flexWrap: 'wrap' }}>
            <Badge variant="blue" label={product.category?.name || 'Chưa phân loại'} />
            <Badge variant={getStockVariant(product.quantity)} label={getStockLabel(product.quantity)} />
            <ProductRatingBadge product={product} />
          </HStack>
          <Text color="accent" size="supporting" weight="semibold">
            {formatPrice(product.price)}
          </Text>
        </VStack>
      </VStack>
    </ClickableCard>
  );
};

export const HomeSection = ({ title, children }) => (
  <VStack gap={4}>
    <Heading level={2}>{title}</Heading>
    {children}
  </VStack>
);

export const HomeCategoryShowcase = ({ products = [] }) => (
  <HomeSection title="Sản phẩm nổi bật">
    <Grid columns={{ minWidth: 200, max: 6 }} gap={4}>
      {products.map((product) => (
        <HomeProductTile key={product.id} product={product} />
      ))}
    </Grid>
  </HomeSection>
);

export default HomeCategoryShowcase;
