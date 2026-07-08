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
      key: 'label',
      header: 'Navigation item',
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
      header: 'Actions',
      width: pixel(120),
      align: 'end',
      renderCell: (item) => (
        <MoreMenu
          label={`Actions for ${item.label}`}
          isDisabled={isDeleting}
          items={[
            { label: 'Edit', onClick: () => onEdit(item) },
            ...(item.itemType === 'mega_menu' && !item.parentId ? [{ label: 'Add child link', onClick: () => onCreateChild(item) }] : []),
            { label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onToggleActive(item) },
            { label: 'Delete', onClick: () => onDelete(item) },
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
      errorTitle="Unable to load storefront navigation"
      onRetry={onRetry}
      emptyTitle="No navigation items yet"
      emptyDescription="Create top-level links or mega menus for the storefront."
      emptyActions={(
        <HStack gap={2}>
          <Button label="Create navigation item" variant="primary" onClick={onCreate} />
        </HStack>
      )}
    />
  );
};

export default NavigationItemTable;
