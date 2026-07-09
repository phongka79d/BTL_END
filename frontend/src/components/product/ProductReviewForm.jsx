import React, { useState } from 'react';
import {
  Button,
  Card,
  FormLayout,
  HStack,
  NumberInput,
  Text,
  TextArea,
  VStack
} from '@astryxdesign/core';
import { useNotification } from '../../contexts/NotificationContext';

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

const validateRating = (rating) => {
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return 'Choose a whole-number rating from 1 to 5.';
  }

  return '';
};

export const ProductReviewForm = ({
  onSubmit,
  isSubmitting: isSubmitPending = false,
  isDisabled = false,
  title = 'Write a review'
}) => {
  const notification = useNotification();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (value) => {
    setRating(value);
    setRatingError('');
  };

  const handleCommentChange = (value) => {
    setComment(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextRatingError = validateRating(rating);
    setRatingError(nextRatingError);

    if (nextRatingError) {
      return;
    }

    if (!onSubmit) {
      notification.error({
        title: 'Unable to submit review',
        description: 'Review submission is not available yet.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating: Number(rating),
        comment: comment.trim()
      });
      setComment('');
      setRating(5);
      notification.success({
        title: 'Review submitted',
        description: 'Your review was submitted.',
      });
    } catch (error) {
      notification.error({
        title: 'Unable to submit review',
        description: error?.message || 'Unable to submit your review.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormBusy = isSubmitting || isSubmitPending;

  return (
    <Card padding={4}>
      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Text weight="semibold">{title}</Text>
            <Text size="supporting" color="secondary">
              Rating is required. Comment is optional.
            </Text>
          </VStack>

          <FormLayout>
            <NumberInput
              label="Rating"
              value={rating}
              onChange={handleRatingChange}
              min={1}
              max={5}
              step={1}
              isIntegerOnly
              isRequired
              isDisabled={isDisabled || isFormBusy}
              status={fieldStatus(ratingError)}
              width="100%"
            />

            <TextArea
              label="Comment"
              value={comment}
              onChange={handleCommentChange}
              rows={3}
              maxLength={500}
              isOptional
              isDisabled={isDisabled || isFormBusy}
              placeholder="Share what stood out about this product."
              width="100%"
            />
          </FormLayout>

          <HStack gap={2} style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              label="Submit review"
              type="submit"
              variant="primary"
              isLoading={isSubmitting || isSubmitPending}
              isDisabled={isDisabled}
            />
          </HStack>
        </VStack>
      </form>
    </Card>
  );
};

export default ProductReviewForm;
