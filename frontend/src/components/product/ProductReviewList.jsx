import React from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  HStack,
  List,
  ListItem,
  Skeleton,
  Text,
  Timestamp,
  VStack
} from '@astryxdesign/core';
import Alert from '../common/Alert';

const getCustomerName = (review) => (
  review?.user?.username ||
  review?.user?.name ||
  review?.user?.email ||
  review?.customerName ||
  'Customer'
);

const formatRatingLabel = (rating) => `${Number(rating) || 0}/5`;

const ReviewLoadingItem = ({ width = '64%' }) => (
  <Card padding={3} variant="muted">
    <VStack gap={2}>
      <HStack gap={3} style={{ alignItems: 'center' }}>
        <Skeleton width="var(--spacing-8)" height="var(--spacing-8)" radius="rounded" />
        <VStack gap={1} style={{ flex: 1 }}>
          <Skeleton width={width} height="var(--spacing-4)" radius="rounded" />
          <Skeleton width="36%" height="var(--spacing-3)" radius="rounded" />
        </VStack>
      </HStack>
      <Skeleton width="100%" height="var(--spacing-4)" radius="rounded" />
    </VStack>
  </Card>
);

export const ProductReviewList = ({
  reviews = [],
  isLoading = false,
  error = null,
  onRetry,
  title = 'Customer reviews',
  emptyTitle = 'No reviews yet',
  emptyDescription = 'Be the first customer to share feedback on this product.'
}) => {
  if (isLoading) {
    return (
      <Card padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Text weight="semibold">{title}</Text>
            <Text size="supporting" color="secondary">
              Loading customer feedback.
            </Text>
          </VStack>
          <ReviewLoadingItem />
          <ReviewLoadingItem width="52%" />
        </VStack>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        title="Unable to load reviews"
        description={error}
        actionLabel={onRetry ? 'Try again' : undefined}
        onAction={onRetry}
      />
    );
  }

  if (!reviews.length) {
    return (
      <Card padding={4}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actions={onRetry ? (
            <Button label="Refresh reviews" variant="secondary" onClick={onRetry} />
          ) : undefined}
        />
      </Card>
    );
  }

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Text weight="semibold">{title}</Text>
          <Text size="supporting" color="secondary">
            Visible customer reviews are shown newest first.
          </Text>
        </VStack>

        <List density="spacious" hasDividers>
          {reviews.map((review) => {
            const customerName = getCustomerName(review);

            return (
              <ListItem
                key={review.id}
                startContent={<Avatar name={customerName} size="small" />}
                label={(
                  <HStack gap={2} style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <Text weight="semibold">{customerName}</Text>
                    <Badge variant="yellow" label={formatRatingLabel(review.rating)} />
                  </HStack>
                )}
                description={(
                  <VStack gap={1}>
                    <Text color={review.comment ? undefined : 'secondary'}>
                      {review.comment || 'No comment provided.'}
                    </Text>
                    {review.createdAt ? (
                      <Timestamp value={review.createdAt} format="date" />
                    ) : (
                      <Text size="supporting" color="secondary">
                        Review date unavailable
                      </Text>
                    )}
                  </VStack>
                )}
              />
            );
          })}
        </List>
      </VStack>
    </Card>
  );
};

export default ProductReviewList;
