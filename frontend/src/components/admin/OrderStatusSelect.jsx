import React, { useCallback, useState } from 'react';
import { Selector, VStack } from '@astryxdesign/core';
import { orderApi } from '../../api/orderApi';
import { useNotification } from '../../contexts/NotificationContext';
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_LABELS,
} from '../../constants/orderConstants';

/**
 * Maps order status values to Selector option objects consumed by the
 * Astryx Selector component.
 */
const STATUS_OPTIONS = ORDER_STATUS_VALUES.map((value) => ({
  label: ORDER_STATUS_LABELS[value] || value,
  value,
}));

/**
 * OrderStatusSelect
 *
 * Inline admin status selector that calls PUT /api/admin/orders/:id/status
 * on change and shows transient success/error feedback.
 *
 * Design doc: §17.2 OrderStatusSelector
 * Options: pending, confirmed, shipping, completed, cancelled
 * Astryx: Selector
 *
 * Props:
 *   order         – the order object (must have id and status)
 *   onStatusUpdated – callback invoked after a successful status update
 *                     so the parent can refresh the row or list state
 *
 * States:
 *   idle          – Selector shows current status, enabled
 *   pending       – Selector disabled, API call in-flight
 *   success       – brief green "Saved" text, auto-clears
 *   error         – brief red error text, auto-clears
 *
 * ponytail: If the backend ever requires a confirmation step before
 *           certain transitions (e.g., completed → cancelled), add an
 *           AlertDialog gate here before calling the API.
 */
export const OrderStatusSelect = ({ order, onStatusUpdated }) => {
  const notification = useNotification();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!newStatus || newStatus === order.status) return;

      setIsUpdating(true);

      try {
        const response = await orderApi.updateOrderStatus(
          order.id,
          newStatus
        );
        const updatedOrder = response?.data || response;

        notification.success({
          title: 'Đã cập nhật trạng thái',
          description:
            updatedOrder?.payment?.paymentStatus === 'paid'
              ? 'Đã cập nhật trạng thái. Thanh toán được đánh dấu là đã thanh toán.'
              : `Đã cập nhật trạng thái thành ${ORDER_STATUS_LABELS[newStatus] || newStatus}.`,
        });
        onStatusUpdated?.(updatedOrder || order);
      } catch (err) {
        notification.error({
          title: 'Không thể cập nhật trạng thái',
          description: err?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.',
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [notification, order, onStatusUpdated]
  );

  return (
    <VStack gap={1} align="start" style={{ minWidth: 140 }}>
      <Selector
        label={`Trạng thái đơn hàng ${order.id?.slice(0, 8) || ''}\u2026`}
        isLabelHidden
        value={order.status}
        onChange={handleStatusChange}
        options={STATUS_OPTIONS}
        isDisabled={isUpdating}
        width="148px"
      />

    </VStack>
  );
};

export default OrderStatusSelect;
