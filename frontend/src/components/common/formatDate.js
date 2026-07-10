/**
 * Định dạng chuỗi ngày ISO để hiển thị.
 *
 * Sử dụng locale en-GB để hiển thị ngày theo kiểu Vương quốc Anh nhất quán
 * trong các giao diện đơn hàng khách hàng, bảng đơn hàng admin và bảng chi tiết đơn hàng.
 *
 * Trả về em dash khi input là giá trị falsy để nơi gọi không bao giờ hiển thị
 * "Invalid Date" trong giao diện.
 *
 * ponytail: Các bản sao formatDate() nội tuyến hiện có trong OrderHistoryView
 *           và OrderDetailPanel có thể được thay thế bằng import này
 *           trong lần refactor an toàn tiếp theo.
 *
 * @param {string|null|undefined} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '\u2014';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export default formatDate;
