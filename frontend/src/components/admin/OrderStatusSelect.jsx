import React, { useCallback, useState } from 'react';
import { Selector, VStack } from '@astryxdesign/core';
import { orderApi } from '../../api/orderApi';
import { useNotification } from '../../contexts/NotificationContext';
import {
  ORDER_STATUS_LABELS,
  getAllowedNextStatuses,
} from '../../constants/orderConstants';

/**
 * Chỉ cho phép chọn trạng thái hiện tại hoặc trạng thái kế tiếp hợp lệ,
 * khớp với sơ đồ chuyển trạng thái mà backend thực thi.
 */
const buildStatusOptions = (currentStatus) => {
  const selectableStatuses = [currentStatus, ...getAllowedNextStatuses(currentStatus)]
    .filter(Boolean);

  return selectableStatuses.map((value) => ({
    label: ORDER_STATUS_LABELS[value] || value,
    value,
  }));
};

/**
 * OrderStatusSelect
 *
 * Selector trạng thái nội tuyến của admin gọi PUT /api/admin/orders/:id/status
 * khi thay đổi và hiển thị phản hồi thành công/lỗi tạm thời.
 *
 * Tài liệu thiết kế: §17.2 OrderStatusSelector
 * Options: pending, confirmed, shipping, completed, cancelled
 * Astryx: Selector
 *
 * Props:
 *   order         – đối tượng đơn hàng (phải có id và status)
 *   onStatusUpdated – hàm callback được gọi sau khi cập nhật trạng thái thành công
 *                     để thành phần cha có thể làm mới dòng hoặc trạng thái danh sách
 *
 * Trạng thái:
 *   idle          – Selector hiển thị trạng thái hiện tại, được bật
 *   pending       – Selector bị tắt, yêu cầu API đang thực hiện
 *   success       – dòng chữ màu xanh "Đã lưu" ngắn hạn, tự xóa
 *   error         – dòng chữ lỗi màu đỏ ngắn hạn, tự xóa
 *
 * ponytail: Nếu backend yêu cầu bước xác nhận trước một số chuyển đổi
 *           (ví dụ completed → cancelled), hãy thêm lớp chặn AlertDialog
 *           tại đây trước khi gọi API.
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

  const statusOptions = buildStatusOptions(order.status);
  const hasTransitions = getAllowedNextStatuses(order.status).length > 0;

  return (
    <VStack gap={1} align="start" style={{ minWidth: 140 }}>
      <Selector
        label={`Trạng thái đơn hàng ${order.id?.slice(0, 8) || ''}\u2026`}
        isLabelHidden
        value={order.status}
        onChange={handleStatusChange}
        options={statusOptions}
        isDisabled={isUpdating || !hasTransitions}
        width="148px"
      />

    </VStack>
  );
};

export default OrderStatusSelect;
