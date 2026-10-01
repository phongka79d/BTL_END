import assert from 'node:assert/strict';
import test from 'node:test';
import { getOrderRecipient } from './orderRecipientUtils.js';

test('order recipient prefers the immutable snapshot over current user details', () => {
  assert.deepEqual(
    getOrderRecipient({
      recipientName: 'Snapshot Name',
      recipientPhone: '0900123456',
      note: 'Leave at reception',
      user: {
        fullName: 'Current User Name',
        phone: '0999999999',
        username: 'current-user'
      }
    }),
    {
      name: 'Snapshot Name',
      phone: '0900123456',
      note: 'Leave at reception'
    }
  );
});

test('order recipient falls back to legacy user contact fields', () => {
  assert.deepEqual(
    getOrderRecipient({
      user: {
        fullName: 'Legacy User',
        phone: '0911222333'
      }
    }),
    {
      name: 'Legacy User',
      phone: '0911222333',
      note: ''
    }
  );
});
