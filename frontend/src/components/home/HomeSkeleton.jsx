import React from 'react';
import { Card, Grid, HStack, Skeleton, VStack } from '@astryxdesign/core';

const skeletonTiles = ['one', 'two', 'three', 'four', 'five', 'six'];
const skeletonIndicators = ['one', 'two', 'three', 'four'];
const activeSkeletonIndicator = 'two';

const HomeSkeletonHero = () => (
  <Card
    variant="muted"
    padding={0}
    width="100%"
    height="calc(var(--spacing-8) * 11)"
    style={{
      '--_card-radius': 'var(--radius-container)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <VStack
      gap={5}
      style={{
        height: '100%',
        justifyContent: 'center',
        maxWidth: 'calc(var(--spacing-8) * 19)',
        paddingInline: 'clamp(calc(var(--spacing-8) + var(--spacing-4)), 7vw, calc(var(--spacing-8) * 3))'
      }}
    >
      <VStack gap={3}>
        <HStack gap={2}>
          <Skeleton width="calc(var(--spacing-8) * 3)" height="var(--spacing-5)" radius="rounded" />
          <Skeleton width="calc(var(--spacing-8) * 2)" height="var(--spacing-5)" radius="rounded" />
        </HStack>
        <Skeleton width="72%" height="var(--spacing-7)" radius="rounded" />
        <Skeleton width="84%" height="var(--spacing-5)" radius="rounded" />
        <Skeleton width="32%" height="var(--spacing-5)" radius="rounded" />
      </VStack>

      <HStack gap={3}>
        <Skeleton width="calc(var(--spacing-8) * 3)" height="var(--spacing-10)" radius="rounded" />
        <Skeleton width="calc(var(--spacing-8) * 3.5)" height="var(--spacing-10)" radius="rounded" />
      </HStack>
    </VStack>

    <HStack
      style={{
        position: 'absolute',
        insetInline: 'var(--spacing-5)',
        top: '50%',
        justifyContent: 'space-between',
        transform: 'translateY(-50%)'
      }}
    >
      <Card
        variant="transparent"
        padding={0}
        width="var(--spacing-7)"
        height="var(--spacing-7)"
        style={{
          '--_card-radius': 'var(--radius-full)',
          backgroundColor: 'color-mix(in srgb, var(--color-text-primary) 18%, transparent)'
        }}
      />
      <Card
        variant="transparent"
        padding={0}
        width="var(--spacing-7)"
        height="var(--spacing-7)"
        style={{
          '--_card-radius': 'var(--radius-full)',
          backgroundColor: 'color-mix(in srgb, var(--color-text-primary) 18%, transparent)'
        }}
      />
    </HStack>

    <HStack
      gap={1}
      style={{
        position: 'absolute',
        insetInline: 0,
        bottom: 'var(--spacing-4)',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {skeletonIndicators.map((indicator) => {
        const isActive = indicator === activeSkeletonIndicator;

        return (
          <Card
            key={indicator}
            variant="transparent"
            padding={0}
            width={isActive ? 'var(--spacing-6)' : 'var(--spacing-3)'}
            height="var(--spacing-3)"
            style={{
              '--_card-radius': 'var(--radius-full)',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: isActive
                ? 'color-mix(in srgb, var(--color-text-primary) 42%, transparent)'
                : 'color-mix(in srgb, var(--color-text-primary) 35%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-text-primary) 28%, transparent)'
            }}
          >
            {isActive && (
              <VStack
                aria-hidden
                style={{
                  position: 'absolute',
                  insetBlock: 0,
                  insetInlineStart: 0,
                  width: '64%',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-text-primary)'
                }}
              />
            )}
          </Card>
        );
      })}
    </HStack>
  </Card>
);

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
    <HomeSkeletonHero />
    <HomeSkeletonSection />
    <HomeSkeletonSection />
  </VStack>
);

export default HomeSkeleton;
