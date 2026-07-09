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
      setLoadError(error?.message || 'Unable to load users.');
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
        title: 'Role updated',
        description: `${getUserDisplayName(target)} is now ${nextRole}.`,
        status: 'success'
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to update role',
        description: error?.message || 'The user role could not be updated.',
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
        title: nextBlockedState ? 'User blocked' : 'User unblocked',
        description: `${getUserDisplayName(target)} is now ${nextBlockedState ? 'blocked' : 'active'}.`,
        status: 'success'
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to update blocked status',
        description: error?.message || 'The user blocked status could not be updated.',
        status: 'error'
      });
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
      title: 'Profile updated',
      description: `${getUserDisplayName(editingUser)} was updated.`,
      status: 'success'
    });
  };

  return (
    <VStack gap={6} width="100%">
      <VStack gap={1}>
        <Heading level={1}>Manage Users</Heading>
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
        label="User management"
        startContent={(
          <TextInput
            label="Search users"
            isLabelHidden
            value={draftSearch}
            onChange={setDraftSearch}
            onEnter={submitSearch}
            placeholder="Search username, email, or name"
            hasClear
            width="100%"
          />
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Search"
              variant="secondary"
              onClick={submitSearch}
              isDisabled={isLoading}
            />
            {search && (
              <Button
                label="Clear search"
                variant="ghost"
                onClick={clearSearch}
                isDisabled={isLoading}
              />
            )}
            <Button
              label="Refresh"
              variant="secondary"
              onClick={loadUsers}
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
    </VStack>
  );
};

export default AdminUserView;
