import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  Grid,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack
} from '@astryxdesign/core';
import { useCart } from '../contexts/CartContext';
import { orderApi } from '../api/orderApi';
import Alert from '../components/common/Alert';
import { CartIcon } from '../components/common/LayoutIcons';
import CheckoutForm from '../components/checkout/CheckoutForm';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary';
import CheckoutSuccessDialog from '../components/checkout/CheckoutSuccessDialog';

const INITIAL_VALUES = {
  fullName: '',
  phone: '',
  shippingAddress: '',
  note: ''
};

const validate = (values) => {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  }

  if (!values.shippingAddress.trim()) {
    errors.shippingAddress = 'Shipping address is required.';
  }

  return errors;
};

const CheckoutSkeleton = () => (
  <VStack gap={4} style={{ width: '100%' }}>
    <VStack gap={1}>
      <Skeleton width="180px" height="var(--spacing-8)" radius="rounded" />
      <Skeleton width="100%" height="var(--spacing-5)" radius="rounded" />
    </VStack>

    <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
      <VStack gap={3} style={{ padding: 'var(--spacing-4)' }}>
        <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
        <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
        <Skeleton width="100%" height="var(--spacing-16)" radius="rounded" />
        <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
      </VStack>

      <VStack gap={3} style={{ padding: 'var(--spacing-4)' }}>
        <Skeleton width="100%" height="var(--spacing-6)" radius="rounded" />
        <Skeleton width="100%" height="var(--spacing-6)" radius="rounded" />
        <Skeleton width="100%" height="var(--spacing-6)" radius="rounded" />
        <Skeleton width="100%" height="var(--spacing-10)" radius="rounded" />
      </VStack>
    </Grid>
  </VStack>
);

export const CheckoutView = () => {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, loading, error, refreshCart } =
    useCart();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  const resetCheckoutState = useCallback(() => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setApiError(null);
    setPlacedOrderId(null);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setApiError(null);

    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFieldBlur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      const fieldErrors = validate(values);
      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    },
    [values]
  );

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate(values);
    const allTouched = {
      fullName: true,
      phone: true,
      shippingAddress: true,
      note: true
    };

    setTouched(allTouched);
    setErrors(validationErrors);
    setApiError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        shippingAddress: values.shippingAddress.trim(),
        note: values.note.trim() || undefined
      };

      const response = await orderApi.createOrder(payload);
      const order = response?.data || response;

      if (!order || !order.id) {
        setApiError(
          'The server did not return order details. Please try again.'
        );
        setIsSubmitting(false);
        return;
      }

      setPlacedOrderId(order.id);

      await refreshCart();
    } catch (err) {
      const message =
        err?.message || 'Unable to place your order. Please try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshCart, values]);

  const handleViewOrder = useCallback(() => {
    if (placedOrderId) {
      navigate(`/orders/${placedOrderId}`);
    }
  }, [navigate, placedOrderId]);

  const handleContinueShopping = useCallback(() => {
    resetCheckoutState();
    navigate('/products');
  }, [navigate, resetCheckoutState]);

  if (loading) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '1100px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)'
        }}
      >
        <CheckoutSkeleton />
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '1100px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-6)'
        }}
      >
        <Alert
          title="Unable to load cart"
          description={error}
          actionLabel="Retry"
          onAction={refreshCart}
        />
      </VStack>
    );
  }

  if (!items.length) {
    return (
      <VStack
        style={{
          width: '100%',
          maxWidth: '800px',
          marginInline: 'auto',
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-4)'
        }}
      >
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart before checking out."
          icon={<CartIcon />}
          actions={
            <HStack gap={3} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                label="Browse products"
                variant="primary"
                onClick={() => navigate('/products')}
              />
              <Button
                label="Return home"
                variant="secondary"
                onClick={() => navigate('/')}
              />
            </HStack>
          }
        />
      </VStack>
    );
  }

  return (
    <VStack
      style={{
        width: '100%',
        maxWidth: '1100px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)'
      }}
    >
      <VStack gap={1}>
        <Heading level={1}>Checkout</Heading>
        <Text color="secondary">
          Review your order, fill in shipping details, and place your order.
          You will pay via Cash on Delivery.
        </Text>
      </VStack>

      {apiError && (
        <Alert
          title="Order could not be placed"
          description={apiError}
          actionLabel="Try again"
          onAction={handleSubmit}
        />
      )}

      <Grid
        columns={{ minWidth: 280, max: 2 }}
        gap={4}
        style={{ alignItems: 'start' }}
      >
        <CheckoutForm
          values={values}
          errors={errors}
          touched={touched}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
        />

        <CheckoutOrderSummary
          items={items}
          subtotal={subtotal}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </Grid>

      <CheckoutSuccessDialog
        isOpen={!!placedOrderId}
        orderId={placedOrderId}
        onViewOrder={handleViewOrder}
        onContinueShopping={handleContinueShopping}
      />
    </VStack>
  );
};

export default CheckoutView;
