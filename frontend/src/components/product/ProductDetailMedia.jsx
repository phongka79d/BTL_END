import React from 'react';
import { AspectRatio, Card, SelectableCard, Text, VStack } from '@astryxdesign/core';
import { getProductImageSrc } from './productUtils';

export const ProductDetailMedia = ({ product }) => {
  const imageSrc = getProductImageSrc(product?.imageUrl);
  const imageAlt = product?.name || 'Product image';

  return (
    <VStack gap={3}>
      <AspectRatio ratio={4 / 3}>
        <Card
          padding={0}
          width="100%"
          height="100%"
          style={{
            '--_card-radius': 'var(--radius-container)',
            overflow: 'hidden',
            backgroundColor: 'var(--color-background-muted)'
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </Card>
      </AspectRatio>

      <SelectableCard
        label="Primary product image"
        isSelected
        onChange={() => {}}
        variant="transparent"
        padding={0}
        width="calc(var(--spacing-8) * 3)"
        height="calc(var(--spacing-8) * 3)"
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 'var(--radius-element)'
          }}
        />
      </SelectableCard>

      {!product?.imageUrl && (
        <Text size="supporting" color="secondary">
          No image URL is set, so the fallback illustration is shown.
        </Text>
      )}
    </VStack>
  );
};

export default ProductDetailMedia;
