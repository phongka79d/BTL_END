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
  { label: 'All statuses', value: '' },
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
        setError('You do not have permission to access admin orders.');
      } else {
        setError(err?.message || 'Unable to load orders. Please try again.');
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
        header: 'Customer',
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
        header: 'Order ID',
        width: proportional(1),
        renderCell: (order) => (
          <Text size="supporting" hasTabularNumbers>
            {buildOrderId(order.id)}
          </Text>
        ),
      },
      {
        key: 'createdAt',
        header: 'Date',
        width: proportional(1.5),
        renderCell: (order) => (
          <Text size="supporting" color="secondary">
            {formatDate(order.createdAt)}
          </Text>
        ),
      },
      {
        key: 'totalAmount',
        header: 'Total',
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
        header: 'Order Status',
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
        header: 'Payment',
        width: proportional(1),
        renderCell: (order) => {
          const paymentStatus = order.payment?.paymentStatus || 'unpaid';
          return <PaymentStatusBadge status={paymentStatus} />;
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        width: pixel(72),
        align: 'end',
        resizable: false,
        renderCell: (order) => (
          <MoreMenu
            label={`Actions for order ${buildOrderId(order.id)}`}
            items={[
              {
                label: 'View Details',
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
          <Heading level={1}>Manage Orders</Heading>
          <Text color="secondary">
            View and manage all customer orders.
          </Text>
        </VStack>

        <EmptyState
          title="Access denied"
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
          <Heading level={1}>Manage Orders</Heading>
          <Text color="secondary">
            View and manage all customer orders.
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
          <Heading level={1}>Manage Orders</Heading>
          <Text color="secondary">
            View and manage all customer orders.
          </Text>
        </VStack>

        <Alert
          title="Unable to load orders"
          description={error}
          actionLabel="Retry"
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
          <Heading level={1}>Manage Orders</Heading>
          <Text color="secondary">
            View and manage all customer orders.
          </Text>
        </VStack>

        <Toolbar
          label="Order filters"
          startContent={
            <Selector
              label="Filter by status"
              isLabelHidden
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              placeholder="All statuses"
              width="220px"
            />
          }
          endContent={
            statusFilter ? (
              <Button
                label="Clear filter"
                variant="ghost"
                onClick={() => setStatusFilter('')}
              />
            ) : null
          }
        />

        <AdminTable
          columns={columns}
          data={[]}
          emptyTitle={statusFilter ? 'No matching orders' : 'No orders yet'}
          emptyDescription={
            statusFilter
              ? `No orders with status "${ORDER_STATUS_LABELS[statusFilter] || statusFilter}". Clear the filter or try a different status.`
              : 'No orders have been placed yet. Orders will appear here once customers complete checkout.'
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
        <Heading level={1}>Manage Orders</Heading>
        <Text color="secondary">
          {statusFilter
            ? `${orders.length} order${orders.length !== 1 ? 's' : ''} with status "${ORDER_STATUS_LABELS[statusFilter] || statusFilter}"`
            : `${orders.length} order${orders.length !== 1 ? 's' : ''} total`}
        </Text>
      </VStack>

      <Toolbar
        label="Order filters"
        startContent={
          <Selector
            label="Filter by status"
            isLabelHidden
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            placeholder="All statuses"
            width="220px"
          />
        }
        endContent={
          statusFilter ? (
            <Button
              label="Clear filter"
              variant="ghost"
              onClick={() => setStatusFilter('')}
            />
          ) : null
        }
      />

      <AdminTable
        columns={columns}
        data={pagedOrders}
        emptyTitle="No orders found"
        emptyDescription="No orders match the current filter. Try a different status."
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
