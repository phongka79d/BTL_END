import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  EmptyState,
  Heading,
  HStack,
  MoreMenu,
  Selector,
  Text,
  Toolbar,
  VStack,
  proportional,
  pixel,
} from '@astryxdesign/core';
import { orderApi } from '../../api/orderApi';
import { formatPrice } from '../../components/product/productUtils';
import { formatDate } from '../../components/common/formatDate';
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_LABELS,
} from '../../constants/orderConstants';
import AdminTable from '../../components/admin/AdminTable';
import Alert from '../../components/common/Alert';
import AdminOrderDetailDialog from '../../components/admin/AdminOrderDetailDialog';
import OrderStatusSelect from '../../components/admin/OrderStatusSelect';
import PaymentStatusBadge from '../../components/order/PaymentStatusBadge';
import Pagination from '../../components/common/Pagination';

const PAGE_SIZE = 12;

const STATUS_FILTER_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  ...ORDER_STATUS_VALUES.map((value) => ({
    label: ORDER_STATUS_LABELS[value] || value,
    value,
  })),
];

const buildOrderId = (id) => {
  if (!id) return '—';
  return `#${id.slice(0, 8)}\u2026`;
};

/**
 * AdminOrderView
 *
 * Displays all orders for admin users in a table with customer info,
 * status badges, totals, dates, and action controls.
 *
 * Columns (per §17.1 AdminOrderTable + (05A) handoff):
 *   Customer    – user name + email (VStack)
 *   Order ID    – truncated hash
 *   Date        – formatted createdAt
 *   Total       – formatted totalAmount
 *   Order Status– OrderStatusSelect (inline Selector, (05D) wired)
 *   Payment     – PaymentStatusBadge
 *   Actions     – MoreMenu (View Details, Update Status)
 *
 * States handled: loading, success, empty, error, permission denied.
 *
 * ponytail: Status filtering uses client-side pagination; upgrade to
 *           server-side pagination+filter when order volume grows.
 *           (05D) wired OrderStatusSelect — inline status updates with
 *           selector + success/error feedback + row refresh.
 */
