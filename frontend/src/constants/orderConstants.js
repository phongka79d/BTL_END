/**
 * Shared order and payment status constants.
 *
 * These values must exactly match the backend Prisma schema enums
 * (backend/prisma/schema.prisma). They are the single source of truth for
 * status values consumed by admin status selectors, order status badges,
 * payment status badges, and any UI that needs status-aware rendering.
 *
 * ponytail: If backend enums grow new values, only this file needs updating.
 */

export const ORDER_STATUS_VALUES = [
  'pending',
  'confirmed',
  'shipping',
  'completed',
  'cancelled',
];

export const PAYMENT_STATUS_VALUES = [
  'unpaid',
  'paid',
  'failed',
];

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipping: 'Shipping',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  failed: 'Failed',
};
