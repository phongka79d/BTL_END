import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Heading,
  HStack,
  Text,
  TextInput,
  Toolbar,
  VStack
} from '@astryxdesign/core';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';
import UserProfileDialog from '../../components/admin/UserProfileDialog';
import UserCreateDialog from '../../components/admin/UserCreateDialog';
import UserManagementTable, { getUserDisplayName } from '../../components/admin/UserManagementTable';

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
};

export const AdminUserView = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await userApi.getAdminUsers({
        keyword: search,
        page,
        limit: DEFAULT_PAGINATION.limit
      });
      setUsers(response?.data?.items || []);
      setPagination(response?.data?.pagination || {
        ...DEFAULT_PAGINATION,
        page
      });
    } catch (error) {
      setUsers([]);
      setPagination({ ...DEFAULT_PAGINATION, page });
      setLoadError(error?.message || 'Không thể tải người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const submitSearch = () => {
    setPage(1);
    setSearch(draftSearch.trim());
  };

  const clearSearch = () => {
    setDraftSearch('');
    setPage(1);
    setSearch('');
  };

  const handleRoleChange = async (target, nextRole) => {
    if (!target || target.role === nextRole) return;

    setIsUpdating(true);
    setFeedback(null);

    try {
      const response = await userApi.updateUserRole(target.id, nextRole);
      const updatedUser = response?.data?.user;
      setUsers((currentUsers) => currentUsers.map((item) => (
        item.id === target.id ? { ...item, ...(updatedUser || {}), role: nextRole } : item
      )));
      setFeedback({
        title: 'Đã cập nhật vai trò',
        description: `${getUserDisplayName(target)} hiện có vai trò ${nextRole}.`,
        status: 'success'
      });
    } catch (error) {
      setFeedback({
        title: 'Không thể cập nhật vai trò',
        description: error?.message || 'Không thể cập nhật vai trò người dùng.',
        status: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBlockedChange = async (target, nextBlockedState) => {
    if (!target || target.isBlocked === nextBlockedState) return;

    setIsUpdating(true);
    setFeedback(null);

    try {
      const response = await userApi.updateUserBlocked(target.id, nextBlockedState);
      const updatedUser = response?.data?.user;
      setUsers((currentUsers) => currentUsers.map((item) => (
        item.id === target.id ? { ...item, ...(updatedUser || {}), isBlocked: nextBlockedState } : item
      )));
      setFeedback({
        title: nextBlockedState ? 'Đã khóa người dùng' : 'Đã mở khóa người dùng',
        description: `${getUserDisplayName(target)} hiện ${nextBlockedState ? 'bị khóa' : 'đang hoạt động'}.`,
        status: 'success'
      });
    } catch (error) {
      setFeedback({
        title: 'Không thể cập nhật trạng thái khóa',
        description: error?.message || 'Không thể cập nhật trạng thái khóa người dùng.',
        status: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async (payload) => {
    setIsUpdating(true);
    setFeedback(null);

    try {
      const response = await userApi.createAdminUser(payload);
      const createdUser = response?.data?.user;
      const emailDelivery = response?.data?.emailDelivery;
      const deliveryNote = emailDelivery === 'smtp'
        ? ' Thông tin đăng nhập đã được gửi qua email.'
        : emailDelivery === 'console'
          ? ' Thông tin đăng nhập đã được ghi ra log máy chủ (SMTP chưa cấu hình).'
          : '';

      setFeedback({
        title: 'Đã tạo tài khoản',
        description: `${getUserDisplayName(createdUser || payload)} đã được tạo.${deliveryNote}`,
        status: 'success'
      });
      await loadUsers();
    } catch (error) {
      setFeedback({
        title: 'Không thể tạo tài khoản',
        description: error?.message || 'Không thể tạo tài khoản người dùng.',
        status: 'error'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileSave = async (payload) => {
    if (!editingUser) return;

    const response = await userApi.updateAdminUser(editingUser.id, payload);
    const updatedUser = response?.data?.user;

    setUsers((currentUsers) => currentUsers.map((item) => (
      item.id === editingUser.id ? { ...item, ...(updatedUser || {}), ...payload } : item
    )));
    setFeedback({
      title: 'Đã cập nhật hồ sơ',
      description: `${getUserDisplayName(editingUser)} đã được cập nhật.`,
      status: 'success'
    });
  };

  return (
    <VStack gap={6} width="100%">
      <VStack gap={1}>
        <Heading level={1}>Quản lý người dùng</Heading>
        <Text color="secondary">
          Search customer accounts and manage admin access.
        </Text>
      </VStack>

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
          status={feedback.status}
        />
      )}

      <Toolbar
        label="Quản lý người dùng"
        startContent={(
          <TextInput
            label="Tìm kiếm người dùng"
            isLabelHidden
            value={draftSearch}
            onChange={setDraftSearch}
            onEnter={submitSearch}
            placeholder="Tìm tên người dùng, email hoặc tên"
            hasClear
            width="100%"
          />
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Tìm kiếm"
              variant="secondary"
              onClick={submitSearch}
              isDisabled={isLoading}
            />
            {search && (
              <Button
                label="Xóa tìm kiếm"
                variant="ghost"
                onClick={clearSearch}
                isDisabled={isLoading}
              />
            )}
            <Button
              label="Làm mới"
              variant="secondary"
              onClick={loadUsers}
              isDisabled={isLoading}
            />
            <Button
              label="Thêm tài khoản"
              variant="primary"
              onClick={() => setIsCreateOpen(true)}
              isDisabled={isLoading}
            />
          </HStack>
        )}
      />

      <UserManagementTable
        currentUserId={currentUser?.id}
        users={users}
        isLoading={isLoading}
        isUpdating={isUpdating}
        error={loadError}
        search={search}
        onBlockedChange={handleBlockedChange}
        onClearSearch={clearSearch}
        onEdit={setEditingUser}
        onRetry={loadUsers}
        onRoleChange={handleRoleChange}
      />

      {!isLoading && !loadError && users.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <UserProfileDialog
        isOpen={Boolean(editingUser)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingUser(null);
          }
        }}
        onSubmit={handleProfileSave}
        user={editingUser}
      />

      <UserCreateDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateUser}
      />
    </VStack>
  );
};

export default AdminUserView;
