import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, HStack, VStack, Card, Heading, Text, Badge } from '@astryxdesign/core';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../components/common/formatDate';
import { orderApi } from '../../api/orderApi';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import { formatPrice } from '../../components/product/productUtils';
import {
  OrdersIcon,
  ProductsIcon,
  ReviewsIcon,
  ChevronRightIcon
} from '../../components/common/LayoutIcons';

export const StaffDashboardView = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    shippingOrders: 0,
    lowStockProducts: 0,
    visibleReviews: 0,
    recentOrders: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes, reviewsRes] = await Promise.all([
          orderApi.getAdminOrders({ limit: 10 }),
          productApi.getProducts({ limit: 50 }),
          reviewApi.getAdminReviews({ limit: 20 })
        ]);

        let pendingCount = 0;
        let shippingCount = 0;
        let recentOrdersList = [];

        if (ordersRes.success && ordersRes.data) {
          const orders = ordersRes.data.orders || ordersRes.data.items || [];
          recentOrdersList = orders.slice(0, 5);
          pendingCount = orders.filter((o) => o.status === 'pending').length;
          shippingCount = orders.filter((o) => o.status === 'shipping').length;
        }

        let lowStockCount = 0;
        if (productsRes.success && productsRes.data) {
          const products = productsRes.data.products || productsRes.data.items || [];
          lowStockCount = products.filter((p) => (p.quantity || 0) <= 5).length;
        }

        let reviewsCount = 0;
        if (reviewsRes.success && reviewsRes.data) {
          const reviews = reviewsRes.data.reviews || reviewsRes.data.items || [];
          reviewsCount = reviews.length;
        }

        setStats({
          pendingOrders: pendingCount,
          shippingOrders: shippingCount,
          lowStockProducts: lowStockCount,
          visibleReviews: reviewsCount,
          recentOrders: recentOrdersList
        });
      } catch (err) {
        console.error('Failed to load staff dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const orderColumns = [
    {
      key: 'id',
      title: 'Mã đơn',
      render: (id) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{id.slice(0, 8)}</span>
    },
    {
      key: 'user',
      title: 'Khách hàng',
      render: (user) => user?.fullName || user?.username || 'Khách hàng'
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
      title: 'Thời gian',
      render: (date) => formatDate(date)
    }
  ];

  return (
    <div>
      <PageHeader
        title="Tổng quan vận hành"
        subtitle="Theo dõi tiến độ xử lý đơn hàng, tình trạng tồn kho và kiểm duyệt đánh giá khách hàng."
        actions={
          <Link to="/staff/orders" style={{ textDecoration: 'none' }}>
            <Button
              label="Xử lý đơn hàng"
              variant="primary"
              size="sm"
              icon={<OrdersIcon size={16} />}
            />
          </Link>
        }
      />

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)'
        }}
      >
        <StatCard
          title="Đơn hàng chờ xử lý"
          value={stats.pendingOrders}
          subtitle="Cần xác nhận và đóng gói"
          icon={<OrdersIcon size={20} />}
          variant={stats.pendingOrders > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Đang vận chuyển"
          value={stats.shippingOrders}
          subtitle="Đang giao tới khách hàng"
          icon={<OrdersIcon size={20} />}
          variant="primary"
        />
        <StatCard
          title="Cảnh báo sắp hết hàng"
          value={stats.lowStockProducts}
          subtitle="Sản phẩm tồn kho ≤ 5"
          icon={<ProductsIcon size={20} />}
          variant={stats.lowStockProducts > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Đánh giá cần kiểm duyệt"
          value={stats.visibleReviews}
          subtitle="Ý kiến phản hồi từ khách"
          icon={<ReviewsIcon size={20} />}
          variant="default"
        />
      </div>

      {/* Recent Orders Section */}
      <Card padding={4}>
        <VStack gap={4}>
          <HStack justify="between" align="center">
            <VStack gap={1}>
              <Heading level={4} style={{ margin: 0, fontWeight: 600 }}>
                Đơn hàng gần đây
              </Heading>
              <Text size="xs" color="secondary" style={{ margin: 0 }}>
                Các đơn hàng mới phát sinh cần ưu tiên tiếp nhận
              </Text>
            </VStack>

            <Link to="/staff/orders" style={{ textDecoration: 'none' }}>
              <Button
                label="Xem tất cả"
                variant="ghost"
                size="sm"
                icon={<ChevronRightIcon size={14} />}
              />
            </Link>
          </HStack>

          <DataTable
            columns={orderColumns}
            data={stats.recentOrders}
            loading={loading}
          />
        </VStack>
      </Card>
    </div>
  );
};

export default StaffDashboardView;
