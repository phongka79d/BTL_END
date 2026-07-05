import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  EmptyState,
  Grid,
  Heading,
  HStack,
  NumberInput,
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
import {
  formatPrice,
  getProductImageSrc,
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
    <VStack gap={4}>
      <Breadcrumbs variant="supporting" label="Product details">
        <BreadcrumbItem as={Link} href="/">Home</BreadcrumbItem>
        <BreadcrumbItem as={Link} href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Loading product</BreadcrumbItem>
      </Breadcrumbs>

      <Grid columns={{ minWidth: 360, max: 2 }} gap={5}>
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <VStack gap={3} style={{ width: '100%', padding: 'var(--spacing-4)' }}>
            <VStack
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                borderRadius: 'var(--radius-element)'
              }}
            >
              <Skeleton width="100%" height="100%" radius="rounded" />
            </VStack>
            <Skeleton width="58%" height="var(--spacing-5)" radius="rounded" />
            <Skeleton width="84%" height="var(--spacing-4)" radius="rounded" />
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={4}>
            <VStack gap={2}>
              <Skeleton width="42%" height="var(--spacing-4)" radius="rounded" />
              <Skeleton width="72%" height="var(--spacing-6)" radius="rounded" />
              <Skeleton width="34%" height="var(--spacing-5)" radius="rounded" />
            </VStack>
            <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
            <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
            <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
          </VStack>
        </Card>
      </Grid>
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
        type: 'success',
        title: 'Added to cart',
        description: `${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${product.name} was added to your cart.`,
        actionLabel: 'View cart',
        onAction: () => navigate('/cart')
      });
      return;
    }

    const signInRequired = !isAuthenticated;
    setFeedback({
      type: 'error',
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
          actionLabel={feedback.actionLabel}
          onAction={feedback.onAction}
        />
      )}

      <Grid columns={{ minWidth: 360, max: 2 }} gap={5}>
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <VStack gap={3} style={{ width: '100%' }}>
            <VStack
              style={{
                width: '100%',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                backgroundColor: 'var(--color-background-muted)'
              }}
            >
              <img
                src={getProductImageSrc(product.imageUrl)}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </VStack>

            <VStack gap={2} style={{ paddingInline: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)' }}>
              <Text size="supporting" color="secondary" weight="semibold">
                Image URL
              </Text>
              <Text size="supporting" color="secondary" style={{ overflowWrap: 'anywhere' }}>
                {product.imageUrl || 'No image URL is set, so the fallback illustration is shown.'}
              </Text>
            </VStack>
          </VStack>
        </Card>

        <Card padding={4}>
          <VStack gap={4}>
            <VStack gap={2}>
              <HStack gap={2} style={{ flexWrap: 'wrap' }}>
                <Badge variant="blue" label={product.category?.name || 'Uncategorized'} />
                <Badge variant={stockVariant} label={stockLabel} />
              </HStack>
              <Heading level={1}>{product.name}</Heading>
              <Text size="supporting" color="secondary">
                {product.brand}
              </Text>
              <Text weight="semibold" color="accent">
                {formatPrice(product.price)}
              </Text>
            </VStack>

            <Divider />

            <VStack gap={3}>
              <Text>{product.description || 'No description available for this product.'}</Text>

              <Grid columns={{ minWidth: 180, max: 2 }} gap={3}>
                <VStack gap={1}>
                  <Text size="supporting" color="secondary" weight="semibold">
                    Category
                  </Text>
                  <Text>{product.category?.name || 'Uncategorized'}</Text>
                </VStack>
                <VStack gap={1}>
                  <Text size="supporting" color="secondary" weight="semibold">
                    Quantity
                  </Text>
                  <Text>{availableQuantity}</Text>
                </VStack>
                <VStack gap={1}>
                  <Text size="supporting" color="secondary" weight="semibold">
                    Stock status
                  </Text>
                  <Text>{stockLabel}</Text>
                </VStack>
                <VStack gap={1}>
                  <Text size="supporting" color="secondary" weight="semibold">
                    Brand
                  </Text>
                  <Text>{product.brand}</Text>
                </VStack>
              </Grid>
            </VStack>

            <Divider />

            <VStack gap={3}>
              <NumberInput
                label="Quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={maxSelectableQuantity}
                step={1}
                isIntegerOnly
                isDisabled={availableQuantity < 1 || actionLoading}
                description={
                  availableQuantity > 0
                    ? `Choose a quantity from 1 to ${maxSelectableQuantity}. Final stock validation still happens on the backend.`
                    : 'This product is unavailable until stock is replenished.'
                }
                status={quantityStatus || undefined}
              />

              <HStack gap={3} style={{ flexWrap: 'wrap' }}>
                <Button
                  label="Add to cart"
                  variant="primary"
                  isLoading={actionLoading}
                  isDisabled={availableQuantity < 1}
                  onClick={handleAddToCart}
                />
                <Button
                  label="Back to products"
                  variant="secondary"
                  onClick={() => navigate('/products')}
                />
              </HStack>
            </VStack>
          </VStack>
        </Card>
      </Grid>

      {!isAuthenticated && (
        <Text size="supporting" color="secondary">
          Sign in to complete cart actions and keep your cart synchronized across sessions.
        </Text>
      )}

      <Grid columns={{ minWidth: 360, max: 2 }} gap={5}>
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

