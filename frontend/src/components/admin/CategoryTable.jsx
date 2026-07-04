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
            {category.description || 'No description'}
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
          label={`Actions for ${category.name}`}
          isDisabled={isDeleting}
          items={[
            {
              label: 'Edit',
              onClick: () => onEdit(category)
            },
            {
              label: 'Delete',
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
      errorTitle="Unable to load categories"
      onRetry={onRetry}
      emptyTitle="No categories yet"
      emptyDescription="Create the first category to organize catalog products."
      emptyActions={(
        <Button
          label="Create category"
          variant="primary"
          onClick={onCreate}
        />
      )}
    />
  );
};

export default CategoryTable;
