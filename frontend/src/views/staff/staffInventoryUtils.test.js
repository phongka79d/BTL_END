import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INVENTORY_PAGE_SIZE,
  buildInventoryQuery,
  canSaveStockDraft,
  getStockDraftError,
  resolveInventoryPagination
} from './staffInventoryUtils.js';

test('inventory loader forwards keyword and stockStatus to backend pagination', () => {
  assert.deepEqual(buildInventoryQuery({ page: 2, keyword: 'tai nghe', stockStatus: 'low' }), {
    page: 2,
    limit: INVENTORY_PAGE_SIZE,
    keyword: 'tai nghe',
    stockStatus: 'low'
  });

  // Không lọc: tham số rỗng bị bỏ khỏi truy vấn thay vì gửi chuỗi rỗng.
  assert.deepEqual(buildInventoryQuery({ page: 1, keyword: '   ', stockStatus: '' }), {
    page: 1,
    limit: INVENTORY_PAGE_SIZE,
    keyword: undefined,
    stockStatus: undefined
  });

  assert.equal(buildInventoryQuery().stockStatus, undefined);
  assert.equal(buildInventoryQuery({ keyword: '  abc  ' }).keyword, 'abc');
  assert.equal(buildInventoryQuery({ stockStatus: 'out' }).stockStatus, 'out');
});

test('stock dialog keeps the raw draft and rejects non-integer values like 1.5', () => {
  assert.equal(getStockDraftError('1.5'), 'Số lượng phải là số nguyên không âm.');
  assert.equal(canSaveStockDraft('1.5'), false);
  // parseInt từng chấp nhận "12abc" và "1.5"; bản nháp thô thì không.
  assert.equal(canSaveStockDraft('12abc'), false);
  assert.equal(canSaveStockDraft(''), false);
  assert.equal(canSaveStockDraft('-1'), false);
  assert.equal(canSaveStockDraft('0'), true);
  assert.equal(canSaveStockDraft(0), true);
  assert.equal(canSaveStockDraft('15'), true);
  assert.equal(getStockDraftError('15'), null);
});

test('inventory pagination uses the backend total for the active filter', () => {
  // Tổng số bản ghi theo bộ lọc đến từ backend, không đếm lại trên trang hiện tại.
  assert.deepEqual(resolveInventoryPagination({ page: 2, totalPages: 3, total: 40 }, 12), {
    page: 2,
    totalPages: 3,
    total: 40
  });

  assert.deepEqual(resolveInventoryPagination(undefined, 7), {
    page: 1,
    totalPages: 1,
    total: 7
  });

  assert.deepEqual(resolveInventoryPagination({ page: 0, totalPages: 0, total: null }, 5), {
    page: 1,
    totalPages: 1,
    total: 5
  });
});
