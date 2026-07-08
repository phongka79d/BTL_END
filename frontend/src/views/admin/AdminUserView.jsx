import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Heading,
  HStack,
  Text,
  TextInput,
  Toolbar,
  VStack,
  pixel,
  proportional
} from '@astryxdesign/core';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import AdminTable from '../../components/admin/AdminTable';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../components/common/formatDate';

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
};

const getDisplayName = (user) => user.fullName || user.username || user.email || 'User';

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
        description: `${getDisplayName(target)} is now ${nextRole}.`
      });
    } catch (error) {
      setFeedback({
        title: 'Unable to update role',
        description: error?.message || 'The user role could not be updated.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'user',
      header: 'User',
      width: proportional(1.7),
      renderCell: (item) => (
        <VStack gap={0}>
          <Text weight="semibold">{getDisplayName(item)}</Text>
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
      width: pixel(180),
      align: 'end',
      renderCell: (item) => {
        const nextRole = item.role === 'admin' ? 'customer' : 'admin';
        const isSelfDemotion = currentUser?.id === item.id && nextRole === 'customer';

        return (
          <Button
            label={nextRole === 'admin' ? 'Change to admin' : 'Change to customer'}
            variant="secondary"
            size="sm"
            onClick={() => handleRoleChange(item, nextRole)}
            isDisabled={isUpdating || isSelfDemotion}
          />
        );
      }
    }
  ], [currentUser?.id, isUpdating]);

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

      <AdminTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={loadError}
        errorTitle="Unable to load users"
        onRetry={loadUsers}
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
            onClick={clearSearch}
          />
        ) : undefined}
      />

      {!isLoading && !loadError && users.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </VStack>
  );
};

export default AdminUserView;
