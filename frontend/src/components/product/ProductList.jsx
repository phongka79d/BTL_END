import React from 'react';
import { Button, EmptyState, Grid, Heading, Icon, Text, VStack } from '@astryxdesign/core';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import Pagination from '../common/Pagination';
import ProductCard from './ProductCard';

export const ProductList = ({
  title,
  description,
  products = [],
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  pagination = null,
  onPageChange,
  skeletonCount = 6
}) => {
  if (isLoading) {
    return (
      <VStack gap={4}>
        {(title || description) && (
          <VStack gap={1}>
            {title && <Heading level={2}>{title}</Heading>}
            {description && <Text color="secondary">{description}</Text>}
          </VStack>
        )}
        <Loading count={skeletonCount} />
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert
        title="Unable to load products"
        description={error}
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<Icon icon="search" />}
        actions={onRetry ? (
          <Button
            label="Try again"
            variant="secondary"
            onClick={onRetry}
          />
        ) : undefined}
      />
    );
  }

  return (
    <VStack gap={4}>
      {(title || description) && (
        <VStack gap={1}>
          {title && <Heading level={2}>{title}</Heading>}
          {description && <Text color="secondary">{description}</Text>}
        </VStack>
      )}

      <Grid columns={{ minWidth: 240, max: 4 }} gap={4}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </VStack>
  );
};

export default ProductList;
