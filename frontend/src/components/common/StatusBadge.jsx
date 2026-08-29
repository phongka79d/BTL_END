import React from 'react';
import { Badge } from '@astryxdesign/core';

/**
 * Mappings trạng thái và màu sắc thống nhất cho toàn bộ hệ thống.
 */
const STATUS_CONFIGS = {
  // Order Status
  pending: { label: 'Chờ xử lý', variant: 'yellow' },
  confirmed: { label: 'Đã xác nhận', variant: 'blue' },
  shipping: { label: 'Đang giao hàng', variant: 'purple' },
  completed: { label: 'Hoàn thành', variant: 'green' },
  cancelled: { label: 'Đã hủy', variant: 'red' },

  // Payment Status
  unpaid: { label: 'Chưa thanh toán', variant: 'yellow' },
  paid: { label: 'Đã thanh toán', variant: 'green' },
  failed: { label: 'Thanh toán thất bại', variant: 'red' },

  // Review Status
  visible: { label: 'Hiển thị', variant: 'green' },
  hidden: { label: 'Đã ẩn', variant: 'neutral' },
  // Role
  admin: { label: 'Quản trị viên', variant: 'blue' },
  staff: { label: 'Nhân viên vận hành', variant: 'purple' },
  customer: { label: 'Khách hàng', variant: 'neutral' },

  // User Account Status
  active: { label: 'Hoạt động', variant: 'green' },
  blocked: { label: 'Đã khóa', variant: 'red' }
};

/**
 * StatusBadge Component chuẩn hóa hiển thị trạng thái
 * @param {string} status - Mã trạng thái
 */
export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalizedKey = String(status).toLowerCase();
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status,
    variant: 'neutral'
  };

  return (
    <Badge
      variant={config.variant}
      label={config.label}
      className={`app-status-badge app-status-${normalizedKey} ${className}`}
    />
  );
};

export default StatusBadge;
