import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyUserRoleFilter,
  applyUserSearchFilter,
  getPageAfterUserListLoad,
  getUserListErrorMessage,
  isAllowedUserRoleFilter,
  isCurrentUserListRequest,
  resetUserFilters,
  USER_ROLE_FILTER_OPTIONS
} from './adminUserFilterUtils.js';

test('role filters allow only the server role values and expose the all-roles option', () => {
  assert.deepEqual(USER_ROLE_FILTER_OPTIONS, [
    { label: 'Tất cả vai trò', value: '' },
    { label: 'Khách hàng', value: 'customer' },
    { label: 'Nhân viên', value: 'staff' },
    { label: 'Quản trị viên', value: 'admin' }
  ]);
  assert.equal(isAllowedUserRoleFilter(''), true);
  assert.equal(isAllowedUserRoleFilter('customer'), true);
  assert.equal(isAllowedUserRoleFilter('staff'), true);
  assert.equal(isAllowedUserRoleFilter('admin'), true);
  assert.equal(isAllowedUserRoleFilter('owner'), false);
});

test('applying a search or role resets pagination while retaining the other active filter', () => {
  const filters = { search: 'old term', role: 'staff', page: 4 };

  assert.deepEqual(applyUserSearchFilter(filters, '  new term  '), {
    search: 'new term', role: 'staff', page: 1
  });
  assert.deepEqual(applyUserRoleFilter(filters, 'admin'), {
    search: 'old term', role: 'admin', page: 1
  });
  assert.deepEqual(filters, { search: 'old term', role: 'staff', page: 4 });
  assert.equal(applyUserRoleFilter(filters, 'owner'), filters);
});

test('reset clears applied search and role and returns to the first page', () => {
  assert.deepEqual(resetUserFilters(), { search: '', role: '', page: 1 });
});

test('a mutation reload recovers empty or out-of-range pages', () => {
  assert.equal(getPageAfterUserListLoad({
    requestedPage: 4,
    pagination: { totalPages: 3 },
    items: []
  }), 3);
  assert.equal(getPageAfterUserListLoad({
    requestedPage: 3,
    pagination: { totalPages: 3 },
    items: []
  }), 2);
  assert.equal(getPageAfterUserListLoad({
    requestedPage: 1,
    pagination: { totalPages: 0 },
    items: []
  }), 1);
  assert.equal(getPageAfterUserListLoad({
    requestedPage: 3,
    pagination: { totalPages: 3 },
    items: [{ id: 'user-1' }]
  }), 3);
});

test('only the latest response for the active filter set may update the list', () => {
  const activeFilters = { search: 'alice', role: 'customer', page: 2 };

  assert.equal(isCurrentUserListRequest({
    requestId: 8,
    latestRequestId: 8,
    requestFilters: activeFilters,
    activeFilters
  }), true);
  assert.equal(isCurrentUserListRequest({
    requestId: 7,
    latestRequestId: 8,
    requestFilters: activeFilters,
    activeFilters
  }), false);
  assert.equal(isCurrentUserListRequest({
    requestId: 8,
    latestRequestId: 8,
    requestFilters: { ...activeFilters, role: 'staff' },
    activeFilters
  }), false);
});

test('list errors preserve server messages and use a clear fallback for empty errors', () => {
  assert.equal(getUserListErrorMessage({ message: 'Server unavailable' }), 'Server unavailable');
  assert.equal(getUserListErrorMessage({ message: '  ' }), 'Không thể tải người dùng.');
  assert.equal(getUserListErrorMessage(null), 'Không thể tải người dùng.');
});
