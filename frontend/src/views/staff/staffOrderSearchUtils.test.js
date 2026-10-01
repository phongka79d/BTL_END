import test from 'node:test';
import assert from 'node:assert/strict';

import { buildOrderSearchQuery, resolveOrderSearchSubmit } from './staffOrderSearchUtils.js';

test('order search query combines exact field, keyword and status without the generic search alias', () => {
  assert.deepEqual(
    buildOrderSearchQuery({
      page: 2,
      keyword: '  HD-1042  ',
      searchField: 'shippingAddress',
      status: 'shipping'
    }),
    {
      page: 2,
      limit: 10,
      status: 'shipping',
      keyword: 'HD-1042',
      searchField: 'shippingAddress'
    }
  );

  // Khách hàng là phạm vi mặc định của bộ lọc mã đơn; giá trị đi thẳng vào query string.
  const customerQuery = buildOrderSearchQuery({
    page: 1,
    keyword: 'nguyen van a',
    searchField: 'customer',
    status: ''
  });
  assert.equal(customerQuery.searchField, 'customer');
  assert.equal(customerQuery.keyword, 'nguyen van a');
  assert.equal(customerQuery.status, undefined);
});

test('order search query drops keyword and field when the keyword is blank', () => {
  assert.deepEqual(
    buildOrderSearchQuery({ page: 1, keyword: '   ', searchField: 'customer', status: 'pending' }),
    {
      page: 1,
      limit: 10,
      status: 'pending',
      keyword: undefined,
      searchField: undefined
    }
  );
});

test('order search query defaults to page 1 with the order id field', () => {
  const query = buildOrderSearchQuery({ keyword: 'HD-1042' });

  assert.equal(query.page, 1);
  assert.equal(query.limit, 10);
  assert.equal(query.searchField, 'orderId');

  const emptyQuery = buildOrderSearchQuery();
  assert.equal(emptyQuery.page, 1);
  assert.equal(emptyQuery.keyword, undefined);
  assert.equal(emptyQuery.searchField, undefined);
  // Trang hiện tại được truyền xuyên suốt khi phân trang giữ nguyên phạm vi tìm kiếm.
  assert.equal(buildOrderSearchQuery({ page: 3, keyword: 'HD-1042', searchField: 'orderId' }).page, 3);
});

test('submitting the same keyword still queries page 1 with the active scope', () => {
  const plan = resolveOrderSearchSubmit({
    draftKeyword: '  HD-1042 ',
    keyword: 'HD-1042',
    searchField: 'customer',
    status: 'pending'
  });

  assert.equal(plan.keyword, 'HD-1042');
  assert.equal(plan.isKeywordUnchanged, true);
  // Không đổi từ khóa nên view phải tự tải lại: truy vấn vẫn giữ đúng phạm vi và về trang 1.
  assert.deepEqual(plan.query, {
    page: 1,
    limit: 10,
    status: 'pending',
    keyword: 'HD-1042',
    searchField: 'customer'
  });
});

test('submitting a new keyword trims it and resets to page 1', () => {
  const plan = resolveOrderSearchSubmit({
    draftKeyword: '  0912345678 ',
    keyword: 'HD-1042',
    searchField: 'customer',
    status: ''
  });

  assert.equal(plan.keyword, '0912345678');
  assert.equal(plan.isKeywordUnchanged, false);
  assert.equal(plan.query.page, 1);
  assert.equal(plan.query.keyword, '0912345678');
  assert.equal(plan.query.searchField, 'customer');
});

test('submitting an empty draft clears the keyword filter', () => {
  const plan = resolveOrderSearchSubmit({
    draftKeyword: '   ',
    keyword: 'HD-1042',
    searchField: 'orderId',
    status: 'completed'
  });

  assert.equal(plan.keyword, '');
  assert.equal(plan.isKeywordUnchanged, false);
  assert.equal(plan.query.keyword, undefined);
  assert.equal(plan.query.searchField, undefined);
  // Trạng thái đang chọn không bị xóa khi chỉ xóa từ khóa.
  assert.equal(plan.query.status, 'completed');
});

test('the same keyword in a different field produces different search semantics', () => {
  const byOrderId = resolveOrderSearchSubmit({
    draftKeyword: 'HD-1042',
    keyword: 'HD-1042',
    searchField: 'orderId',
    status: ''
  });
  const byShippingAddress = resolveOrderSearchSubmit({
    draftKeyword: 'HD-1042',
    keyword: 'HD-1042',
    searchField: 'shippingAddress',
    status: ''
  });

  assert.equal(byOrderId.query.searchField, 'orderId');
  assert.equal(byShippingAddress.query.searchField, 'shippingAddress');
  assert.notDeepEqual(byOrderId.query, byShippingAddress.query);
});
