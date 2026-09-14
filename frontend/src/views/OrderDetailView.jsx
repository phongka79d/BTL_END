import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  EmptyState,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from '@astryxdesign/core';
import { orderApi } from '../api/orderApi';
import { useNotification } from '../contexts/NotificationContext';
import { isCustomerCancellable } from '../constants/orderConstants';
import Alert from '../components/common/Alert';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import OrderDetailPanel from '../components/order/OrderDetailPanel';

/**
 * OrderDetailView
 *
 * Hiển thị đầy đủ chi tiết một đơn hàng thuộc khách hàng.
 * Sử dụng GET /api/orders/:id thông qua orderApi.getOrderById.
 *
 * Các trạng thái xử lý: loading, không tìm thấy (404), bị từ chối quyền (403),
 * lỗi API (4xx/5xx/mạng khác) và success.
 *
 * Tuân thủ tài liệu thiết kế: §§12.2, 24.9 (OrderDetailPanel với thông tin
 * đơn hàng, địa chỉ giao hàng, thông tin thanh toán, các mục đơn hàng,
 * trạng thái đơn hàng và điều hướng quay lại lịch sử đơn hàng).
 *
 * ponytail: Nếu API chi tiết đơn hàng có thêm trường mới (tracking, timeline
 *           giao hàng, nhiều thanh toán), hãy mở rộng OrderDetailPanel
 *           thay vì thêm trực tiếp nhiều phần hơn vào giao diện này.
 */
export const OrderDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [httpStatus, setHttpStatus] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = useCallback(async () => {
    if (!order?.id) return;

    setIsCancelling(true);

    try {
      const response = await orderApi.cancelOrder(order.id);
      const cancelledOrder = response?.data || response;

      setOrder((currentOrder) => ({
        ...(currentOrder || {}),
        ...(cancelledOrder || {}),
        status: 'cancelled'
      }));
      setIsCancelDialogOpen(false);
      notification.success({
        title: 'Đã hủy đơn hàng',
        description: 'Đơn hàng của bạn đã được hủy thành công.'
      });
    } catch (err) {
      notification.error({
        title: 'Không thể hủy đơn hàng',
        description: err?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.'
      });
    } finally {
      setIsCancelling(false);
    }
  }, [order, notification]);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHttpStatus(null);

    try {
      const response = await orderApi.getOrderById(id);
      const data = response?.data || response;

      if (!data || !data.id) {
        setError('Không tìm thấy đơn hàng.');
        setHttpStatus(404);
        return;
      }

      setOrder(data);
    } catch (err) {
      setError(
        err?.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại.'
      );
      setHttpStatus(err?.status || null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /* ---------- Đang tải ---------- */
  if (isLoading) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <VStack gap={1}>
          <Skeleton width="220px" height="var(--spacing-8)" radius="rounded" />
          <Skeleton width="300px" height="var(--spacing-5)" radius="rounded" />
        </VStack>

        <Card padding={4}>
          <VStack gap={3}>
            {[0, 1, 2, 3].map((index) => (
              <Skeleton
                key={index}
                width="100%"
                height="var(--spacing-10)"
                radius={2}
              />
            ))}
          </VStack>
        </Card>
      </VStack>
    );
  }

  /* ---------- Không tìm thấy ---------- */
  if (httpStatus === 404) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <EmptyState
          title="Không tìm thấy đơn hàng"
          description="Đơn hàng bạn đang tìm không tồn tại hoặc có thể đã bị xóa."
          actions={
            <HStack
              gap={3}
              style={{ justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                label="Quay lại đơn hàng"
                variant="primary"
                onClick={() => navigate('/orders')}
              />
              <Button
                label="Xem sản phẩm"
                variant="secondary"
                onClick={() => navigate('/products')}
              />
            </HStack>
          }
        />
      </VStack>
    );
  }

  /* ---------- Bị từ chối quyền ---------- */
  if (httpStatus === 403) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <EmptyState
          title="Truy cập bị từ chối"
          description="Bạn không có quyền xem đơn hàng này."
          actions={
            <HStack
              gap={3}
              style={{ justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Button
                label="Quay lại đơn hàng"
                variant="primary"
                onClick={() => navigate('/orders')}
              />
              <Button
                label="Về trang chủ"
                variant="secondary"
                onClick={() => navigate('/')}
              />
            </HStack>
          }
        />
      </VStack>
    );
  }

  /* ---------- Lỗi API ---------- */
  if (error) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)',
        }}
      >
        <Alert
          title="Không thể tải đơn hàng"
          description={error}
          actionLabel="Thử lại"
          onAction={fetchOrder}
        />

        <HStack style={{ justifyContent: 'center' }}>
          <Button
            label="Quay lại đơn hàng"
            variant="secondary"
            onClick={() => navigate('/orders')}
          />
        </HStack>
      </VStack>
    );
  }

  /* ---------- Thành công ---------- */
  return (
    <VStack
      style={{
        width: '100%',
        maxWidth: '800px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)',
      }}
    >
      <VStack gap={1}>
        <HStack
          gap={2}
          style={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Heading level={1}>Chi tiết đơn hàng</Heading>
        </HStack>
        <Text color="secondary">
          Xem chi tiết đơn hàng của bạn.
        </Text>
      </VStack>

      <HStack justify="between" align="center" style={{ flexWrap: 'wrap' }}>
        <Button
          label="← Quay lại đơn hàng"
          variant="ghost"
          size="small"
          onClick={() => navigate('/orders')}
        />

        {isCustomerCancellable(order.status) && (
          <Button
            label="Hủy đơn hàng"
            variant="destructive"
            size="small"
            isLoading={isCancelling}
            isDisabled={isCancelling}
            onClick={() => setIsCancelDialogOpen(true)}
          />
        )}
      </HStack>

      <OrderDetailPanel order={order} />

      <ConfirmationDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelOrder}
        title="Hủy đơn hàng"
        message="Bạn có chắc muốn hủy đơn hàng này? Số lượng sản phẩm sẽ được hoàn trả về kho và hành động này không thể hoàn tác."
        confirmLabel="Hủy đơn hàng"
        cancelLabel="Giữ đơn hàng"
        variant="danger"
        loading={isCancelling}
      />
    </VStack>
  );
};

export default OrderDetailView;
