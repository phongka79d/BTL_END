import React from 'react';
import { Button, Card, Grid, HStack, NumberInput, Selector, VStack } from '@astryxdesign/core';
import SearchBar from './SearchBar';

const toNumberValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const ProductFilter = ({
  filters,
  categories,
  isCategoriesLoading = false,
  onFieldChange,
  onSubmit,
  onClear,
  isDisabled = false
}) => {
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name
  }));

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

          <Grid columns={{ minWidth: 220, max: 3 }} gap={3}>
            <Selector
              label="Category"
              value={filters.categoryId}
              onChange={(value) => onFieldChange('categoryId', value || '')}
              options={categoryOptions}
              placeholder={isCategoriesLoading ? 'Loading categories…' : 'All categories'}
              hasClear
              isDisabled={isDisabled || isCategoriesLoading}
            />

            <NumberInput
              label="Minimum price"
              value={toNumberValue(filters.minPrice)}
              onChange={(value) => onFieldChange('minPrice', value === null ? '' : String(value))}
              hasClear
              min={0}
              step={1}
              units="VND"
              placeholder="No minimum"
              isDisabled={isDisabled}
            />

            <NumberInput
              label="Maximum price"
              value={toNumberValue(filters.maxPrice)}
              onChange={(value) => onFieldChange('maxPrice', value === null ? '' : String(value))}
              hasClear
              min={0}
              step={1}
              units="VND"
              placeholder="No maximum"
              isDisabled={isDisabled}
            />
          </Grid>

          <HStack gap={3} style={{ flexWrap: 'wrap' }}>
            <Button
              label="Apply filters"
              variant="primary"
              type="submit"
              isDisabled={isDisabled}
            />
            <Button
              label="Clear filters"
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
