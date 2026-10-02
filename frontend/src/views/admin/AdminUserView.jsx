import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Heading,
  HStack,
  Selector,
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
import {
  applyUserRoleFilter,
  applyUserSearchFilter,
  getPageAfterUserListLoad,
  getUserListErrorMessage,
  isCurrentUserListRequest,
  resetUserFilters,
  USER_ROLE_FILTER_OPTIONS
} from './adminUserFilterUtils.js';
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
  const [roleFilter, setRoleFilter] = useState('');
  const activeFiltersRef = useRef({ page, search, role: roleFilter });
  const latestRequestIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const commitFilters = useCallback((nextFilters) => {
    activeFiltersRef.current = nextFilters;
    setPage(nextFilters.page);
    setSearch(nextFilters.search);
    setRoleFilter(nextFilters.role);
  }, []);

  const loadUsers = useCallback(async (filters = activeFiltersRef.current) => {
    const requestId = ++latestRequestIdRef.current;
    const requestFilters = { ...filters };
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await userApi.getAdminUsers({
        keyword: requestFilters.search,
        role: requestFilters.role,
        page: requestFilters.page,
        limit: DEFAULT_PAGINATION.limit
      });
      const items = response?.data?.items || [];
      const responsePagination = response?.data?.pagination;

      if (!isCurrentUserListRequest({
        requestId,
        latestRequestId: latestRequestIdRef.current,
        requestFilters,
        activeFilters: activeFiltersRef.current
      })) {
        return;
      }

      const validPage = getPageAfterUserListLoad({
        requestedPage: requestFilters.page,
        pagination: responsePagination,
        items
      });
      if (validPage !== requestFilters.page) {
        const nextFilters = { ...activeFiltersRef.current, page: validPage };
        activeFiltersRef.current = nextFilters;
        setPage(validPage);
        return;
      }

      setUsers(items);
      setPagination(responsePagination || {
        ...DEFAULT_PAGINATION,
        page: requestFilters.page
      });
    } catch (error) {
      if (isCurrentUserListRequest({
        requestId,
        latestRequestId: latestRequestIdRef.current,
        requestFilters,
        activeFilters: activeFiltersRef.current
      })) {
        setUsers([]);
        setPagination({ ...DEFAULT_PAGINATION, page: requestFilters.page });
        setLoadError(getUserListErrorMessage(error));
      }
    } finally {
      if (isCurrentUserListRequest({
        requestId,
        latestRequestId: latestRequestIdRef.current,
        requestFilters,
        activeFilters: activeFiltersRef.current
      })) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, page, roleFilter, search]);

  const submitSearch = () => {
    commitFilters(applyUserSearchFilter(activeFiltersRef.current, draftSearch));
  };

  const changeRoleFilter = (role) => {
    commitFilters(applyUserRoleFilter(activeFiltersRef.current, role));
  };

  const changePage = (nextPage) => {
    if (!Number.isInteger(nextPage) || nextPage < 1) return;
    commitFilters({ ...activeFiltersRef.current, page: nextPage });
  };

  const clearFilters = () => {
    setDraftSearch('');
    commitFilters(resetUserFilters());
  };

  const handleRoleChange = async (target, nextRole) => {
    if (!target || target.role === nextRole) return;

    setIsUpdating(true);
    setFeedback(null);

    try {
      await userApi.updateUserRole(target.id, nextRole);
      setFeedback({
        title: 'Đã cập nhật vai trò',
        description: `${getUserDisplayName(target)} hiện có vai trò ${nextRole}.`,
        status: 'success'
      });
      await loadUsers(activeFiltersRef.current);
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
      await userApi.updateUserBlocked(target.id, nextBlockedState);
      setFeedback({
        title: nextBlockedState ? 'Đã khóa người dùng' : 'Đã mở khóa người dùng',
        description: `${getUserDisplayName(target)} hiện ${nextBlockedState ? 'bị khóa' : 'đang hoạt động'}.`,
        status: 'success'
      });
      await loadUsers(activeFiltersRef.current);
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
      await loadUsers(activeFiltersRef.current);
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

    await userApi.updateAdminUser(editingUser.id, payload);
    setFeedback({
      title: 'Đã cập nhật hồ sơ',
      description: `${getUserDisplayName(editingUser)} đã được cập nhật.`,
      status: 'success'
    });
    await loadUsers(activeFiltersRef.current);
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
          <HStack gap={2} align="center" wrap="wrap">
            <div style={{ flex: '1 1 220px', minWidth: '180px' }}>
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
            </div>
            <Selector
              label="Lọc theo vai trò"
              isLabelHidden
              value={roleFilter}
              onChange={changeRoleFilter}
              options={USER_ROLE_FILTER_OPTIONS}
              placeholder="Tất cả vai trò"
              width="220px"
            />
          </HStack>
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Tìm kiếm"
              variant="secondary"
              onClick={submitSearch}
              isDisabled={isLoading}
            />
            {(search || roleFilter || draftSearch) && (
              <Button
                label="Xóa bộ lọc"
                variant="ghost"
                onClick={clearFilters}
                isDisabled={isLoading}
              />
            )}
            <Button
              label="Làm mới"
              variant="secondary"
              onClick={() => loadUsers(activeFiltersRef.current)}
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
        onClearSearch={clearFilters}
        onEdit={setEditingUser}
        onRetry={() => loadUsers(activeFiltersRef.current)}
        onRoleChange={handleRoleChange}
        onBlockedChange={handleBlockedChange}
      />

      {!isLoading && !loadError && users.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={changePage}
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
