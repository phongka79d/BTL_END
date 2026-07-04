import React from 'react';
import { Card, Grid, Skeleton, VStack } from '@astryxdesign/core';

const LoadingCard = () => (
  <Card padding={4} style={{ '--_card-radius': 'var(--radius-none)' }}>
    <VStack gap={3}>
      <VStack
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          overflow: 'hidden',
          borderRadius: 'var(--radius-none)'
        }}
      >
        <Skeleton width="100%" height="100%" radius="none" />
      </VStack>
      <Skeleton width="72%" height="var(--spacing-5)" radius="rounded" />
      <Skeleton width="44%" height="var(--spacing-4)" radius="rounded" />
      <Skeleton width="60%" height="var(--spacing-4)" radius="rounded" />
    </VStack>
  </Card>
);

export const Loading = ({ count = 6 }) => {
  return (
    <Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </Grid>
  );
};

export default Loading;
