import React, { useState, useEffect } from 'react';
import { Card, Heading, Text, VStack, Button } from '@astryxdesign/core';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { reportApi } from '../../api/reportApi';
import { useNotification } from '../../contexts/NotificationContext';
import { OrdersIcon, RefreshIcon } from '../../components/common/LayoutIcons';

export const StaffReportView = () => {
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState({
    pending: 0,
    confirmed: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0
  });
  const [bestSellers, setBestSellers] = useState([]);
  const { notifyError } = useNotification();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [summaryRes, bestSellersRes] = await Promise.all([
        reportApi.getOrderSummaryReport(),
        reportApi.getBestSellingProductsReport()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setOrderSummary(summaryRes.data);
      }

      if (bestSellersRes.success && bestSellersRes.data) {
        const items = Array.isArray(bestSellersRes.data) ? bestSellersRes.data : [];
        setBestSellers(items);
      }
    } catch (err) {
      console.error('Failed to load operational reports:', err);
      notifyError('Không thể tải báo cáo vận hành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalOrders =
    (orderSummary.pending || 0) +
    (orderSummary.confirmed || 0) +
    (orderSummary.shipping || 0) +
    (orderSummary.completed || 0) +
    (orderSummary.cancelled || 0);

  const bestSellerColumns = [
    {
      key: 'rank',
      title: '#',
      width: '50px',
      render: (_, __, idx) => <span style={{ fontWeight: 600, color: 'var(--color-text-secondary, #6b7280)' }}>{idx + 1}</span>
    },
    {
      key: 'name',
      title: 'Tên sản phẩm',
      render: (name, row) => (
        <VStack gap={1}>
          <span style={{ fontWeight: 600 }}>{name || 'Sản phẩm'}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #6b7280)' }}>
            Hãng: {row.brand || '-'}
          </span>
        </VStack>
      )
    },
    {
      key: 'soldQuantity',
      title: 'Số lượng đã bán',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--color-text-accent)' }}>
          {val || 0} sản phẩm
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Báo cáo vận hành"
        subtitle="Tổng hợp dữ liệu xử lý đơn hàng và số lượng tiêu thụ sản phẩm."
        actions={
          <Button
            label="Làm mới"
            variant="secondary"
            size="sm"
            onClick={fetchReports}
            icon={<RefreshIcon size={14} />}
          />
        }
      />

      {/* KPI Cards: Order status distribution */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)'
        }}
      >
        <StatCard
          title="Tổng đơn hàng"
          value={totalOrders}
          subtitle="Tất cả đơn trong hệ thống"
          icon={<OrdersIcon size={18} />}
        />
        <StatCard
          title="Chờ tiếp nhận"
          value={orderSummary.pending || 0}
          subtitle="Đang chờ xác nhận"
          variant={orderSummary.pending > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Đã xác nhận"
          value={orderSummary.confirmed || 0}
          subtitle="Đang chuẩn bị hàng"
          variant="primary"
        />
        <StatCard
          title="Đang giao hàng"
          value={orderSummary.shipping || 0}
          subtitle="Trên đường vận chuyển"
        />
        <StatCard
          title="Đã hoàn thành"
          value={orderSummary.completed || 0}
          subtitle="Giao thành công"
          variant="success"
        />
      </div>

      {/* Top selling products table */}
      <Card padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={4} style={{ margin: 0, fontWeight: 600 }}>
              Sản phẩm bán chạy nhất (Top volume)
            </Heading>
            <Text size="xs" color="secondary" style={{ margin: 0 }}>
              Xếp hạng theo tổng sản lượng đã giao thành công
            </Text>
          </VStack>

          <DataTable
            columns={bestSellerColumns}
            data={bestSellers}
            loading={loading}
          />
        </VStack>
      </Card>
    </div>
  );
};

export default StaffReportView;
