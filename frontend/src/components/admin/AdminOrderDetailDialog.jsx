import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogHeader,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  Skeleton,
  Text,
  VStack,
} from '@astryxdesign/core';
import { orderApi } from '../../api/orderApi';
import OrderDetailPanel from '../order/OrderDetailPanel';
import Alert from '../common/Alert';
import { formatDate } from '../common/formatDate';

const sectionLabelStyle = {
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

/**
 * AdminOrderDetailDialog
 *
 * Hiển thị đầy đủ chi tiết đơn hàng trong dialog dành cho admin.
 * Bọc OrderDetailPanel dùng chung cùng metadata khách hàng bổ sung
 * (name, email, phone) mà bảng dành cho khách hàng cố ý lược bỏ.
 *
 * Tài liệu thiết kế: §17.3 AdminOrderDetailDialog
 * Các phần: thông tin khách hàng, địa chỉ giao hàng, thông tin thanh toán,
 *           các mục đơn hàng, trạng thái đơn hàng.
 *
 * Các trạng thái xử lý: loading (skeleton), success (thông tin khách hàng + bảng), error
 * (Alert có retry), not-found (fallback kiểu EmptyState).
 *
 * ponytail: Nếu backend bổ sung endpoint chi tiết đơn hàng riêng cho admin
 *           với các trường khách hàng bổ sung, hãy dùng endpoint đó thay cho
 *           endpoint GET /api/orders/:id dùng chung. Hiện tại endpoint dùng chung
 *           hoạt động vì admin có thể truy cập mọi đơn hàng.
 */
export const AdminOrderDetailDialog = ({ isOpen, orderId, onOpenChange }) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await orderApi.getOrderById(orderId);
      setOrder(response?.data || response);
    } catch (err) {
      setOrder(null);

      if (err?.status === 404) {
      setError('Không tìm thấy đơn hàng. Đơn hàng có thể đã bị xóa.');
      } else {
      setError(err?.message || 'Không thể tải chi tiết đơn hàng.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId, fetchOrderDetail]);

  const handleClose = useCallback(() => {
    setOrder(null);
    setError(null);
    onOpenChange?.(false);
  }, [onOpenChange]);

  /* ---------- Các hàm hỗ trợ hiển thị ---------- */

  const renderContent = () => {
    /* ---- Đang tải ---- */
    if (isLoading) {
      return (
        <LayoutContent isScrollable>
          <VStack gap={4} style={{ width: '100%' }}>
            <Skeleton width="280px" height="var(--spacing-8)" radius="rounded" />
            <Skeleton width="100%" height="var(--spacing-12)" radius="rounded" />
            <Skeleton width="100%" height="var(--spacing-8)" radius="rounded" />
            <Skeleton width="100%" height="var(--spacing-12)" radius="rounded" />
            <Skeleton width="100%" height="var(--spacing-16)" radius="rounded" />
            <Skeleton width="100%" height="var(--spacing-8)" radius="rounded" />
          </VStack>
        </LayoutContent>
      );
    }

    /* ---- Lỗi ---- */
    if (error) {
      return (
        <LayoutContent isScrollable>
          <Alert
            title="Không thể tải chi tiết đơn hàng"
            description={error}
            actionLabel="Thử lại"
            onAction={fetchOrderDetail}
          />
        </LayoutContent>
      );
    }

    /* ---- Không tìm thấy / không có đơn hàng ---- */
    if (!order) {
      return (
        <LayoutContent isScrollable>
          <VStack gap={3} align="center" style={{ paddingBlock: 'var(--spacing-8)' }}>
            <Text weight="semibold">Đơn hàng không khả dụng</Text>
            <Text color="secondary" align="center">
              The order could not be loaded. It may have been removed
              or the server is unavailable.
            </Text>
          </VStack>
        </LayoutContent>
      );
    }

    /* ---- Thành công ---- */
    const customer = order.user || {};

    return (
      <LayoutContent isScrollable>
        <VStack gap={4} style={{ width: '100%' }}>
          {/* Thông tin khách hàng */}
          <Card padding={4}>
            <VStack gap={3}>
              <Text
                size="supporting"
                color="accent"
                weight="semibold"
                style={sectionLabelStyle}
              >
                Customer Information
              </Text>

              <HStack gap={1}>
                <Text color="secondary">Tên</Text>
                <Text weight="semibold">
                  {customer.fullName || customer.username || '—'}
                </Text>
              </HStack>

              {customer.email && (
                <HStack gap={1}>
                  <Text color="secondary">Email</Text>
                  <Text>{customer.email}</Text>
                </HStack>
              )}

              {customer.phone && (
                <HStack gap={1}>
                <Text color="secondary">Số điện thoại</Text>
                  <Text>{customer.phone}</Text>
                </HStack>
              )}

              {customer.createdAt && (
                <HStack gap={1}>
                <Text color="secondary">Khách hàng từ</Text>
                  <Text>{formatDate(customer.createdAt)}</Text>
                </HStack>
              )}
            </VStack>
          </Card>

          {/* Chi tiết đơn hàng (giao hàng, thanh toán, mục hàng, trạng thái, tổng tiền) */}
          <OrderDetailPanel order={order} />
        </VStack>
      </LayoutContent>
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={handleClose}
      purpose="default"
      width={720}
    >
      <Layout
        header={
          <DialogHeader
            title={order ? `Đơn hàng ${order.id.slice(0, 8)}…` : 'Chi tiết đơn hàng'}
            subtitle={
              order
                ? `Placed ${formatDate(order.createdAt)}`
                : 'Đang tải thông tin đơn hàng…'
            }
            onOpenChange={handleClose}
            hasDivider
          />
        }
        content={renderContent()}
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end">
              <Button
                label="Đóng"
                variant="secondary"
                onClick={handleClose}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
};

export default AdminOrderDetailDialog;
