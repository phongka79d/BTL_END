import assert from 'node:assert/strict';
import test from 'node:test';

import { ORDER_SEARCH_FIELDS } from './orderSearchFields.js';

test('ORDER_SEARCH_FIELDS matches the backend allowlist used by GET /admin/orders', () => {
  assert.deepEqual(ORDER_SEARCH_FIELDS, {
    ALL: 'all',
    ORDER_ID: 'orderId',
    CUSTOMER: 'customer',
    SHIPPING_ADDRESS: 'shippingAddress',
  });
});
