import React, { useMemo } from 'react';
import { Badge, Button, HStack, MoreMenu, Text, VStack, pixel, proportional } from '@astryxdesign/core';
import AdminTable from '../AdminTable';
import { describeLinkTarget } from '../../storefront/storefrontLinkUtils';

export const CarouselSlideTable = ({
  error,
  isDeleting,
  isLoading,
  onCreate,
  onDelete,
  onEdit,
  onRetry,
  onToggleActive,
  slides,
}) => {
  const columns = useMemo(() => [
    {
      key: 'order',
      header: 'Order',
      width: pixel(80),
      renderCell: (slide) => <Text hasTabularNumbers>{slide.sortOrder}</Text>,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(110),
      renderCell: (slide) => (
        <Badge variant={slide.isActive ? 'green' : 'gray'} label={slide.isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      key: 'slide',
      header: 'Slide',
      width: proportional(2),
      renderCell: (slide) => (
        <VStack gap={0.5}>
          <Text weight="semibold">{slide.title}</Text>
          <Text type="supporting">{slide.description || 'No description'}</Text>
        </VStack>
      ),
    },
    {
      key: 'target',
      header: 'Link target',
      width: proportional(1.4),
      renderCell: (slide) => describeLinkTarget({
        type: slide.linkType,
        productId: slide.productId,
        categoryId: slide.categoryId,
        customUrl: slide.customUrl,
      }),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(120),
      align: 'end',
      renderCell: (slide) => (
        <MoreMenu
          label={`Actions for ${slide.title}`}
          isDisabled={isDeleting}
          items={[
            { label: 'Edit', onClick: () => onEdit(slide) },
            { label: slide.isActive ? 'Deactivate' : 'Activate', onClick: () => onToggleActive(slide) },
            { label: 'Delete', onClick: () => onDelete(slide) },
          ]}
        />
      ),
    },
  ], [isDeleting, onDelete, onEdit, onToggleActive]);

  return (
    <AdminTable
      columns={columns}
      data={slides}
      isLoading={isLoading}
      error={error}
      errorTitle="Unable to load carousel slides"
      onRetry={onRetry}
      emptyTitle="No carousel slides yet"
      emptyDescription="Create the first slide to publish homepage carousel content."
      emptyActions={(
        <HStack gap={2}>
          <Button label="Create slide" variant="primary" onClick={onCreate} />
        </HStack>
      )}
    />
  );
};

export default CarouselSlideTable;
