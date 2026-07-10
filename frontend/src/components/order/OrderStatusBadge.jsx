import React from 'react';
import { Badge } from '@astryxdesign/core';
import { ORDER_STATUS_LABELS } from '../../constants/orderConstants';

/**
 * Ánh xạ các giá trị trạng thái đơn hàng thành các biến thể Badge của Astryx.
 *
 * Bản đồ biến thể (theo ánh xạ đã thiết lập ở (04A)):
 *   pending   → neutral   (đang chờ xử lý)
 *   confirmed → info      (tiến trình tích cực)
 *   shipping  → warning   (đang vận chuyển)
 *   completed → success   (thành công cuối cùng)
 *   cancelled → error     (thất bại cuối cùng)
 *
 * Nhãn được lấy từ hằng số ORDER_STATUS_LABELS dùng chung
 * (frontend/src/constants/orderConstants.js), giúp giao diện
 * nhất quán với selector trạng thái admin và bàn giao lô xử lý.
 *
 * ponytail: Nếu enum backend có thêm giá trị mới, hãy cập nhật bản đồ biến thể
 *           tại đây và thêm nhãn vào orderConstants.js.
 */
const ORDER_STATUS_VARIANT_MAP = {
  pending: 'neutral',
  confirmed: 'info',
  shipping: 'warning',
  completed: 'success',
  cancelled: 'error',
};

export const OrderStatusBadge = ({ status }) => {
  const label = ORDER_STATUS_LABELS[status] || status;
  const variant = ORDER_STATUS_VARIANT_MAP[status] || 'neutral';

  return <Badge variant={variant} label={label} />;
};

export default OrderStatusBadge;
