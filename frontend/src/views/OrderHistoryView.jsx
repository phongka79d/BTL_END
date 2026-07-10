import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  EmptyState,
  Heading,
  HStack,
  Skeleton,
  Table,
  Text,
  VStack,
} from '@astryxdesign/core';
import { orderApi } from '../api/orderApi';
import { formatPrice } from '../components/product/productUtils';
import Alert from '../components/common/Alert';
import OrderStatusBadge from '../components/order/OrderStatusBadge';
import PaymentStatusBadge from '../components/order/PaymentStatusBadge';
import Pagination from '../components/common/Pagination';

const PAGE_SIZE = 10;

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

/**
 * OrderHistoryView
 *
 * Displays the authenticated customer's order history in a table
 * with status badges, totals, dates, and navigation to detail pages.
 *
 * States handled: loading, error, empty, success.
 *
 * ponytail: If backend adds server-side pagination or sorting params,
 *           replace client-side pagination with API-driven pagination
 *           without changing the column-render or badge mapping logic.
 */
export const OrderHistoryView = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await orderApi.getMyOrders();
      const data = response?.data || [];

      if (!Array.isArray(data)) {
        setOrders([]);
        return;
      }

      setOrders(data);
    } catch (err) {
      setError(err?.message || 'Không thể tải đơn hàng của bạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Mã đơn hàng',
        renderCell: (order) => (
          <Text size="supporting" hasTabularNumbers>
            {`#${order.id.slice(0, 8)}…`}
          </Text>
        ),
      },
      {
        key: 'createdAt',
        header: 'Ngày',
        renderCell: (order) => (
          <Text size="supporting" color="secondary">
            {formatDate(order.createdAt)}
          </Text>
        ),
      },
      {
        key: 'totalAmount',
        header: 'Tổng cộng',
        align: 'end',
        renderCell: (order) => (
          <Text weight="semibold" hasTabularNumbers>
            {formatPrice(order.totalAmount)}
          </Text>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        renderCell: (order) => <OrderStatusBadge status={order.status} />,
      },
      {
        key: 'paymentStatus',
        header: 'Thanh toán',
        renderCell: (order) => {
          const paymentStatus = order.payment?.paymentStatus || 'unpaid';
          return <PaymentStatusBadge status={paymentStatus} />;
        },
      },
      {
        key: 'actions',
        header: 'Thao tác',
        align: 'end',
        renderCell: (order) => (
          <Button
            label="Xem"
            variant="ghost"
            size="small"
            onClick={() => navigate(`/orders/${order.id}`)}
          />
        ),
      },
    ],
    [navigate]
  );

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '1100px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Đơn hàng của tôi</Heading>
          <Text color="secondary">
            Xem và theo dõi lịch sử đơn hàng của bạn.
          </Text>
        </VStack>

        <Card padding={4}>
          <VStack gap={3}>
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton
                key={index}
                height="var(--spacing-10)"
                radius={2}
              />
            ))}
          </VStack>
        </Card>
      </VStack>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '1100px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Đơn hàng của tôi</Heading>
          <Text color="secondary">
            Xem và theo dõi lịch sử đơn hàng của bạn.
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
          maxWidth: '1100px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Heading level={1}>Đơn hàng của tôi</Heading>
          <Text color="secondary">
            Xem và theo dõi lịch sử đơn hàng của bạn.
          </Text>
        </VStack>

        <EmptyState
          title="Chưa có đơn hàng"
          description="Bạn chưa đặt đơn hàng nào. Hãy bắt đầu mua sắm để xem lịch sử đơn hàng tại đây."
          actions={
            <HStack gap={3} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                label="Xem sản phẩm"
                variant="primary"
                onClick={() => navigate('/products')}
              />
              <Button
                label="Xem giỏ hàng"
                variant="secondary"
                onClick={() => navigate('/cart')}
              />
            </HStack>
          }
        />
      </VStack>
    );
  }

  /* ---------- Success ---------- */
  return (
    <VStack
      style={{
        width: '100%',
        maxWidth: '1100px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)',
      }}
    >
      <VStack gap={1}>
        <Heading level={1}>Đơn hàng của tôi</Heading>
        <Text color="secondary">
          Bạn có {orders.length} đơn hàng.
        </Text>
      </VStack>

      <Card padding={0} style={{ width: '100%', minWidth: 0 }}>
        <Table
          columns={columns}
          data={pagedOrders}
          idKey="id"
          density="balanced"
          dividers="rows"
          hasHover
          textOverflow="truncate"
        />
      </Card>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </VStack>
  );
};

export default OrderHistoryView;
