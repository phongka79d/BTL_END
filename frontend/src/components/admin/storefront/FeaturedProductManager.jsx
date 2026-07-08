import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  HStack,
  MoreMenu,
  NumberInput,
  Text,
  VStack,
  pixel,
  proportional
} from '@astryxdesign/core';
import AdminTable from '../AdminTable';
import FeaturedProductBulkPicker from './FeaturedProductBulkPicker';

export const FeaturedProductManager = ({
  error,
  featuredProducts,
  isLoading,
  isSaving,
  onCreateFeaturedProductsBulk,
  onDeleteFeaturedProduct,
  onRetry,
  onReorderFeaturedProducts,
  onSaveSettings,
  onToggleFeaturedProduct,
  settings,
}) => {
  const [featuredProductLimit, setFeaturedProductLimit] = useState(settings.featuredProductLimit || 6);

  useEffect(() => {
    setFeaturedProductLimit(settings.featuredProductLimit || 6);
  }, [settings.featuredProductLimit]);

  const moveFeaturedProduct = useCallback((item, direction) => {
    const currentIndex = featuredProducts.findIndex((product) => product.id === item.id);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= featuredProducts.length) {
      return;
    }

    const nextProducts = [...featuredProducts];
    [nextProducts[currentIndex], nextProducts[nextIndex]] = [nextProducts[nextIndex], nextProducts[currentIndex]];
    onReorderFeaturedProducts(nextProducts.map((product) => product.id));
  }, [featuredProducts, onReorderFeaturedProducts]);

  const columns = useMemo(() => [
    {
      key: 'order',
      header: 'Order',
      width: pixel(80),
      renderCell: (item) => <Text hasTabularNumbers>{item.sortOrder}</Text>,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(110),
      renderCell: (item) => (
        <Badge variant={item.isActive ? 'green' : 'gray'} label={item.isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      key: 'product',
      header: 'Product',
      width: proportional(2),
      renderCell: (item) => (
        <VStack gap={0.5}>
          <Text weight="semibold">{item.product?.name || 'Deleted product'}</Text>
          <Text type="supporting">{item.product?.brand || 'No brand'}</Text>
        </VStack>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(120),
      align: 'end',
      renderCell: (item) => (
        <MoreMenu
          label={`Actions for ${item.product?.name || 'featured product'}`}
          isDisabled={isSaving}
          items={[
            {
              label: 'Move up',
              onClick: () => moveFeaturedProduct(item, 'up'),
            },
            {
              label: 'Move down',
              onClick: () => moveFeaturedProduct(item, 'down'),
            },
            {
              label: item.isActive ? 'Deactivate' : 'Activate',
              onClick: () => onToggleFeaturedProduct(item),
            },
            { label: 'Delete', onClick: () => onDeleteFeaturedProduct(item) },
          ]}
        />
      ),
    },
  ], [isSaving, moveFeaturedProduct, onDeleteFeaturedProduct, onToggleFeaturedProduct]);

  return (
    <VStack gap={4}>
      <Card padding={4}>
        <VStack gap={4}>
          <HStack gap={3} align="end" wrap="wrap">
            <NumberInput
              label="Featured product count"
              value={featuredProductLimit}
              onChange={setFeaturedProductLimit}
              min={1}
              max={24}
              step={1}
              isIntegerOnly
            />
            <Button
              label="Save count"
              variant="primary"
              isLoading={isSaving}
              onClick={() => onSaveSettings({ featuredProductLimit })}
            />
          </HStack>
          <FeaturedProductBulkPicker
            isDisabled={isSaving}
            onAddProducts={onCreateFeaturedProductsBulk}
          />
        </VStack>
      </Card>
      <AdminTable
        columns={columns}
        data={featuredProducts}
        isLoading={isLoading}
        error={error}
        errorTitle="Unable to load featured products"
        onRetry={onRetry}
        emptyTitle="No featured products yet"
        emptyDescription="Choose products to control what appears on the homepage."
      />
    </VStack>
  );
};

export default FeaturedProductManager;