export const AdminOrderView = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detailDialogOrderId, setDetailDialogOrderId] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await orderApi.getAdminOrders(
        statusFilter || undefined
      );
      const data = response?.data || [];

      if (!Array.isArray(data)) {
        setOrders([]);
        return;
      }

      setOrders(data);
      setPage(1);
    } catch (err) {
      setOrders([]);

      if (err?.status === 403) {
        setError('Bạn không có quyền truy cập đơn hàng quản trị.');
      } else {
        setError(err?.message || 'Không thể tải đơn hàng. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  const pagedOrders = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return orders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [orders, page]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewDetails = useCallback((order) => {
    setDetailDialogOrderId(order.id);
    setIsDetailDialogOpen(true);
  }, []);

  const handleStatusUpdated = useCallback(
    (updatedOrder) => {
      if (!updatedOrder?.id) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updatedOrder.id
            ? { ...o, ...updatedOrder }
            : o
        )
      );
    },
    []
  );

  const columns = useMemo(
    () => [
      {
        key: 'customer',
        header: 'Khách hàng',
        width: proportional(2),
        renderCell: (order) => (
          <VStack gap={0}>
            <Text weight="semibold">
              {order.user?.fullName || order.user?.username || '—'}
            </Text>
            <Text size="supporting" color="secondary">
              {order.user?.email || '—'}
            </Text>
          </VStack>
        ),
      },
      {
        key: 'id',
        header: 'Mã đơn hàng',
        width: proportional(1),
        renderCell: (order) => (
          <Text size="supporting" hasTabularNumbers>
            {buildOrderId(order.id)}
          </Text>
        ),
      },
      {
        key: 'createdAt',
        header: 'Ngày',
        width: proportional(1.5),
        renderCell: (order) => (
          <Text size="supporting" color="secondary">
            {formatDate(order.createdAt)}
          </Text>
        ),
      },
      {
        key: 'totalAmount',
        header: 'Tổng cộng',
        width: proportional(1),
        align: 'end',
        renderCell: (order) => (
          <Text weight="semibold" hasTabularNumbers>
            {formatPrice(order.totalAmount)}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái đơn hàng',
        width: proportional(2),
        renderCell: (order) => (
          <OrderStatusSelect
            order={order}
            onStatusUpdated={handleStatusUpdated}
          />
        ),
      },
      {
        key: 'paymentStatus',
        header: 'Thanh toán',
        width: proportional(1),
        renderCell: (order) => {
          const paymentStatus = order.payment?.paymentStatus || 'unpaid';
          return <PaymentStatusBadge status={paymentStatus} />;
        },
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: pixel(72),
        align: 'end',
        resizable: false,
        renderCell: (order) => (
          <MoreMenu
            label={`Actions for order ${buildOrderId(order.id)}`}
            items={[
              {
            label: 'Xem chi tiết',
                onClick: () => handleViewDetails(order),
              },
            ]}
          />
        ),
      },
    ],
    [handleViewDetails, handleStatusUpdated]
  );

  /* ---------- Permission Denied ---------- */
  if (error && error.includes('permission')) {
    return (
      <VStack
        style={{
          width: '100%',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Quản lý đơn hàng</Heading>
          <Text color="secondary">
            Xem và quản lý tất cả đơn hàng của khách hàng.
          </Text>
        </VStack>

        <EmptyState
          title="Truy cập bị từ chối"
          description={error}
          isCompact
        />
      </VStack>
    );
  }

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <VStack
        style={{
          width: '100%',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Quản lý đơn hàng</Heading>
          <Text color="secondary">
            Xem và quản lý tất cả đơn hàng của khách hàng.
          </Text>
        </VStack>

        <AdminTable
          columns={columns}
          data={[]}
          isLoading
        />
      </VStack>
    );
  }

  /* ---------- API Error (non-permission) ---------- */
  if (error) {
    return (
      <VStack
        style={{
          width: '100%',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Quản lý đơn hàng</Heading>
          <Text color="secondary">
            Xem và quản lý tất cả đơn hàng của khách hàng.
          </Text>
        </VStack>

        <Alert
          title="Không thể tải đơn hàng"
          description={error}
          actionLabel="Thử lại"
          onAction={fetchOrders}
        />
      </VStack>
    );
  }

  /* ---------- Empty ---------- */
  if (!orders.length) {
    return (
      <VStack
        style={{
          width: '100%',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Quản lý đơn hàng</Heading>
          <Text color="secondary">
            Xem và quản lý tất cả đơn hàng của khách hàng.
          </Text>
        </VStack>

        <Toolbar
          label="Bộ lọc đơn hàng"
          startContent={
            <Selector
              label="Lọc theo trạng thái"
              isLabelHidden
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              placeholder="Tất cả trạng thái"
              width="220px"
            />
          }
          endContent={
            statusFilter ? (
              <Button
                label="Xóa bộ lọc"
                variant="ghost"
                onClick={() => setStatusFilter('')}
              />
            ) : null
          }
        />

        <AdminTable
          columns={columns}
          data={[]}
          emptyTitle={statusFilter ? 'Không có đơn hàng phù hợp' : 'Chưa có đơn hàng'}
          emptyDescription={
            statusFilter
              ? `Không có đơn hàng với trạng thái "${ORDER_STATUS_LABELS[statusFilter] || statusFilter}". Hãy xóa bộ lọc hoặc thử trạng thái khác.`
              : 'Chưa có đơn hàng nào được đặt. Đơn hàng sẽ xuất hiện tại đây sau khi khách hàng hoàn tất thanh toán.'
          }
          isLoading={isLoading}
          error={null}
        />
      </VStack>
    );
  }

  /* ---------- Success ---------- */
  return (
    <VStack
      style={{
        width: '100%',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)',
      }}
    >
      <VStack gap={1}>
        <Heading level={1}>Quản lý đơn hàng</Heading>
        <Text color="secondary">
          {statusFilter
            ? `${orders.length} đơn hàng với trạng thái "${ORDER_STATUS_LABELS[statusFilter] || statusFilter}"`
            : `Tổng cộng ${orders.length} đơn hàng`}
        </Text>
      </VStack>

      <Toolbar
        label="Bộ lọc đơn hàng"
        startContent={
          <Selector
            label="Lọc theo trạng thái"
            isLabelHidden
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            placeholder="Tất cả trạng thái"
            width="220px"
          />
        }
        endContent={
          statusFilter ? (
            <Button
              label="Xóa bộ lọc"
              variant="ghost"
              onClick={() => setStatusFilter('')}
            />
          ) : null
        }
      />

      <AdminTable
        columns={columns}
        data={pagedOrders}
        emptyTitle="Không tìm thấy đơn hàng"
        emptyDescription="Không có đơn hàng phù hợp với bộ lọc hiện tại. Hãy thử trạng thái khác."
        isLoading={false}
        error={null}
      />

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <AdminOrderDetailDialog
        isOpen={isDetailDialogOpen}
        orderId={detailDialogOrderId}
        onOpenChange={setIsDetailDialogOpen}
      />
    </VStack>
  );
};

export default AdminOrderView;
