import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Selector, Text, VStack } from '@astryxdesign/core';
import { orderApi } from '../../api/orderApi';
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_LABELS,
} from '../../constants/orderConstants';

const FEEDBACK_CLEAR_MS = 4000;

/**
 * Maps order status values to Selector option objects consumed by the
 * Astryx Selector component.
 */
const STATUS_OPTIONS = ORDER_STATUS_VALUES.map((value) => ({
  label: ORDER_STATUS_LABELS[value] || value,
  value,
}));

/**
 * OrderStatusSelect
 *
 * Inline admin status selector that calls PUT /api/admin/orders/:id/status
 * on change and shows transient success/error feedback.
 *
 * Design doc: §17.2 OrderStatusSelector
 * Options: pending, confirmed, shipping, completed, cancelled
 * Astryx: Selector
 *
 * Props:
 *   order         – the order object (must have id and status)
 *   onStatusUpdated – callback invoked after a successful status update
 *                     so the parent can refresh the row or list state
 *
 * States:
 *   idle          – Selector shows current status, enabled
 *   pending       – Selector disabled, API call in-flight
 *   success       – brief green "Saved" text, auto-clears
 *   error         – brief red error text, auto-clears
 *
 * ponytail: If the backend ever requires a confirmation step before
 *           certain transitions (e.g., completed → cancelled), add an
 *           AlertDialog gate here before calling the API.
 */
export const OrderStatusSelect = ({ order, onStatusUpdated }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const scheduleFeedbackClear = useCallback(() => {
    clearFeedbackTimer();
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
    }, FEEDBACK_CLEAR_MS);
  }, [clearFeedbackTimer]);

  useEffect(() => {
    return () => clearFeedbackTimer();
  }, [clearFeedbackTimer]);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!newStatus || newStatus === order.status) return;

      setIsUpdating(true);
      setFeedback(null);

      try {
        const response = await orderApi.updateOrderStatus(
          order.id,
          newStatus
        );
        const updatedOrder = response?.data || response;

        setFeedback({
          type: 'success',
          message:
            updatedOrder?.payment?.paymentStatus === 'paid'
              ? 'Status updated. Payment marked as paid.'
              : `Status updated to ${ORDER_STATUS_LABELS[newStatus] || newStatus}.`,
        });
        scheduleFeedbackClear();
        onStatusUpdated?.(updatedOrder || order);
      } catch (err) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Unable to update status. Please try again.',
        });
        scheduleFeedbackClear();
      } finally {
        setIsUpdating(false);
      }
    },
    [order, onStatusUpdated, scheduleFeedbackClear]
  );

  return (
    <VStack gap={1} align="start" style={{ minWidth: 140 }}>
      <Selector
        label={`Status for order ${order.id?.slice(0, 8) || ''}\u2026`}
        isLabelHidden
        value={order.status}
        onChange={handleStatusChange}
        options={STATUS_OPTIONS}
        isDisabled={isUpdating}
        width="148px"
      />

      {feedback && (
        <Text
          size="supporting"
          color={feedback.type === 'success' ? 'success' : 'danger'}
        >
          {feedback.message}
        </Text>
      )}
    </VStack>
  );
};

export default OrderStatusSelect;
