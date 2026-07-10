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

export const getUserDisplayName = (user) => user.fullName || user.username || user.email || 'Người dùng';

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
      header: 'Người dùng',
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
      header: 'Liên hệ',
      width: proportional(1.2),
      renderCell: (item) => (
        <VStack gap={0}>
          <Text color={item.phone ? undefined : 'secondary'}>
            {item.phone || 'Chưa có số điện thoại'}
          </Text>
          <Text size="supporting" color="secondary">
            {item.address || 'Chưa có địa chỉ'}
          </Text>
        </VStack>
      )
    },
    {
      key: 'role',
      header: 'Vai trò',
      width: pixel(120),
      renderCell: (item) => (
        <Badge
          variant={item.role === 'admin' ? 'blue' : 'neutral'}
          label={item.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
        />
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: pixel(120),
      renderCell: (item) => (
        <Badge
          variant={item.isBlocked ? 'danger' : 'green'}
          label={item.isBlocked ? 'Bị khóa' : 'Đang hoạt động'}
        />
      )
    },
    {
      key: 'createdAt',
      header: 'Ngày tham gia',
      width: proportional(1),
      renderCell: (item) => (
        <Text size="supporting" color="secondary">
          {formatDate(item.createdAt)}
        </Text>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: pixel(90),
      align: 'end',
      renderCell: (item) => {
        const nextRole = item.role === 'admin' ? 'customer' : 'admin';
        const nextBlockedState = !item.isBlocked;
        const isSelf = currentUserId === item.id;

        return (
          <MoreMenu
            label={`Thao tác với ${getUserDisplayName(item)}`}
            isDisabled={isUpdating}
            items={[
              {
                label: 'Chỉnh sửa hồ sơ',
                onClick: () => onEdit(item)
              },
              {
                label: nextRole === 'admin' ? 'Đổi thành quản trị viên' : 'Đổi thành khách hàng',
                onClick: () => onRoleChange(item, nextRole),
                isDisabled: isSelf
              },
              {
                label: nextBlockedState ? 'Khóa người dùng' : 'Mở khóa người dùng',
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
      errorTitle="Không thể tải người dùng"
      onRetry={onRetry}
      emptyTitle={search ? 'Không có người dùng phù hợp' : 'Chưa có người dùng'}
      emptyDescription={
        search
          ? 'Hãy xóa tìm kiếm hoặc thử tên người dùng, email hay tên khác.'
          : 'Khách hàng và quản trị viên đã đăng ký sẽ xuất hiện tại đây.'
      }
      emptyActions={search ? (
        <Button
          label="Xóa tìm kiếm"
          variant="secondary"
          onClick={onClearSearch}
        />
      ) : undefined}
    />
  );
};

export default UserManagementTable;
