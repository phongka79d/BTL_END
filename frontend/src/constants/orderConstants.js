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
