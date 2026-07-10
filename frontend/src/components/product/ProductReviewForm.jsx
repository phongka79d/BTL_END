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
    return 'Hãy chọn xếp hạng là số nguyên từ 1 đến 5.';
  }

  return '';
};

export const ProductReviewForm = ({
  onSubmit,
  isSubmitting: isSubmitPending = false,
  isDisabled = false,
  title = 'Viết đánh giá'
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
        title: 'Không thể gửi đánh giá',
        description: 'Chức năng gửi đánh giá hiện chưa khả dụng.',
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
        title: 'Đã gửi đánh giá',
        description: 'Đánh giá của bạn đã được gửi.',
      });
    } catch (error) {
      notification.error({
        title: 'Không thể gửi đánh giá',
        description: error?.message || 'Không thể gửi đánh giá của bạn.',
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
              label="Xếp hạng"
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
              label="Nhận xét"
              value={comment}
              onChange={handleCommentChange}
              rows={3}
              maxLength={500}
              isOptional
              isDisabled={isDisabled || isFormBusy}
              placeholder="Chia sẻ điều bạn ấn tượng về sản phẩm này."
              width="100%"
            />
          </FormLayout>

          <HStack gap={2} style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              label="Gửi đánh giá"
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
