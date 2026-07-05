import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  Badge,
  Button,
  Heading,
  HStack,
  Selector,
  Text,
  Toolbar,
  VStack,
  proportional,
  pixel
} from '@astryxdesign/core';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import AdminTable from '../../components/admin/AdminTable';
import Alert from '../../components/common/Alert';
import { formatDate } from '../../components/common/formatDate';

const getProductsFromResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.products)) return data.products;

  return [];
};

const getCustomerName = (review) => (
  review?.user?.username ||
  review?.user?.fullName ||
  review?.user?.email ||
  'Customer'
);

export const AdminReviewView = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [hideTarget, setHideTarget] = useState(null);
  const [isHiding, setIsHiding] = useState(false);

  const productOptions = useMemo(
    () => products.map((product) => ({
      label: product.name || product.title || product.id,
      value: product.id
    })),
    [products]
  );

  const loadReviews = useCallback(async (productId) => {
    if (!productId) {
      setReviews([]);
      return;
    }

    setIsReviewsLoading(true);
    setLoadError('');

    try {
      const response = await reviewApi.getProductReviews(productId);
      setReviews(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setReviews([]);
      setLoadError(error?.message || 'Unable to load reviews.');
    } finally {
      setIsReviewsLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setIsProductsLoading(true);
    setLoadError('');

    try {
      const response = await productApi.getProducts();
      const nextProducts = getProductsFromResponse(response);
      setProducts(nextProducts);
      const firstProductId = nextProducts[0]?.id || '';
      setSelectedProductId(firstProductId);

      if (firstProductId) {
        await loadReviews(firstProductId);
      } else {
        setReviews([]);
      }
    } catch (error) {
      setProducts([]);
      setReviews([]);
      setLoadError(error?.message || 'Unable to load products.');
    } finally {
      setIsProductsLoading(false);
    }
  }, [loadReviews]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
        width: pixel(150),
        align: 'end',
        renderCell: (review) => (
          <Button
            label="Hide review"
            variant="secondary"
            size="sm"
            onClick={() => setHideTarget(review)}
          />
        )
      }
    ],
    []
  );

  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const isLoading = isProductsLoading || isReviewsLoading;

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
          <Selector
            label="Product"
            value={selectedProductId}
            onChange={handleProductChange}
            options={productOptions}
            placeholder="Select product"
            width="100%"
          />
        )}
        endContent={(
          <HStack gap={2}>
            <Button
              label="Refresh reviews"
              variant="secondary"
              onClick={() => loadReviews(selectedProductId)}
              isDisabled={!selectedProductId || isLoading}
            />
          </HStack>
        )}
      />

      {selectedProduct && (
        <Text size="supporting" color="secondary">
          Showing visible reviews for {selectedProduct.name || selectedProduct.title}.
        </Text>
      )}

      <AdminTable
        key={reviews.map((review) => review.id).join(':')}
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        error={loadError}
        errorTitle="Unable to load reviews"
        emptyTitle={selectedProductId ? 'No visible reviews' : 'No products available'}
        emptyDescription={
          selectedProductId
            ? 'Visible reviews for the selected product will appear here.'
            : 'Add products before moderating reviews.'
        }
        onRetry={loadProducts}
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
