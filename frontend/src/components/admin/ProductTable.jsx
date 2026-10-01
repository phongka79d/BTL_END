import React, { useMemo } from 'react';
import {
  Badge,
  Button,
  MoreMenu,
  Text,
  VStack,
  pixel,
  proportional
} from '@astryxdesign/core';
import {
  formatPrice,
  getProductImageSrc,
  getStockLabel,
  getStockVariant,
  handleProductImageError
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
      header: 'Hình ảnh',
      width: pixel(72),
      resizable: false,
      renderCell: (product) => (
        <div
          style={{
            width: '64px',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            borderRadius: 'var(--radius-element)',
            backgroundColor: 'var(--color-neutral)',
            boxShadow: 'inset 0 0 0 1px var(--color-border)'
          }}
        >
          <img
            src={getProductImageSrc(product.imageUrl)}
            alt={product.name}
            title={product.name}
            onError={handleProductImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      )
    },
    {
      key: 'name',
      header: 'Sản phẩm',
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
      header: 'Danh mục',
      width: proportional(1),
      renderCell: (product) => product.category?.name || 'Chưa phân loại'
    },
    {
      key: 'price',
      header: 'Giá',
      width: proportional(1),
      align: 'end',
      renderCell: (product) => (
        <Text hasTabularNumbers>{formatPrice(product.price)}</Text>
      )
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      width: proportional(1),
      align: 'end',
      renderCell: (product) => (
        <Text hasTabularNumbers>{product.quantity}</Text>
      )
    },
    {
      key: 'stock',
      header: 'Trạng thái kho',
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
      header: 'Thao tác',
      width: pixel(80),
      align: 'end',
      resizable: false,
      renderCell: (product) => (
        <MoreMenu
          label={`Thao tác với ${product.name}`}
          isDisabled={isDeleting}
          items={[
            {
              label: 'Xem',
              onClick: () => onView(product)
            },
            {
              label: 'Chỉnh sửa',
              onClick: () => onEdit(product)
            },
            {
              label: 'Xóa',
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
