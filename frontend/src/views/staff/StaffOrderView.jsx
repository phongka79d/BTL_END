import React, { useState, useEffect, useCallback } from 'react';
import { Button, HStack, VStack, Text, Selector, Card } from '@astryxdesign/core';
import PageHeader from '../../components/common/PageHeader';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Drawer from '../../components/common/Drawer';
import OrderDetailPanel from '../../components/order/OrderDetailPanel';
import { formatDate } from '../../components/common/formatDate';
import { orderApi } from '../../api/orderApi';
import { formatPrice } from '../../components/product/productUtils';
import { useNotification } from '../../contexts/NotificationContext';
import { RefreshIcon } from '../../components/common/LayoutIcons';

export const StaffOrderView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await orderApi.getAdminOrders({
        page,
        limit: 10,
        status: statusFilter || undefined,
        keyword: search || undefined
      });
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
      console.error('Failed to fetch orders:', err);
      notifyError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, notifyError]);

  useEffect(() => {
    fetchOrders(1);
  }, [search, statusFilter]);

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
        fetchOrders(pagination.page);
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
            onClick={() => fetchOrders(pagination.page)}
            icon={<RefreshIcon size={14} />}
          />
        }
      />

      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Tìm theo mã đơn, người nhận, địa chỉ..."
        hasActiveFilters={!!search || !!statusFilter}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        filters={
          <div style={{ width: '200px' }}>
            <Selector
              label="Trạng thái đơn hàng"
              isLabelHidden
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val || '');
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              options={statusOptions}
            />
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        onRowClick={handleOpenDetail}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          onPageChange: (p) => fetchOrders(p)
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
