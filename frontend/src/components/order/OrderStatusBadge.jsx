import React from 'react';
import { Badge } from '@astryxdesign/core';
import { ORDER_STATUS_LABELS } from '../../constants/orderConstants';

/**
 * Maps order status values to Astryx Badge variants.
 *
 * Variant map (per (04A) established mappings):
 *   pending   → neutral   (awaiting action)
 *   confirmed → info      (positive progression)
 *   shipping  → warning   (in transit)
 *   completed → success   (terminal success)
 *   cancelled → danger    (terminal failure)
 *
 * Labels are sourced from the shared ORDER_STATUS_LABELS constant
 * (frontend/src/constants/orderConstants.js), keeping the UI
 * consistent with the admin status selector and batch handoff.
 *
 * ponytail: If backend enums grow new values, update the variant map
 *           here and add the label to orderConstants.js.
 */
const ORDER_STATUS_VARIANT_MAP = {
  pending: 'neutral',
  confirmed: 'info',
  shipping: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export const OrderStatusBadge = ({ status }) => {
  const label = ORDER_STATUS_LABELS[status] || status;
  const variant = ORDER_STATUS_VARIANT_MAP[status] || 'neutral';

  return <Badge variant={variant} label={label} />;
};

export default OrderStatusBadge;
