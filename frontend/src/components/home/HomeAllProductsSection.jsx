import React from 'react';
import { Button, HStack, VStack } from '@astryxdesign/core';
import ProductList from '../product/ProductList';
import { HomeSection } from './HomeCategoryShowcase';

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'price', label: 'Price' },
  { value: 'review', label: 'Good review' },
  { value: 'orders', label: 'Order number' },
];

export const HomeAllProductsSection = ({
  error,
  isLoading,
  onPageChange,
  onRetry,
  onSortChange,
  pagination,
  products = [],
  sort,
}) => (
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

      <ProductList
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No products available"
        emptyDescription="Products will appear here when the catalog is available."
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </VStack>
  </HomeSection>
);

export default HomeAllProductsSection;
