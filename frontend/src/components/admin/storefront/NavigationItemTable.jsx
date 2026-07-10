import React, { useMemo } from 'react';
import { Badge, Button, HStack, MoreMenu, Text, VStack, pixel, proportional } from '@astryxdesign/core';
import AdminTable from '../AdminTable';
import { describeLinkTarget } from '../../storefront/storefrontLinkUtils';

const getDisplayRows = (items) => {
  const topLevel = items.filter((item) => !item.parentId);
  const childrenByParentId = new Map();
  items.filter((item) => item.parentId).forEach((item) => {
    const children = childrenByParentId.get(item.parentId) || [];
    children.push({ ...item, label: `- ${item.label}` });
    childrenByParentId.set(item.parentId, children);
  });

  return topLevel.flatMap((item) => [item, ...(childrenByParentId.get(item.id) || [])]);
};

export const NavigationItemTable = ({
  error,
  isDeleting,
  isLoading,
  items,
  onCreate,
  onCreateChild,
  onDelete,
  onEdit,
  onRetry,
  onToggleActive,
}) => {
  const rows = useMemo(() => getDisplayRows(items), [items]);
  const columns = useMemo(() => [
    {
      key: 'order',
      header: 'Thứ tự',
      width: pixel(80),
      renderCell: (item) => <Text hasTabularNumbers>{item.sortOrder}</Text>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: pixel(110),
      renderCell: (item) => (
        <Badge variant={item.isActive ? 'green' : 'gray'} label={item.isActive ? 'Đang hoạt động' : 'Không hoạt động'} />
      ),
    },
    {
      key: 'label',
      header: 'Mục điều hướng',
      width: proportional(2),
      renderCell: (item) => (
        <VStack gap={0.5}>
          <Text weight={item.parentId ? undefined : 'semibold'}>{item.label}</Text>
          <Text type="supporting">{item.itemType === 'mega_menu' ? 'Mega menu' : describeLinkTarget({ type: item.linkType, productId: item.productId, categoryId: item.categoryId, customUrl: item.customUrl })}</Text>
        </VStack>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: pixel(120),
      align: 'end',
      renderCell: (item) => (
        <MoreMenu
          label={`Thao tác với ${item.label}`}
          isDisabled={isDeleting}
          items={[
            { label: 'Chỉnh sửa', onClick: () => onEdit(item) },
            ...(item.itemType === 'mega_menu' && !item.parentId ? [{ label: 'Thêm liên kết con', onClick: () => onCreateChild(item) }] : []),
            { label: item.isActive ? 'Tắt kích hoạt' : 'Kích hoạt', onClick: () => onToggleActive(item) },
            { label: 'Xóa', onClick: () => onDelete(item) },
          ]}
        />
      ),
    },
  ], [isDeleting, onCreateChild, onDelete, onEdit, onToggleActive]);

  return (
    <AdminTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      error={error}
      errorTitle="Không thể tải điều hướng cửa hàng"
      onRetry={onRetry}
      emptyTitle="Chưa có mục điều hướng"
      emptyDescription="Hãy tạo liên kết cấp cao nhất hoặc mega menu cho cửa hàng."
      emptyActions={(
        <HStack gap={2}>
          <Button label="Tạo mục điều hướng" variant="primary" onClick={onCreate} />
        </HStack>
      )}
    />
  );
};

export default NavigationItemTable;
