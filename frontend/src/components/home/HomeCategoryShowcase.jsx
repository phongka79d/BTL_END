import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, ClickableCard, Grid, HStack, Heading, Text, VStack } from '@astryxdesign/core';
import {
  formatPrice,
  getProductImageSrc,
  getStockLabel,
  getStockVariant,
  truncateText
} from '../product/productUtils';
import { toCategoryProductCount } from './homeContent';

const HomeProductTile = ({ product }) => {
  const navigate = useNavigate();

  return (
    <ClickableCard
      label={`View ${product.name}`}
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
            <Badge variant="blue" label={product.category?.name || 'Uncategorized'} />
            <Badge variant={getStockVariant(product.quantity)} label={getStockLabel(product.quantity)} />
          </HStack>
          <Text color="accent" size="supporting" weight="semibold">
            {formatPrice(product.price)}
          </Text>
        </VStack>
      </VStack>
    </ClickableCard>
  );
};

const HomeCategoryTile = ({ category, productCount }) => {
  const navigate = useNavigate();

  return (
    <ClickableCard
      label={`Browse ${category.name}`}
      onClick={() => navigate('/products')}
      padding={4}
      variant="muted"
      style={{
        '--_card-radius': 'var(--radius-container)',
        minHeight: 'calc(var(--spacing-8) * 4)'
      }}
    >
      <VStack gap={2} style={{ justifyContent: 'space-between', height: '100%' }}>
        <VStack gap={1}>
          <Text weight="semibold">{category.name}</Text>
          <Text size="supporting" color="secondary">
            {truncateText(category.description || 'Catalog category', 80)}
          </Text>
        </VStack>
        <Badge variant="gray" label={`${productCount} products`} />
      </VStack>
    </ClickableCard>
  );
};

const HomeSection = ({ title, children }) => (
  <VStack gap={4}>
    <Heading level={2}>{title}</Heading>
    {children}
  </VStack>
);

export const HomeCategoryShowcase = ({ categories = [], products = [] }) => {
  const categoryCounts = toCategoryProductCount(products);

  return (
    <VStack gap={10}>
      <HomeSection title="Featured products">
        <Grid columns={{ minWidth: 200, max: 6 }} gap={4}>
          {products.map((product) => (
            <HomeProductTile key={product.id} product={product} />
          ))}
        </Grid>
      </HomeSection>

      {categories.length > 0 && (
        <HomeSection title="Shop by category">
          <Grid columns={{ minWidth: 200, max: 6 }} gap={4}>
            {categories.slice(0, 6).map((category) => (
              <HomeCategoryTile
                key={category.id}
                category={category}
                productCount={categoryCounts[category.id] || 0}
              />
            ))}
          </Grid>
        </HomeSection>
      )}
    </VStack>
  );
};

export default HomeCategoryShowcase;
