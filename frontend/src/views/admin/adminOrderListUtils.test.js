import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADMIN_ORDERS_PAGE_SIZE,
  buildAdminOrdersQuery,
  getAdminOrdersEmptyCopy,
  normalizeOrderKeyword,
  summarizeAdminOrders,
} from './adminOrderListUtils.js';

test('buildAdminOrdersQuery kết hợp từ khóa với trạng thái và phân trang', () => {
  assert.deepEqual(
    buildAdminOrdersQuery({ keyword: '  nguyễn văn a  ', status: 'pending', page: 2 }),
    {
      status: 'pending',
      keyword: 'nguyễn văn a',
      searchField: 'all',
      page: 2,
      limit: ADMIN_ORDERS_PAGE_SIZE,
    }
  );
});

test('buildAdminOrdersQuery bỏ tham số rỗng để không tạo truy vấn tìm kiếm rỗng', () => {
  assert.deepEqual(buildAdminOrdersQuery(), {
    status: undefined,
    keyword: undefined,
    searchField: undefined,
    page: 1,
    limit: ADMIN_ORDERS_PAGE_SIZE,
  });

  const whitespaceOnly = buildAdminOrdersQuery({ keyword: '   ', status: '', page: 3 });
  assert.equal(whitespaceOnly.keyword, undefined);
  assert.equal(whitespaceOnly.searchField, undefined);
  assert.equal(whitespaceOnly.status, undefined);
  // Từ khóa rỗng không được tự ý đổi trang; việc reset trang do view quyết định.
  assert.equal(whitespaceOnly.page, 3);
});

test('normalizeOrderKeyword chỉ nhận chuỗi và cắt khoảng trắng thừa', () => {
  assert.equal(normalizeOrderKeyword('  abc  '), 'abc');
  assert.equal(normalizeOrderKeyword(''), '');
  assert.equal(normalizeOrderKeyword(null), '');
  assert.equal(normalizeOrderKeyword(undefined), '');
  assert.equal(normalizeOrderKeyword(123), '');
});

test('trạng thái rỗng toàn cục khác trạng thái rỗng do tìm kiếm hoặc lọc', () => {
  const globalEmpty = getAdminOrdersEmptyCopy();
  const keywordEmpty = getAdminOrdersEmptyCopy({ keyword: '0905123456' });
  const statusEmpty = getAdminOrdersEmptyCopy({ status: 'pending', statusLabel: 'Chờ xác nhận' });

  assert.equal(globalEmpty.title, 'Chưa có đơn hàng');
  assert.notEqual(keywordEmpty.title, globalEmpty.title);
  assert.notEqual(statusEmpty.title, globalEmpty.title);
  assert.match(keywordEmpty.description, /0905123456/);
  assert.match(statusEmpty.description, /Chờ xác nhận/);
});

test('mô tả rỗng nêu cả từ khóa lẫn trạng thái khi kết hợp bộ lọc', () => {
  const copy = getAdminOrdersEmptyCopy({
    keyword: '0905123456',
    status: 'shipped',
    statusLabel: 'Đang giao',
  });

  assert.equal(copy.title, 'Không có đơn hàng phù hợp');
  assert.match(copy.description, /0905123456/);
  assert.match(copy.description, /Đang giao/);
});

test('summarizeAdminOrders giữ tổng số khi không lọc và nêu bộ lọc đang áp dụng', () => {
  assert.equal(summarizeAdminOrders({ count: 7 }), 'Tổng cộng 7 đơn hàng');

  const keywordOnly = summarizeAdminOrders({ count: 3, keyword: '0905123456' });
  assert.match(keywordOnly, /^3 đơn hàng/);
  assert.match(keywordOnly, /0905123456/);

  const statusOnly = summarizeAdminOrders({ count: 2, status: 'pending', statusLabel: 'Chờ xác nhận' });
  assert.match(statusOnly, /^2 đơn hàng/);
  assert.match(statusOnly, /Chờ xác nhận/);

  const combined = summarizeAdminOrders({
    count: 1,
    keyword: '0905123456',
    status: 'pending',
    statusLabel: 'Chờ xác nhận',
  });
  assert.match(combined, /^1 đơn hàng/);
  assert.match(combined, /0905123456/);
  assert.match(combined, /Chờ xác nhận/);
});
