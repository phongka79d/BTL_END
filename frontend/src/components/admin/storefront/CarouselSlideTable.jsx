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
      header: 'Thứ tự',
      width: pixel(80),
      renderCell: (slide) => <Text hasTabularNumbers>{slide.sortOrder}</Text>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: pixel(110),
      renderCell: (slide) => (
        <Badge variant={slide.isActive ? 'green' : 'gray'} label={slide.isActive ? 'Đang hoạt động' : 'Không hoạt động'} />
      ),
    },
    {
      key: 'slide',
      header: 'Slide',
      width: proportional(2),
      renderCell: (slide) => (
        <VStack gap={0.5}>
          <Text weight="semibold">{slide.title}</Text>
          <Text type="supporting">{slide.description || 'Chưa có mô tả'}</Text>
        </VStack>
      ),
    },
    {
      key: 'target',
      header: 'Đích liên kết',
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
      header: 'Thao tác',
      width: pixel(120),
      align: 'end',
      renderCell: (slide) => (
        <MoreMenu
          label={`Thao tác với ${slide.title}`}
          isDisabled={isDeleting}
          items={[
            { label: 'Chỉnh sửa', onClick: () => onEdit(slide) },
            { label: slide.isActive ? 'Tắt kích hoạt' : 'Kích hoạt', onClick: () => onToggleActive(slide) },
            { label: 'Xóa', onClick: () => onDelete(slide) },
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
      errorTitle="Không thể tải slide băng chuyền"
      onRetry={onRetry}
      emptyTitle="Chưa có slide băng chuyền"
      emptyDescription="Hãy tạo slide đầu tiên để xuất bản nội dung băng chuyền trang chủ."
      emptyActions={(
        <HStack gap={2}>
          <Button label="Tạo slide" variant="primary" onClick={onCreate} />
        </HStack>
      )}
    />
  );
};

export default CarouselSlideTable;
