import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CUSTOMER_CANCELLABLE_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  ORDER_STATUS_VALUES,
  getAllowedNextStatuses,
  isCustomerCancellable,
} from './orderConstants.js';

test('order status transitions mirror the backend lifecycle', () => {
  assert.deepEqual(Object.keys(ORDER_STATUS_TRANSITIONS), ORDER_STATUS_VALUES);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.pending, ['confirmed', 'cancelled']);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.confirmed, ['shipping', 'cancelled']);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.shipping, ['completed', 'cancelled']);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.completed, []);
  assert.deepEqual(ORDER_STATUS_TRANSITIONS.cancelled, []);
});

test('only unfinished orders can advance and customers cancel before shipping', () => {
  assert.deepEqual(getAllowedNextStatuses('pending'), ['confirmed', 'cancelled']);
  assert.deepEqual(getAllowedNextStatuses('completed'), []);
  assert.deepEqual(getAllowedNextStatuses('unknown-status'), []);

  assert.deepEqual(CUSTOMER_CANCELLABLE_STATUSES, ['pending', 'confirmed']);
  assert.equal(isCustomerCancellable('pending'), true);
  assert.equal(isCustomerCancellable('confirmed'), true);
  assert.equal(isCustomerCancellable('shipping'), false);
  assert.equal(isCustomerCancellable('completed'), false);
  assert.equal(isCustomerCancellable(undefined), false);
});
