import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@astryxdesign/core';
import { orderApi } from '../api/orderApi';
import { formatPrice } from '../components/product/productUtils';
import { formatDate } from '../components/common/formatDate';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Alert from '../components/common/Alert';
import { OrderBagIcon, RefreshIcon } from '../components/common/LayoutIcons';

const PAGE_SIZE = 10;

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
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
      setError(err?.message || 'Không thể tải đơn hàng. Vui lòng thử lại.');
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

  const columns = [
    {
      key: 'id',
      title: 'Mã đơn hàng',
      render: (id) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          #{id?.slice(0, 8)}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Ngày đặt',
      render: (date) => formatDate(date)
    },
    {
      key: 'totalAmount',
      title: 'Tổng tiền',
      render: (amount) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary, #111827)' }}>
          {formatPrice(amount)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái đơn hàng',
      render: (status) => <StatusBadge status={status} type="order" />
    },
    {
      key: 'payment',
      title: 'Thanh toán',
      render: (payment) => (
        <StatusBadge status={payment?.paymentStatus || 'unpaid'} type="payment" />
      )
    },
    {
      key: 'actions',
      title: 'Chi tiết',
      align: 'right',
      render: (_, order) => (
        <Button
          label="Xem chi tiết"
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${order.id}`);
          }}
        />
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <PageHeader
        title="Đơn hàng của tôi"
        subtitle="Xem lại và theo dõi tiến độ các đơn hàng bạn đã đặt trên tsshop."
        actions={
          <Button
            label="Làm mới"
            variant="secondary"
            size="sm"
            onClick={fetchOrders}
            icon={<RefreshIcon size={14} />}
          />
        }
      />

      {error && (
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <Alert
            title="Không thể tải đơn hàng"
            description={error}
            actionLabel="Thử lại"
            onAction={fetchOrders}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={pagedOrders}
        loading={isLoading}
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
        emptyState={
          <EmptyState
            icon={<OrderBagIcon size={36} />}
            title="Chưa có đơn hàng nào"
            description="Bạn chưa đặt đơn hàng nào. Hãy khám phá danh mục sản phẩm để bắt đầu mua sắm!"
            actionLabel="Khám phá sản phẩm"
            onAction={() => navigate('/products')}
          />
        }
        pagination={{
          page,
          totalPages,
          totalItems: orders.length,
          onPageChange: (p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
};

export default OrderHistoryView;
