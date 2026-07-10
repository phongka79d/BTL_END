import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Grid, HStack, NumberInput, Text, VStack } from '@astryxdesign/core';
import SearchBar from './SearchBar';

const toNumberValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toCategoryHref = (categoryId, filters) => {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) params.set('keyword', filters.keyword.trim());
  if (categoryId) params.set('categoryId', categoryId);
  if (filters.minPrice !== '') params.set('minPrice', filters.minPrice);
  if (filters.maxPrice !== '') params.set('maxPrice', filters.maxPrice);

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
};

const categoryLinkStyle = (isActive) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 'var(--spacing-9)',
  paddingInline: 'var(--spacing-3)',
  border: `1px solid ${isActive ? 'var(--color-border-strong)' : 'var(--color-border-subtle)'}`,
  borderRadius: 'var(--radius-full)',
  background: isActive ? 'var(--color-surface-raised)' : 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  textDecoration: 'none'
});

export const ProductFilter = ({
  filters,
  categories,
  isCategoriesLoading = false,
  onFieldChange,
  onSubmit,
  onClear,
  isDisabled = false
}) => {
  return (
    <Card padding={4}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
        style={{ width: '100%' }}
      >
        <VStack gap={4}>
          <SearchBar
            value={filters.keyword}
            onChange={(value) => onFieldChange('keyword', value)}
            isDisabled={isDisabled}
          />

          <VStack gap={2}>
            <Text weight="medium">Danh mục</Text>
            <HStack gap={2} style={{ flexWrap: 'wrap' }}>
              <Link
                to={toCategoryHref('', filters)}
                aria-current={!filters.categoryId ? 'page' : undefined}
                style={categoryLinkStyle(!filters.categoryId)}
              >
                All categories
              </Link>
              {isCategoriesLoading && (
                <Text color="secondary" size="supporting">Đang tải danh mục...</Text>
              )}
              {!isCategoriesLoading && categories.map((category) => (
                <Link
                  key={category.id}
                  to={toCategoryHref(category.id, filters)}
                  aria-current={filters.categoryId === category.id ? 'page' : undefined}
                  style={categoryLinkStyle(filters.categoryId === category.id)}
                >
                  {category.name}
                </Link>
              ))}
            </HStack>
          </VStack>

          <Grid columns={{ minWidth: 220, max: 2 }} gap={3}>
            <NumberInput
              label="Giá tối thiểu"
              value={toNumberValue(filters.minPrice)}
              onChange={(value) => onFieldChange('minPrice', value === null ? '' : String(value))}
              hasClear
              min={0}
              step={1}
              units="VND"
              placeholder="Không giới hạn tối thiểu"
              isDisabled={isDisabled}
            />

            <NumberInput
              label="Giá tối đa"
              value={toNumberValue(filters.maxPrice)}
              onChange={(value) => onFieldChange('maxPrice', value === null ? '' : String(value))}
              hasClear
              min={0}
              step={1}
              units="VND"
              placeholder="Không giới hạn tối đa"
              isDisabled={isDisabled}
            />
          </Grid>

          <HStack gap={3} style={{ flexWrap: 'wrap' }}>
            <Button
              label="Áp dụng bộ lọc"
              variant="primary"
              type="submit"
              isDisabled={isDisabled}
            />
            <Button
              label="Xóa bộ lọc"
              variant="secondary"
              type="button"
              isDisabled={isDisabled}
              onClick={onClear}
            />
          </HStack>
        </VStack>
      </form>
    </Card>
  );
};

export default ProductFilter;
