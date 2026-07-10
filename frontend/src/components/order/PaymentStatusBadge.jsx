import React from 'react';
import { Badge } from '@astryxdesign/core';
import { PAYMENT_STATUS_LABELS } from '../../constants/orderConstants';

/**
 * Ánh xạ các giá trị trạng thái thanh toán thành các biến thể Badge của Astryx.
 *
 * Bản đồ biến thể (theo ánh xạ đã thiết lập ở (04A)):
 *   unpaid → neutral   (đang chờ thanh toán)
 *   paid   → success   (đã nhận thanh toán)
 *   failed → danger    (sự cố thanh toán)
 *
 * Nhãn được lấy từ hằng số PAYMENT_STATUS_LABELS dùng chung
 * (frontend/src/constants/orderConstants.js), giúp giao diện
 * nhất quán với các giao diện admin và bàn giao lô xử lý.
 *
 * ponytail: Nếu enum backend có thêm giá trị trạng thái thanh toán, hãy cập nhật
 *           bản đồ biến thể tại đây và thêm nhãn vào orderConstants.js.
 */
const PAYMENT_STATUS_VARIANT_MAP = {
  unpaid: 'neutral',
  paid: 'success',
  failed: 'danger',
};

export const PaymentStatusBadge = ({ status }) => {
  const label = PAYMENT_STATUS_LABELS[status] || status;
  const variant = PAYMENT_STATUS_VARIANT_MAP[status] || 'neutral';

  return <Badge variant={variant} label={label} />;
};

export default PaymentStatusBadge;
