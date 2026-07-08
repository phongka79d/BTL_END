import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  Badge,
  Button,
  Heading,
  HStack,
  Text,
  Toolbar,
  VStack,
  proportional,
  pixel
} from '@astryxdesign/core';
import { reviewApi } from '../../api/reviewApi';
import AdminTable from '../../components/admin/AdminTable';
import ProductPicker from '../../components/admin/ProductPicker';
import Alert from '../../components/common/Alert';
import { formatDate } from '../../components/common/formatDate';

const getCustomerName = (review) => (
  review?.user?.username ||
  review?.user?.fullName ||
  review?.user?.email ||
  'Customer'
);

const getProductName = (review) => (
  review?.product?.name ||
  review?.product?.title ||
  'Product'
);

export const AdminReviewView = () => {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hideTarget, setHideTarget] = useState(null);
  const [isHiding, setIsHiding] = useState(false);

  const loadReviews = useCallback(async (productId = '') => {
    setIsReviewsLoading(true);
    setLoadError('');

    try {
      const response = await reviewApi.getAdminReviews(productId ? { productId } : {});
      setReviews(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setReviews([]);
      setLoadError(error?.message || 'Unable to load reviews.');
    } finally {
      setIsReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleProductChange = (productId) => {
    setSelectedProductId(productId);
    setFeedback(null);
    loadReviews(productId);
  };

  const handleHideReview = () => {
    if (!hideTarget) {
      return;
    }

    const target = hideTarget;

    setIsHiding(true);
    setFeedback(null);
    setHideTarget(null);
    setReviews((currentReviews) => currentReviews.filter((review) => review.id !== target.id));
    setFeedback({
      title: 'Review hidden',
      description: 'The review was removed from public product detail.'
    });

    reviewApi.hideReview(target.id)
      .catch((error) => {
        setFeedback({
          title: 'Unable to hide review',
          description: error?.message || 'The review could not be hidden.'
        });
        loadReviews(selectedProductId);
      })
      .finally(() => {
        setIsHiding(false);
      });
  };

  const columns = useMemo(
    () => [
      {
        key: 'customer',
        header: 'Customer',
        width: proportional(1.4),
        renderCell: (review) => (
          <VStack gap={0}>
            <Text weight="semibold">{getCustomerName(review)}</Text>
            <Text size="supporting" color="secondary">
              {review.user?.email || 'No email'}
            </Text>
          </VStack>
        )
      },
      {
        key: 'rating',
        header: 'Rating',
        width: pixel(120),
        renderCell: (review) => (
          <Badge variant="yellow" label={`${Number(review.rating) || 0}/5`} />
        )
      },
      {
        key: 'product',
        header: 'Product',
        width: proportional(1.2),
        renderCell: (review) => (
          <VStack gap={0}>
            <Text weight="semibold">{getProductName(review)}</Text>
            <Text size="supporting" color="secondary">
              {review.product?.brand || 'No brand'}
            </Text>
          </VStack>
        )
      },
      {
        key: 'comment',
        header: 'Comment',
        width: proportional(2),
        renderCell: (review) => (
          <Text color={review.comment ? undefined : 'secondary'}>
            {review.comment || 'No comment provided.'}
          </Text>
        )
      },
      {
        key: 'createdAt',
        header: 'Date',
        width: proportional(1),
        renderCell: (review) => (
          <Text size="supporting" color="secondary">
            {formatDate(review.createdAt)}
          </Text>
        )
      },
      {
        key: 'actions',
        header: 'Actions',
        width: pixel(260),
        align: 'end',
        renderCell: (review) => {
          const productId = review.productId || review.product?.id || selectedProductId;

          return (
            <HStack gap={2} style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                label="View product"
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/products/${productId}`)}
                isDisabled={!productId}
              />
              <Button
                label="Hide review"
                variant="secondary"
                size="sm"
                onClick={() => setHideTarget(review)}
              />
            </HStack>
          );
        }
      }
    ],
    [navigate, selectedProductId]
  );

  const isLoading = isReviewsLoading;

  return (
    <VStack gap={6} width="100%">
      <VStack gap={1}>
        <Heading level={1}>Manage Reviews</Heading>
        <Text color="secondary">
          Hide visible product reviews from the public product detail page.
        </Text>
      </VStack>

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
        />
      )}

      <Toolbar
        label="Product reviews"
        startContent={(
          <ProductPicker
            value={selectedProductId || undefined}
            onChange={handleProductChange}
          />
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Refresh reviews"
              variant="secondary"
              onClick={() => loadReviews(selectedProductId)}
              isDisabled={isLoading}
            />
          </HStack>
        )}
      />

      <Text size="supporting" color="secondary">
        {selectedProductId
          ? 'Showing visible reviews for the selected product.'
          : 'Showing all visible reviews. Search and select a product to filter.'}
      </Text>

      <AdminTable
        key={reviews.map((review) => review.id).join(':')}
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        error={loadError}
        errorTitle="Unable to load reviews"
        emptyTitle="No visible reviews"
        emptyDescription={
          selectedProductId
            ? 'Visible reviews for the selected product will appear here.'
            : 'Visible product reviews will appear here.'
        }
        onRetry={() => loadReviews(selectedProductId)}
      />

      <AlertDialog
        isOpen={Boolean(hideTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isHiding) {
            setHideTarget(null);
          }
        }}
        title="Hide review?"
        description={
          hideTarget
            ? `This will remove ${getCustomerName(hideTarget)}'s review from public product detail.`
            : 'This review will be removed from public product detail.'
        }
        actionLabel="Hide review"
        isActionLoading={isHiding}
        onAction={handleHideReview}
      />
    </VStack>
  );
};

export default AdminReviewView;
