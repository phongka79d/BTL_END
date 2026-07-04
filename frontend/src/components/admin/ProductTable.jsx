import React, { useMemo } from 'react';
import {
  Badge,
  Button,
  MoreMenu,
  Text,
  Thumbnail,
  VStack,
  pixel,
  proportional
} from '@astryxdesign/core';
import {
  formatPrice,
  getProductImageSrc,
  getStockLabel,
  getStockVariant
} from '../product/productUtils';
import AdminTable from './AdminTable';

export const ProductTable = ({
  emptyDescription,
  emptyActionDisabled,
  emptyActionLabel,
  emptyTitle,
  error,
  isDeleting,
  isLoading,
  onDelete,
  onEdit,
  onEmptyAction,
  onRetry,
  onView,
  products
}) => {
  const columns = useMemo(() => [
    {
      key: 'image',
      header: 'Image',
      width: pixel(72),
      resizable: false,
      renderCell: (product) => (
        <Thumbnail
          src={getProductImageSrc(product.imageUrl)}
          alt={product.name}
          label={product.name}
        />
      )
    },
    {
      key: 'name',
      header: 'Product',
      width: proportional(2),
      renderCell: (product) => (
        <VStack gap={0.5}>
          <Text weight="semibold">{product.name}</Text>
          <Text type="supporting">{product.brand}</Text>
        </VStack>
      )
    },
    {
      key: 'category',
      header: 'Category',
      width: proportional(1),
      renderCell: (product) => product.category?.name || 'Uncategorized'
    },
    {
      key: 'price',
      header: 'Price',
      width: proportional(1),
      align: 'end',
      renderCell: (product) => (
        <Text hasTabularNumbers>{formatPrice(product.price)}</Text>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      width: proportional(1),
      align: 'end',
      renderCell: (product) => (
        <Text hasTabularNumbers>{product.quantity}</Text>
      )
    },
    {
      key: 'stock',
      header: 'Stock status',
      width: proportional(1),
      renderCell: (product) => (
        <Badge
          variant={getStockVariant(product.quantity)}
          label={getStockLabel(product.quantity)}
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(80),
      align: 'end',
      resizable: false,
      renderCell: (product) => (
        <MoreMenu
          label={`Actions for ${product.name}`}
          isDisabled={isDeleting}
          items={[
            {
              label: 'View',
              onClick: () => onView(product)
            },
            {
              label: 'Edit',
              onClick: () => onEdit(product)
            },
            {
              label: 'Delete',
              onClick: () => onDelete(product)
            }
          ]}
        />
      )
    }
  ], [isDeleting, onDelete, onEdit, onView]);

  return (
    <AdminTable
      columns={columns}
      data={products}
      isLoading={isLoading}
      error={error}
      errorTitle="Unable to load products"
      onRetry={onRetry}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyActions={(
        <Button
          label={emptyActionLabel}
          variant="primary"
          onClick={onEmptyAction}
          isDisabled={emptyActionDisabled}
        />
      )}
    />
  );
};

export default ProductTable;
