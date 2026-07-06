import React from 'react';
import { Card, Grid, VStack } from '@astryxdesign/core';

const skeletonTiles = ['one', 'two', 'three', 'four', 'five', 'six'];

const HomeSkeletonSection = () => (
  <VStack gap={4}>
    <Card
      variant="muted"
      padding={0}
      width="calc(var(--spacing-8) * 8)"
      height="var(--spacing-6)"
      style={{ '--_card-radius': 'var(--radius-full)' }}
    />
    <Grid columns={{ minWidth: 200, max: 6 }} gap={4}>
      {skeletonTiles.map((tile) => (
        <VStack key={tile} gap={2}>
          <Card
            variant="muted"
            padding={0}
            width="100%"
            height="calc(var(--spacing-8) * 4)"
            style={{ '--_card-radius': 'var(--radius-container)' }}
          />
          <Card
            variant="muted"
            padding={0}
            width="60%"
            height="var(--spacing-4)"
            style={{ '--_card-radius': 'var(--radius-full)' }}
          />
        </VStack>
      ))}
    </Grid>
  </VStack>
);

export const HomeSkeleton = () => (
  <VStack gap={10}>
    <Card
      variant="muted"
      padding={0}
      width="100%"
      height="calc(var(--spacing-8) * 11)"
      style={{ '--_card-radius': 'var(--radius-container)' }}
    />
    <HomeSkeletonSection />
    <HomeSkeletonSection />
  </VStack>
);

export default HomeSkeleton;
