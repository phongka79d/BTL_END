export const USER_ROLE_FILTER_OPTIONS = Object.freeze([
  Object.freeze({ label: 'Tất cả vai trò', value: '' }),
  Object.freeze({ label: 'Khách hàng', value: 'customer' }),
  Object.freeze({ label: 'Nhân viên', value: 'staff' }),
  Object.freeze({ label: 'Quản trị viên', value: 'admin' })
]);

const USER_ROLE_FILTER_VALUES = new Set(USER_ROLE_FILTER_OPTIONS.map(({ value }) => value));

export const isAllowedUserRoleFilter = (role) => USER_ROLE_FILTER_VALUES.has(role);

export const applyUserSearchFilter = (filters, draftSearch) => ({
  ...filters,
  search: typeof draftSearch === 'string' ? draftSearch.trim() : '',
  page: 1
});

export const applyUserRoleFilter = (filters, role) => {
  if (!isAllowedUserRoleFilter(role)) {
    return filters;
  }

  return { ...filters, role, page: 1 };
};

export const resetUserFilters = () => ({ search: '', role: '', page: 1 });

export const isCurrentUserListRequest = ({
  requestId,
  latestRequestId,
  requestFilters,
  activeFilters
}) => requestId === latestRequestId
  && requestFilters.page === activeFilters.page
  && requestFilters.search === activeFilters.search
  && requestFilters.role === activeFilters.role;

export const getPageAfterUserListLoad = ({ requestedPage, pagination, items }) => {
  const reportedTotalPages = Number(pagination?.totalPages);
  const totalPages = Number.isInteger(reportedTotalPages) && reportedTotalPages > 0
    ? reportedTotalPages
    : (items?.length ? requestedPage : 1);

  if (requestedPage > totalPages) {
    return Math.max(1, totalPages);
  }
  if (!items?.length && requestedPage > 1) {
    return Math.max(1, requestedPage - 1);
  }
  return requestedPage;
};

export const getUserListErrorMessage = (error) => (
  typeof error?.message === 'string' && error.message.trim()
    ? error.message
    : 'Không thể tải người dùng.'
);
