/**
 * Các hằng số trạng thái đơn hàng và thanh toán dùng chung.
 *
 * Các giá trị này phải khớp tuyệt đối với enum schema Prisma của backend
 * (backend/prisma/schema.prisma). Đây là nguồn dữ liệu chuẩn duy nhất cho
 * các giá trị trạng thái được selector trạng thái admin, badge trạng thái đơn hàng,
 * badge trạng thái thanh toán và mọi giao diện cần hiển thị theo trạng thái sử dụng.
 *
 * ponytail: Nếu enum backend có thêm giá trị mới, chỉ cần cập nhật tệp này.
 */

export const ORDER_STATUS_VALUES = [
  'pending',
  'confirmed',
  'shipping',
  'completed',
  'cancelled',
];

export const PAYMENT_STATUS_VALUES = [
  'unpaid',
  'paid',
  'failed',
];

export const ORDER_STATUS_LABELS = {
  pending: 'Đang chờ',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
};

/**
 * Sơ đồ chuyển trạng thái đơn hàng được phép.
 * Phải khớp với ORDER_STATUS_TRANSITIONS trong backend/src/models/order.model.js —
 * backend vẫn là nơi thực thi quy tắc, giao diện chỉ giới hạn lựa chọn cho đúng.
 */
export const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * Các trạng thái khách hàng được phép tự hủy đơn (trước khi bàn giao vận chuyển).
 */
export const CUSTOMER_CANCELLABLE_STATUSES = ['pending', 'confirmed'];

export const getAllowedNextStatuses = (status) => (
  ORDER_STATUS_TRANSITIONS[status] || []
);

export const isCustomerCancellable = (status) => (
  CUSTOMER_CANCELLABLE_STATUSES.includes(status)
);
