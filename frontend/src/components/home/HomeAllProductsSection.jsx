import React from 'react';
import { Button, EmptyState, Grid, HStack, Icon, VStack } from '@astryxdesign/core';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import { HomeProductTile, HomeSection } from './HomeCategoryShowcase';

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price', label: 'Price' },
  { value: 'review', label: 'Good review' },
  { value: 'orders', label: 'Order number' },
];

export const HomeAllProductsSection = ({
  error,
  isLoading,
  onLoadMore,
  onRetry,
  onSortChange,
  pagination,
  products = [],
  sort,
}) => {
  const canLoadMore = pagination && pagination.page < pagination.totalPages;

  return (
    <HomeSection title="All products">
      <VStack gap={4}>
        <HStack gap={2} wrap="wrap">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              label={option.label}
              variant={sort === option.value ? 'primary' : 'secondary'}
              isDisabled={isLoading}
              onClick={() => onSortChange(option.value)}
            />
          ))}
        </HStack>

        {error ? (
          <Alert
            title="Unable to load products"
            description={error}
            actionLabel="Retry"
            onAction={onRetry}
          />
        ) : isLoading && !products.length ? (
          <Loading count={6} />
        ) : !products.length ? (
          <EmptyState
            title="No products available"
            description="Products will appear here when the catalog is available."
            icon={<Icon icon="search" />}
            actions={onRetry ? (
              <Button label="Retry" variant="secondary" onClick={onRetry} />
            ) : undefined}
          />
        ) : (
          <VStack gap={4}>
            <Grid columns={{ minWidth: 200, max: 6 }} gap={4}>
              {products.map((product) => (
                <HomeProductTile key={product.id} product={product} />
              ))}
            </Grid>

            {canLoadMore && (
              <HStack justify="center">
                <Button
                  label="Load more"
                  variant="secondary"
                  isLoading={isLoading}
                  onClick={onLoadMore}
                />
              </HStack>
            )}
          </VStack>
        )}
      </VStack>
    </HomeSection>
  );
};

export default HomeAllProductsSection;
