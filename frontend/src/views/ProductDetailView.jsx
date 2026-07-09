import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  EmptyState,
  Grid,
  Heading,
  Skeleton,
  Text,
  VStack,
  Icon
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productApi } from '../api/productApi';
import { reviewApi } from '../api/reviewApi';
import Alert from '../components/common/Alert';
import ProductReviewForm from '../components/product/ProductReviewForm';
import ProductReviewList from '../components/product/ProductReviewList';
import ProductDetailMedia from '../components/product/ProductDetailMedia';
import ProductPurchasePanel from '../components/product/ProductPurchasePanel';
import {
  getStockLabel,
  getStockVariant
} from '../components/product/productUtils';

const clampQuantity = (value, maxQuantity) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  const upperBound = Math.max(1, Number(maxQuantity) || 1);
  return Math.min(Math.max(1, Math.floor(parsed)), upperBound);
};

const DetailSkeleton = () => {
  return (
    <VStack gap={5} style={{ width: '100%', maxWidth: '72rem', marginInline: 'auto' }}>
      <Breadcrumbs variant="supporting" label="Product details">
        <BreadcrumbItem as={Link} href="/">Home</BreadcrumbItem>
        <BreadcrumbItem as={Link} href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Loading product</BreadcrumbItem>
      </Breadcrumbs>

      <Grid columns={{ minWidth: 280, max: 2 }} gap={5} style={{ alignItems: 'start' }}>
        <VStack gap={3}>
          <Card
            padding={0}
            width="100%"
            style={{
              '--_card-radius': 'var(--radius-container)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-background-muted)'
            }}
          >
            <VStack
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                borderRadius: 'var(--radius-container)'
              }}
            >
              <Skeleton width="100%" height="100%" radius={3} />
            </VStack>
          </Card>

          <Card
            padding={0}
            width="calc(var(--spacing-8) * 3)"
            height="calc(var(--spacing-8) * 3)"
            style={{
              '--_card-radius': 'var(--radius-element)',
              overflow: 'hidden',
              backgroundColor: 'var(--color-background-muted)'
            }}
          >
            <Skeleton width="100%" height="100%" radius={2} />
          </Card>
        </VStack>

        <VStack
          style={{
            position: 'sticky',
            top: 'var(--spacing-8)',
            alignSelf: 'start'
          }}
        >
          <Card padding={5}>
            <VStack gap={5}>
              <VStack gap={3}>
                <VStack gap={2} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Skeleton width="calc(var(--spacing-8) * 3)" height="var(--spacing-5)" radius="rounded" />
                  <Skeleton width="calc(var(--spacing-8) * 2.5)" height="var(--spacing-5)" radius="rounded" />
                </VStack>
                <VStack gap={2}>
                  <Skeleton width="76%" height="var(--spacing-7)" radius="rounded" />
                  <Skeleton width="36%" height="var(--spacing-4)" radius="rounded" />
                </VStack>
                <Skeleton width="42%" height="var(--spacing-6)" radius="rounded" />
              </VStack>

              <Skeleton width="100%" height="var(--spacing-8)" radius="rounded" />

              <VStack gap={3}>
                <Skeleton width="24%" height="var(--spacing-4)" radius="rounded" />
                <Skeleton width="100%" height="var(--spacing-8)" radius={2} />
                <Skeleton width="100%" height="var(--spacing-10)" radius={2} />
              </VStack>

              <VStack gap={3}>
                <Skeleton width="100%" height="var(--spacing-10)" radius={2} />
                <Skeleton width="100%" height="var(--spacing-10)" radius={2} />
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </Grid>

      <VStack
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, calc(var(--spacing-8) * 9)), 1fr))',
          gap: 'var(--spacing-5)'
        }}
      >
        <Card padding={4}>
          <VStack gap={4} style={{ minHeight: 'calc(var(--spacing-8) * 4)' }}>
            <VStack gap={2}>
              <Skeleton width="44%" height="var(--spacing-5)" radius="rounded" />
              <Skeleton width="72%" height="var(--spacing-4)" radius="rounded" />
            </VStack>
            <Skeleton width="100%" height="var(--spacing-8)" radius={2} />
            <Skeleton width="86%" height="var(--spacing-4)" radius="rounded" />
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={4} style={{ minHeight: 'calc(var(--spacing-8) * 4)' }}>
            <VStack gap={2}>
              <Skeleton width="48%" height="var(--spacing-5)" radius="rounded" />
              <Skeleton width="90%" height="var(--spacing-4)" radius="rounded" />
            </VStack>
            <Skeleton width="100%" height="var(--spacing-8)" radius={2} />
            <Skeleton width="100%" height="var(--spacing-8)" radius={2} />
          </VStack>
        </Card>
      </VStack>
    </VStack>
  );
};

