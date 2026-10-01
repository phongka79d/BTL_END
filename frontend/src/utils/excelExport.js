import { ORDER_STATUS_LABELS, ORDER_STATUS_VALUES } from '../constants/orderConstants.js';

const textCell = (value) => ({ type: String, value: String(value ?? '') });
const numberCell = (value, format = '#,##0') => ({ type: Number, value: Number(value ?? 0), format });
const headerRow = (labels) => labels.map((value) => ({ ...textCell(value), fontWeight: 'bold' }));
const CURRENCY_FORMAT = '#,##0.00" ₫"';

export const buildReportFileName = (range) => {
  const suffix = range?.startDate || range?.endDate
    ? `${range.startDate || 'dau-ky'}_${range.endDate || 'cuoi-ky'}`
    : 'toan-thoi-gian';
  return `tsshop-report-${suffix.replace(/[<>:"/\\|?*\p{Cc}]/gu, '-')}.xlsx`;
};

export const buildReportWorkbook = ({ revenue = {}, products = [], orderSummary = {}, range = null } = {}) => [
  {
    sheet: 'Revenue',
    columns: [{ width: 32 }, { width: 26 }],
    stickyRowsCount: 1,
    data: [
      headerRow(['Chỉ số', 'Giá trị']),
      [textCell('Từ ngày'), textCell(range?.startDate || 'Không giới hạn')],
      [textCell('Đến ngày'), textCell(range?.endDate || 'Không giới hạn')],
      [textCell('Tổng doanh thu'), numberCell(revenue.totalRevenue, CURRENCY_FORMAT)],
      [textCell('Số đơn hoàn tất'), numberCell(revenue.completedOrderCount)],
    ],
  },
  {
    sheet: 'Order Summary',
    columns: [{ width: 26 }, { width: 18 }],
    stickyRowsCount: 1,
    data: [
      headerRow(['Trạng thái', 'Số lượng']),
      ...ORDER_STATUS_VALUES.map((status) => [
        textCell(ORDER_STATUS_LABELS[status] || status),
        numberCell(orderSummary[status]),
      ]),
    ],
  },
  {
    sheet: 'Best Selling Products',
    columns: [{ width: 38 }, { width: 36 }, { width: 22 }, { width: 20 }, { width: 24 }],
    stickyRowsCount: 1,
    data: [
      headerRow(['Mã sản phẩm', 'Tên sản phẩm', 'Thương hiệu', 'Số lượng đã bán', 'Doanh thu']),
      ...products.map((product) => [
        textCell(product.productId),
        textCell(product.name),
        textCell(product.brand),
        numberCell(product.soldQuantity),
        product.revenue == null ? textCell('') : numberCell(product.revenue, CURRENCY_FORMAT),
      ]),
    ],
  },
];

export const createReportWorkbookBlob = async (report) => {
  const { default: writeExcelFile } = await import('write-excel-file/universal');
  return writeExcelFile(buildReportWorkbook(report)).toBlob();
};

export const downloadReportWorkbook = async (report) => {
  const blob = await createReportWorkbookBlob(report);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildReportFileName(report.range);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
