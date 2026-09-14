/**
 * Tiện ích xuất dữ liệu báo cáo ra tệp CSV (mở trực tiếp bằng Excel).
 * Không phụ thuộc thư viện ngoài để giữ bundle gọn nhẹ.
 */

const escapeCell = (value) => {
  if (value === null || value === undefined) return '';

  const text = String(value);

  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Tạo nội dung CSV từ tiêu đề cột và các dòng dữ liệu.
 * Kèm BOM để Excel nhận đúng UTF-8 (tiếng Việt).
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 * @returns {string}
 */
export const buildCsvContent = (headers, rows) => {
  const lines = [headers.map(escapeCell).join(',')];

  rows.forEach((row) => {
    lines.push(row.map(escapeCell).join(','));
  });

  return `\uFEFF${lines.join('\r\n')}`;
};

/**
 * Tạo và tải xuống tệp CSV trên trình duyệt.
 * @param {string} filename
 * @param {string[]} headers
 * @param {Array<Array<string|number>>} rows
 */
export const downloadCsv = (filename, headers, rows) => {
  const blob = new Blob([buildCsvContent(headers, rows)], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