export const ProductDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addItem, actionLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const requestIdRef = useRef(0);
  const reviewRequestIdRef = useRef(0);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setProduct(null);
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);
    setFeedback(null);

    try {
      const response = await productApi.getProductById(id);
      const nextProduct = response?.data?.product || null;

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!nextProduct) {
        setProduct(null);
        setIsNotFound(true);
        return;
      }

      setProduct(nextProduct);
      setQuantity(1);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (err?.status === 404) {
        setProduct(null);
        setIsNotFound(true);
      } else {
        setProduct(null);
        setError(err?.message || 'Unable to load product details.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadProduct().catch(() => {});

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadProduct]);

  const loadReviews = useCallback(async () => {
    if (!id) {
      setReviews([]);
      setReviewsError(null);
      setIsReviewsLoading(false);
      return;
    }

    const requestId = reviewRequestIdRef.current + 1;
    reviewRequestIdRef.current = requestId;

    setIsReviewsLoading(true);
    setReviewsError(null);

    try {
      const response = await reviewApi.getProductReviews(id);

      if (requestId !== reviewRequestIdRef.current) {
        return;
      }

      setReviews(response?.data || []);
    } catch (err) {
      if (requestId !== reviewRequestIdRef.current) {
        return;
      }

      setReviews([]);
      setReviewsError(err?.message || 'Unable to load customer reviews.');
    } finally {
      if (requestId === reviewRequestIdRef.current) {
        setIsReviewsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadReviews().catch(() => {});

    return () => {
      reviewRequestIdRef.current += 1;
    };
  }, [loadReviews]);

  const availableQuantity = Number(product?.quantity ?? 0);
  const stockLabel = getStockLabel(availableQuantity);
  const stockVariant = getStockVariant(availableQuantity);
  const maxSelectableQuantity = availableQuantity > 0 ? availableQuantity : 1;
  const currentTitle = product?.name || (isLoading ? 'Loading product' : `Product ${id}`);

  useEffect(() => {
    setQuantity((currentValue) => clampQuantity(currentValue, maxSelectableQuantity));
  }, [maxSelectableQuantity, product?.id]);

  const quantityStatus = useMemo(() => {
    if (availableQuantity > 0) {
      return null;
    }

    return {
      type: 'warning',
      message: 'This product is currently out of stock.'
    };
  }, [availableQuantity]);

  const handleQuantityChange = (value) => {
    setFeedback(null);
    setQuantity(clampQuantity(value, maxSelectableQuantity));
  };

  const handleAddToCart = async () => {
    if (!product || availableQuantity < 1) {
      return;
    }

    setFeedback(null);

    const result = await addItem(product.id, quantity);

    if (result.success) {
      setFeedback({
        status: 'success',
        title: 'Added to cart',
        description: `${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${product.name} was added to your cart.`,
        actionLabel: 'View cart',
        onAction: () => navigate('/cart')
      });
      return;
    }

    const signInRequired = !isAuthenticated;
    setFeedback({
      status: 'error',
      title: signInRequired ? 'Sign in required' : 'Unable to add to cart',
      description: result.error || 'The item could not be added to the cart.',
      actionLabel: signInRequired ? 'Sign in' : undefined,
      onAction: signInRequired ? () => navigate('/login') : undefined
    });
  };

  const canWriteReview = isAuthenticated && user?.role !== 'admin';

  const handleReviewSubmit = async (payload) => {
    if (!product) {
      throw new Error('Product details are not available yet.');
    }

    setIsReviewSubmitting(true);
    try {
      await reviewApi.createProductReview(product.id, payload);
      await loadReviews();
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <VStack gap={4} style={{ width: '100%', maxWidth: '72rem', marginInline: 'auto' }}>
        <Breadcrumbs variant="supporting" label="Product details">
          <BreadcrumbItem as={Link} href="/">Home</BreadcrumbItem>
          <BreadcrumbItem as={Link} href="/products">Products</BreadcrumbItem>
          <BreadcrumbItem isCurrent>{currentTitle}</BreadcrumbItem>
        </Breadcrumbs>

        <Alert
          title="Unable to load product"
          description={error}
          actionLabel="Retry"
          onAction={loadProduct}
        />

        <Button
          label="Back to products"
          variant="secondary"
          onClick={() => navigate('/products')}
        />
      </VStack>
    );
  }

  if (isNotFound || !product) {
    return (
      <VStack gap={4} style={{ width: '100%', maxWidth: '72rem', marginInline: 'auto' }}>
        <Breadcrumbs variant="supporting" label="Product details">
          <BreadcrumbItem as={Link} href="/">Home</BreadcrumbItem>
          <BreadcrumbItem as={Link} href="/products">Products</BreadcrumbItem>
          <BreadcrumbItem isCurrent>{currentTitle}</BreadcrumbItem>
        </Breadcrumbs>

        <EmptyState
          title="Product not found"
          description="The item you were looking for is no longer available in the catalog."
          icon={<Icon icon="search" />}
          actions={(
            <Button
              label="Back to products"
              variant="secondary"
              onClick={() => navigate('/products')}
            />
          )}
        />
      </VStack>
    );
  }

  return (
    <VStack gap={5} style={{ width: '100%', maxWidth: '72rem', marginInline: 'auto' }}>
      <Breadcrumbs variant="supporting" label="Product details">
        <BreadcrumbItem as={Link} href="/">Home</BreadcrumbItem>
        <BreadcrumbItem as={Link} href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem isCurrent>{currentTitle}</BreadcrumbItem>
      </Breadcrumbs>

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
          status={feedback.status}
          actionLabel={feedback.actionLabel}
          onAction={feedback.onAction}
        />
      )}

      <Grid columns={{ minWidth: 280, max: 2 }} gap={5} style={{ alignItems: 'start' }}>
        <ProductDetailMedia product={product} />

        <VStack
          style={{
            position: 'sticky',
            top: 'var(--spacing-8)',
            alignSelf: 'start'
          }}
        >
          <ProductPurchasePanel
            actionLoading={actionLoading}
            availableQuantity={availableQuantity}
            isAuthenticated={isAuthenticated}
            isReviewsLoading={isReviewsLoading}
            maxSelectableQuantity={maxSelectableQuantity}
            onAddToCart={handleAddToCart}
            onBackToProducts={() => navigate('/products')}
            onQuantityChange={handleQuantityChange}
            product={product}
            quantity={quantity}
            quantityStatus={quantityStatus}
            reviews={reviews}
            stockLabel={stockLabel}
            stockVariant={stockVariant}
          />
        </VStack>
      </Grid>

      <Grid columns={{ minWidth: 280, max: 2 }} gap={5}>
        <ProductReviewList
          reviews={reviews}
          isLoading={isReviewsLoading}
          error={reviewsError}
          onRetry={loadReviews}
        />

        {canWriteReview ? (
          <ProductReviewForm
            onSubmit={handleReviewSubmit}
            isSubmitting={isReviewSubmitting}
          />
        ) : (
          <Card padding={4}>
            <VStack gap={3}>
              <VStack gap={1}>
                <Text weight="semibold">Sign in to write a review</Text>
                <Text size="supporting" color="secondary">
                  Customer accounts can submit ratings and optional comments for this product.
                </Text>
              </VStack>
              <Button
                label={isAuthenticated ? 'Use a customer account' : 'Sign in'}
                variant="secondary"
                onClick={() => navigate('/login')}
              />
            </VStack>
          </Card>
        )}
      </Grid>
    </VStack>
  );
};

export default ProductDetailView;

