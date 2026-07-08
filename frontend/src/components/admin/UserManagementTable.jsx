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
import { formatDate } from '../common/formatDate';
import AdminTable from './AdminTable';

export const getUserDisplayName = (user) => user.fullName || user.username || user.email || 'User';

export const UserManagementTable = ({
  currentUserId,
  error,
  isLoading,
  isUpdating,
  onBlockedChange,
  onClearSearch,
  onEdit,
  onRetry,
  onRoleChange,
  search,
  users
}) => {
  const columns = useMemo(() => [
    {
      key: 'user',
      header: 'User',
      width: proportional(1.7),
      renderCell: (item) => (
        <VStack gap={0}>
          <Text weight="semibold">{getUserDisplayName(item)}</Text>
          <Text size="supporting" color="secondary">
            {item.email}
          </Text>
        </VStack>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      width: proportional(1.2),
      renderCell: (item) => (
        <VStack gap={0}>
          <Text color={item.phone ? undefined : 'secondary'}>
            {item.phone || 'No phone'}
          </Text>
          <Text size="supporting" color="secondary">
            {item.address || 'No address'}
          </Text>
        </VStack>
      )
    },
    {
      key: 'role',
      header: 'Role',
      width: pixel(120),
      renderCell: (item) => (
        <Badge
          variant={item.role === 'admin' ? 'blue' : 'neutral'}
          label={item.role === 'admin' ? 'Admin' : 'Customer'}
        />
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(120),
      renderCell: (item) => (
        <Badge
          variant={item.isBlocked ? 'danger' : 'green'}
          label={item.isBlocked ? 'Blocked' : 'Active'}
        />
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      width: proportional(1),
      renderCell: (item) => (
        <Text size="supporting" color="secondary">
          {formatDate(item.createdAt)}
        </Text>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(90),
      align: 'end',
      renderCell: (item) => {
        const nextRole = item.role === 'admin' ? 'customer' : 'admin';
        const nextBlockedState = !item.isBlocked;
        const isSelf = currentUserId === item.id;

        return (
          <MoreMenu
            label={`Actions for ${getUserDisplayName(item)}`}
            isDisabled={isUpdating}
            items={[
              {
                label: 'Edit profile',
                onClick: () => onEdit(item)
              },
              {
                label: nextRole === 'admin' ? 'Change to admin' : 'Change to customer',
                onClick: () => onRoleChange(item, nextRole),
                isDisabled: isSelf
              },
              {
                label: nextBlockedState ? 'Block user' : 'Unblock user',
                onClick: () => onBlockedChange(item, nextBlockedState),
                isDisabled: isSelf
              }
            ]}
          />
        );
      }
    }
  ], [currentUserId, isUpdating, onBlockedChange, onEdit, onRoleChange]);

  return (
    <AdminTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      error={error}
      errorTitle="Unable to load users"
      onRetry={onRetry}
      emptyTitle={search ? 'No matching users' : 'No users yet'}
      emptyDescription={
        search
          ? 'Clear the search or try another username, email, or name.'
          : 'Registered customers and admins will appear here.'
      }
      emptyActions={search ? (
        <Button
          label="Clear search"
          variant="secondary"
          onClick={onClearSearch}
        />
      ) : undefined}
    />
  );
};

export default UserManagementTable;
