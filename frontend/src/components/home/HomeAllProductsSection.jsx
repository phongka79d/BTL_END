import React from 'react';
import { Button, HStack, VStack } from '@astryxdesign/core';
import ProductList from '../product/ProductList';
import { HomeSection } from './HomeCategoryShowcase';

const sortOptions = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price', label: 'Giá' },
  { value: 'review', label: 'Đánh giá tốt' },
  { value: 'orders', label: 'Số đơn hàng' },
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
  <HomeSection title="Tất cả sản phẩm">
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
        emptyTitle="Chưa có sản phẩm"
        emptyDescription="Sản phẩm sẽ xuất hiện tại đây khi danh mục khả dụng."
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </VStack>
  </HomeSection>
);

export default HomeAllProductsSection;
