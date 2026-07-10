import React, { useMemo } from 'react';
import {
  Button,
  MoreMenu,
  Text,
  VStack,
  pixel,
  proportional
} from '@astryxdesign/core';
import AdminTable from './AdminTable';

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
          <Text weight="semibold">{category.name}</Text>
          <Text type="supporting">
            {category.description || 'Chưa có mô tả'}
          </Text>
        </VStack>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(80),
      align: 'end',
      resizable: false,
      renderCell: (category) => (
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
