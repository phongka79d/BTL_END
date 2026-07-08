import React, { useEffect, useMemo, useState } from 'react';
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
import ProductPicker from '../ProductPicker';
import AdminTable from '../AdminTable';

const toFeaturedProductPayload = (item, overrides = {}) => ({
  productId: item.productId,
  sortOrder: Number.isInteger(Number(item.sortOrder)) ? Number(item.sortOrder) : 0,
  isActive: item.isActive !== false,
  ...overrides,
});

export const FeaturedProductManager = ({
  error,
  featuredProducts,
  isLoading,
  isSaving,
  onCreateFeaturedProduct,
  onDeleteFeaturedProduct,
  onRetry,
  onSaveSettings,
  onToggleFeaturedProduct,
  onUpdateFeaturedProduct,
  settings,
}) => {
  const [featuredProductLimit, setFeaturedProductLimit] = useState(settings.featuredProductLimit || 6);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    setFeaturedProductLimit(settings.featuredProductLimit || 6);
  }, [settings.featuredProductLimit]);

  const handleAddFeaturedProduct = async () => {
    if (!selectedProductId) return;

    await onCreateFeaturedProduct({
      productId: selectedProductId,
      sortOrder: Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0,
      isActive: true,
    });
    setSelectedProductId('');
    setSortOrder(0);
  };

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
              onClick: () => onUpdateFeaturedProduct(item.id, toFeaturedProductPayload(item, { sortOrder: item.sortOrder - 1 })),
            },
            {
              label: 'Move down',
              onClick: () => onUpdateFeaturedProduct(item.id, toFeaturedProductPayload(item, { sortOrder: item.sortOrder + 1 })),
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
  ], [isSaving, onDeleteFeaturedProduct, onToggleFeaturedProduct, onUpdateFeaturedProduct]);

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
          <VStack gap={3}>
            <ProductPicker value={selectedProductId} onChange={setSelectedProductId} pageSize={10} />
            <HStack gap={3} align="end" wrap="wrap">
              <NumberInput
                label="Sort order"
                value={sortOrder}
                onChange={setSortOrder}
                step={1}
                isIntegerOnly
              />
              <Button
                label="Add featured product"
                variant="primary"
                isDisabled={!selectedProductId || isSaving}
                onClick={handleAddFeaturedProduct}
              />
            </HStack>
          </VStack>
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
