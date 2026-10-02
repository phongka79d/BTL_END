import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, HStack, VStack, Text, Selector } from '@astryxdesign/core';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Drawer from '../../components/common/Drawer';
import EmptyState from '../../components/common/EmptyState';
import OrderDetailPanel from '../../components/order/OrderDetailPanel';
import { formatDate } from '../../components/common/formatDate';
import { orderApi } from '../../api/orderApi';
import { formatPrice } from '../../components/product/productUtils';
import { useNotification } from '../../contexts/NotificationContext';
import { RefreshIcon, SearchIcon } from '../../components/common/LayoutIcons';
import { ORDER_SEARCH_FIELDS } from '../../constants/orderSearchFields';
import { buildOrderSearchQuery, resolveOrderSearchSubmit } from './staffOrderSearchUtils';

export const StaffOrderView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchField, setSearchField] = useState(ORDER_SEARCH_FIELDS.ORDER_ID);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { notifySuccess, notifyError } = useNotification();
  const requestIdRef = useRef(0);

  const fetchOrders = useCallback(async ({
    page = 1,
    keyword: activeKeyword = '',
    searchField: activeField = ORDER_SEARCH_FIELDS.ORDER_ID,
    status = ''
  } = {}) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await orderApi.getAdminOrders(
        buildOrderSearchQuery({ page, keyword: activeKeyword, searchField: activeField, status })
      );
      if (requestId !== requestIdRef.current) return;

      if (res.success && res.data) {
        const items = res.data.items || res.data.orders || [];
        setOrders(items);
        const pag = res.data.pagination || { page: 1, totalPages: 1, total: items.length };
        setPagination({
          page: pag.page || 1,
          totalPages: pag.totalPages || 1,
          total: pag.total || items.length
        });
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to fetch orders:', err);
      notifyError('Không thể tải danh sách đơn hàng');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [notifyError]);

  // Từ khóa đã gửi, phạm vi tìm kiếm hoặc trạng thái đổi → luôn quay về trang 1.
  useEffect(() => {
    fetchOrders({ page: 1, keyword, searchField, status: statusFilter });
  }, [keyword, searchField, statusFilter]);

  // Tìm kiếm chỉ chạy khi người dùng bấm "Tìm kiếm" / nhấn Enter, không chạy theo từng ký tự.
  const handleSubmitSearch = (event) => {
    event.preventDefault();
    const plan = resolveOrderSearchSubmit({
      draftKeyword: keywordDraft,
      keyword,
      searchField,
      status: statusFilter
    });
    setKeywordDraft(plan.keyword);
    setKeyword(plan.keyword);
    setPagination((p) => ({ ...p, page: 1 }));
    if (plan.isKeywordUnchanged) {
      // Từ khóa không đổi nên effect không chạy lại: tải lại trang 1 để có phản hồi rõ ràng.
      fetchOrders(plan.query);
    }
  };

  // Đổi phạm vi tìm kiếm chỉ đổi cách hiểu từ khóa đã gửi; bản nháp đang gõ chưa được áp dụng.
  const handleSearchFieldChange = (val) => {
    const nextField = val || ORDER_SEARCH_FIELDS.ORDER_ID;
    if (nextField === searchField) return;
    setSearchField(nextField);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val || '');
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleResetFilters = () => {
    setKeywordDraft('');
    setKeyword('');
    setStatusFilter('');
    setSearchField(ORDER_SEARCH_FIELDS.ORDER_ID);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handlePageChange = (page) => {
    fetchOrders({ page, keyword, searchField, status: statusFilter });
  };

  const handleRefresh = () => {
    fetchOrders({ page: pagination.page, keyword, searchField, status: statusFilter });
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await orderApi.updateOrderStatus(selectedOrder.id, newStatus);
      if (res.success) {
        notifySuccess(`Đã chuyển trạng thái đơn hàng sang "${newStatus}"`);
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        fetchOrders({ page: pagination.page, keyword, searchField, status: statusFilter });
      } else {
        notifyError(res.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      notifyError(err.message || 'Đã xảy ra lỗi khi cập nhật');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý (Pending)' },
    { value: 'confirmed', label: 'Đã xác nhận (Confirmed)' },
    { value: 'shipping', label: 'Đang giao hàng (Shipping)' },
    { value: 'completed', label: 'Hoàn thành (Completed)' },
    { value: 'cancelled', label: 'Đã hủy (Cancelled)' }
  ];

  const searchFieldOptions = [
    { value: ORDER_SEARCH_FIELDS.ORDER_ID, label: 'Mã đơn' },
    { value: ORDER_SEARCH_FIELDS.CUSTOMER, label: 'Khách hàng' },
    { value: ORDER_SEARCH_FIELDS.SHIPPING_ADDRESS, label: 'Địa chỉ giao hàng' }
  ];

  const searchPlaceholders = {
    [ORDER_SEARCH_FIELDS.ORDER_ID]: 'Nhập mã đơn hàng...',
    [ORDER_SEARCH_FIELDS.CUSTOMER]: 'Nhập tên, số điện thoại hoặc email khách hàng...',
    [ORDER_SEARCH_FIELDS.SHIPPING_ADDRESS]: 'Nhập địa chỉ giao hàng...'
  };

  const hasActiveFilters = !!keywordDraft || !!keyword || !!statusFilter;
  const hasSearchQuery = !!keyword || !!statusFilter;

  const emptyState = hasSearchQuery ? (
    <EmptyState
      title="Không tìm thấy đơn hàng phù hợp"
      description="Không có đơn hàng nào khớp từ khóa và bộ lọc hiện tại. Hãy thử từ khóa khác hoặc đặt lại bộ lọc."
      actionLabel="Đặt lại bộ lọc"
      onAction={handleResetFilters}
    />
  ) : (
    <EmptyState
      title="Chưa có đơn hàng nào"
      description="Đơn hàng mới từ khách hàng sẽ xuất hiện tại đây."
    />
  );

  const columns = [
    {
      key: 'id',
      title: 'Mã đơn',
      render: (id) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{id.slice(0, 8)}</span>
    },
    {
      key: 'user',
      title: 'Khách hàng',
      render: (user) => (
        <VStack gap={0}>
          <span style={{ fontWeight: 600 }}>{user?.fullName || user?.username || 'Khách hàng'}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #6b7280)' }}>
            {user?.phone || user?.email || '-'}
          </span>
        </VStack>
      )
    },
    {
      key: 'shippingAddress',
      title: 'Địa chỉ giao hàng',
      render: (addr) => (
        <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {addr}
        </div>
      )
    },
    {
      key: 'totalAmount',
      title: 'Tổng tiền',
      render: (val) => <span style={{ fontWeight: 600 }}>{formatPrice(val)}</span>
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (status) => <StatusBadge status={status} type="order" />
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (date) => formatDate(date)
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'right',
      render: (_, row) => (
        <Button
          label="Xử lý"
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetail(row);
          }}
        />
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Xử lý đơn hàng"
        subtitle="Quản lý tiếp nhận, đóng gói và cập nhật tiến độ giao hàng cho khách."
        actions={
          <Button
            label="Làm mới"
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshIcon size={14} />}
          />
        }
      />

      <form onSubmit={handleSubmitSearch}>
        <FilterBar
          search={keywordDraft}
          onSearchChange={setKeywordDraft}
          searchPlaceholder={searchPlaceholders[searchField] || 'Tìm kiếm...'}
          hasActiveFilters={hasActiveFilters}
          onReset={handleResetFilters}
          filters={
            <>
              <div style={{ width: '180px' }}>
                <Selector
                  label="Tìm kiếm theo"
                  isLabelHidden
                  value={searchField}
                  onChange={handleSearchFieldChange}
                  options={searchFieldOptions}
                />
              </div>
              <div style={{ width: '200px' }}>
                <Selector
                  label="Trạng thái đơn hàng"
                  isLabelHidden
                  value={statusFilter}
                  onChange={handleStatusChange}
                  options={statusOptions}
                />
              </div>
              <Button
                type="submit"
                label="Tìm kiếm"
                variant="secondary"
                size="sm"
                icon={<SearchIcon size={14} />}
              />
            </>
          }
        />
      </form>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyState={emptyState}
        onRowClick={handleOpenDetail}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          onPageChange: handlePageChange
        }}
      />

      {/* Slide-over Drawer for Order Detail & Status Transition */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Đơn hàng #${selectedOrder?.id?.slice(0, 8)}`}
        subtitle={`Ngày đặt: ${selectedOrder ? formatDate(selectedOrder.createdAt) : ''}`}
        width="560px"
        footer={
          <HStack justify="between" align="center" style={{ width: '100%' }}>
            <HStack align="center" gap={2}>
              <Text size="sm" weight="semibold">Trạng thái:</Text>
              <StatusBadge status={selectedOrder?.status} />
            </HStack>

            <HStack gap={2}>
              {selectedOrder?.status === 'pending' && (
                <Button
                  label="Xác nhận đơn"
                  variant="primary"
                  size="sm"
                  isLoading={updatingStatus}
                  isDisabled={updatingStatus}
                  onClick={() => handleUpdateStatus('confirmed')}
                />
              )}
              {selectedOrder?.status === 'confirmed' && (
                <Button
                  label="Giao hàng"
                  variant="primary"
                  size="sm"
                  isLoading={updatingStatus}
                  isDisabled={updatingStatus}
                  onClick={() => handleUpdateStatus('shipping')}
                />
              )}
              {selectedOrder?.status === 'shipping' && (
                <Button
                  label="Hoàn tất giao hàng"
                  variant="primary"
                  size="sm"
                  isLoading={updatingStatus}
                  isDisabled={updatingStatus}
                  onClick={() => handleUpdateStatus('completed')}
                />
              )}
              {selectedOrder?.status !== 'completed' && selectedOrder?.status !== 'cancelled' && (
                <Button
                  label="Hủy đơn"
                  variant="destructive"
                  size="sm"
                  isLoading={updatingStatus}
                  isDisabled={updatingStatus}
                  onClick={() => handleUpdateStatus('cancelled')}
                />
              )}
            </HStack>
          </HStack>
        }
      >
        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            showAdminControls={false}
          />
        )}
      </Drawer>
    </div>
  );
};

export default StaffOrderView;
