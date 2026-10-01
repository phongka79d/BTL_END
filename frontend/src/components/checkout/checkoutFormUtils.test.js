import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCheckoutPayload,
  createCheckoutRequest,
  createSubmissionGuard,
  validateCheckoutValues
} from './checkoutFormUtils.js';

const validValues = {
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  shippingAddress: '123 Đường ABC',
  note: 'Giao giờ hành chính'
};

const selectedItems = [{ id: 'cart-item-1' }];

test('checkout accepts digit-only phone strings and preserves leading zeroes in payloads', () => {
  assert.deepEqual(validateCheckoutValues(validValues), {});
  assert.deepEqual(buildCheckoutPayload(validValues, selectedItems), {
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    shippingAddress: '123 Đường ABC',
    note: 'Giao giờ hành chính',
    cartItemIds: ['cart-item-1']
  });
});

test('checkout blocks the order request for alphabetic, spaced, and symbolic phones', () => {
  for (const phone of ['0987abc', '0987 654321', '+84987654321']) {
    let requestCount = 0;
    const request = createCheckoutRequest({
      values: { ...validValues, phone },
      selectedItems,
      createOrder: () => {
        requestCount += 1;
      }
    });

    assert.ok(request.errors.phone, phone);
    assert.equal(request.run, null, phone);
    assert.equal(requestCount, 0, phone);
  }
});

test('submission guard admits one order at a time and unlocks for retries', () => {
  const guard = createSubmissionGuard();

  assert.equal(guard.begin(), true);
  assert.equal(guard.begin(), false, 'rapid repeated submit is ignored while in flight');
  guard.end();
  assert.equal(guard.begin(), true, 'checkout is retryable once the order settles');
});
