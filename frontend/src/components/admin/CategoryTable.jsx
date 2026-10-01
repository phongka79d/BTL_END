import React, { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  HStack,
  Link,
  MoreMenu,
  Text,
  VStack,
  pixel,
  proportional
} from '@astryxdesign/core';
import AdminTable from './AdminTable';

/** Đường dẫn xem danh sách sản phẩm đã lọc theo danh mục. */
export const buildCategoryProductsHref = (categoryId) =>
  `/admin/products?categoryId=${encodeURIComponent(String(categoryId))}`;

export const CategoryTable = ({
  categories,
  error,
  isDeleting,
  isLoading,
  onCreate,
  onDelete,
  onEdit,
  onRetry
}) => {
  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'Category ID',
      width: proportional(1),
      renderCell: (category) => (
        <Text type="supporting">{category.id}</Text>
      )
    },
    {
      key: 'category',
      header: 'Category',
      width: proportional(2),
      renderCell: (category) => (
        <VStack gap={0.5}>
          <Link
            as={RouterLink}
            href={buildCategoryProductsHref(category.id)}
            weight="semibold"
          >
            {category.name}
          </Link>
          <Text type="supporting">
            {category.description || 'Chưa có mô tả'}
          </Text>
        </VStack>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(180),
      align: 'end',
      resizable: false,
      renderCell: (category) => (
        <HStack gap={2} align="center" justify="end">
          <Button
            label={`Xem sản phẩm trong ${category.name}`}
            variant="ghost"
            size="sm"
            as={RouterLink}
            href={buildCategoryProductsHref(category.id)}
          >
            Xem sản phẩm
          </Button>
          <MoreMenu
            label={`Thao tác với ${category.name}`}
            isDisabled={isDeleting}
            items={[
              {
                label: 'Chỉnh sửa',
                onClick: () => onEdit(category)
              },
              {
                label: 'Xóa',
                onClick: () => onDelete(category)
              }
            ]}
          />
        </HStack>
      )
    }
  ], [isDeleting, onDelete, onEdit]);

  return (
    <AdminTable
      columns={columns}
      data={categories}
      isLoading={isLoading}
      error={error}
      errorTitle="Không thể tải danh mục"
      onRetry={onRetry}
      emptyTitle="Chưa có danh mục"
      emptyDescription="Hãy tạo danh mục đầu tiên để sắp xếp sản phẩm trong danh mục."
      emptyActions={(
        <Button
          label="Tạo danh mục"
          variant="primary"
          onClick={onCreate}
        />
      )}
    />
  );
};

export default CategoryTable;
