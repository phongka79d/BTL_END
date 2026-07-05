import React from 'react';
import { Badge } from '@astryxdesign/core';
import { PAYMENT_STATUS_LABELS } from '../../constants/orderConstants';

/**
 * Maps payment status values to Astryx Badge variants.
 *
 * Variant map (per (04A) established mappings):
 *   unpaid → neutral   (awaiting payment)
 *   paid   → success   (payment received)
 *   failed → danger    (payment problem)
 *
 * Labels are sourced from the shared PAYMENT_STATUS_LABELS constant
 * (frontend/src/constants/orderConstants.js), keeping the UI
 * consistent with the admin views and batch handoff.
 *
 * ponytail: If backend enums grow new payment status values, update
 *           the variant map here and add the label to orderConstants.js.
 */
const PAYMENT_STATUS_VARIANT_MAP = {
  unpaid: 'neutral',
  paid: 'success',
  failed: 'danger',
};

export const PaymentStatusBadge = ({ status }) => {
  const label = PAYMENT_STATUS_LABELS[status] || status;
  const variant = PAYMENT_STATUS_VARIANT_MAP[status] || 'neutral';

  return <Badge variant={variant} label={label} />;
};

export default PaymentStatusBadge;
