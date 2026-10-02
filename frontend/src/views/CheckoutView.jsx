import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useNotification } from '../contexts/NotificationContext';
import { orderApi } from '../api/orderApi';
import { userApi } from '../api/userApi';
import Alert from '../components/common/Alert';
import { CartIcon } from '../components/common/LayoutIcons';
import CheckoutForm from '../components/checkout/CheckoutForm';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary';
import {
  createCheckoutRequest,
  createSubmissionGuard,
  validateCheckoutValues
} from '../components/checkout/checkoutFormUtils.js';
import {
  addressFromUser,
  EMPTY_ADDRESS,
  hasLegacyAddress as hasLegacyStructuredAddress
} from '../components/address/addressFormUtils.js';

const INITIAL_VALUES = {
  fullName: '',
  phone: '',
  address: EMPTY_ADDRESS,
  note: ''
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
        <Skeleton width="100%" height="64px" radius="rounded" />
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
  const location = useLocation();
  const { items, subtotal, loading, error, refreshCart } = useCart();
  const { notifySuccess } = useNotification();

  const selectedCartItemIds = useMemo(() => {
    return Array.isArray(location.state?.cartItemIds)
      ? location.state.cartItemIds
      : null;
  }, [location.state]);

  const selectedItems = useMemo(() => {
    if (!selectedCartItemIds) {
      return items;
    }

    const selectedItemIdSet = new Set(selectedCartItemIds);
    return items.filter((item) => selectedItemIdSet.has(item.id));
  }, [items, selectedCartItemIds]);

  const selectedSubtotal = useMemo(() => {
    if (!selectedCartItemIds) {
      return subtotal;
    }

    return selectedItems.reduce(
      (total, item) => total + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
      0
    );
  }, [selectedCartItemIds, selectedItems, subtotal]);

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [hasInitializedValues, setHasInitializedValues] = useState(false);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const [legacyAddress, setLegacyAddress] = useState('');
  const initializedRef = useRef(false);
  const submissionGuardRef = useRef(null);

  if (!submissionGuardRef.current) {
    submissionGuardRef.current = createSubmissionGuard();
  }

  useEffect(() => {
    if (initializedRef.current) {
      return undefined;
    }

    let isCurrent = true;

    const initializeCheckout = async () => {
      const profileRequest = Promise.resolve().then(() => userApi.getProfile());
      const cartRequest = Promise.resolve().then(() => refreshCart());
      const [profileResult] = await Promise.allSettled([profileRequest, cartRequest]);

      if (!isCurrent || initializedRef.current) {
        return;
      }

      initializedRef.current = true;
      const profile = profileResult.status === 'fulfilled'
        ? profileResult.value?.data?.user
        : null;
      const profileAvailable = profile !== null
        && typeof profile === 'object'
        && !Array.isArray(profile);

      setValues({
        fullName: typeof profile?.fullName === 'string' ? profile.fullName : '',
        phone: typeof profile?.phone === 'string' ? profile.phone : '',
        address: addressFromUser(profile),
        note: ''
      });
      setProfileLoadFailed(!profileAvailable);
      setLegacyAddress(
        profileAvailable && hasLegacyStructuredAddress(profile)
          ? profile.address
          : ''
      );
      setHasInitializedValues(true);
    };

    initializeCheckout();
    return () => {
      isCurrent = false;
    };
  }, [refreshCart]);

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
      const errorField = ['provinceCode', 'wardCode', 'streetRef', 'detail'].includes(field)
        ? 'address'
        : field;
      setTouched((prev) => ({ ...prev, [errorField]: true }));

      const fieldErrors = validateCheckoutValues(values);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldErrors[errorField]) {
          next[errorField] = fieldErrors[errorField];
        } else {
          delete next[errorField];
        }
        return next;
      });
    },
    [values]
  );

  const handleSubmit = useCallback(async () => {
    const submissionGuard = submissionGuardRef.current;

    if (!submissionGuard.begin()) {
      return;
    }

    const checkoutRequest = createCheckoutRequest({
      values,
      selectedItems,
      createOrder: (payload) => orderApi.createOrder(payload)
    });
    const validationErrors = checkoutRequest.errors;
    const allTouched = {
      fullName: true,
      phone: true,
      address: true,
      note: true
    };

    setTouched(allTouched);
    setErrors(validationErrors);
    setApiError(null);

    if (Object.keys(validationErrors).length > 0) {
      submissionGuard.end();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await checkoutRequest.run();
      const order = response?.data || response;

      if (!order || !order.id) {
        setApiError(
          'Máy chủ không trả về thông tin đơn hàng. Vui lòng thử lại.'
        );
        return;
      }

      try {
        await refreshCart();
      } catch {
        // Đơn đã được tạo thành công; lỗi tải lại giỏ hàng hiển thị trên
        // trang giỏ hàng kèm nút thử lại nên không chặn điều hướng.
      }

      notifySuccess({
        message: 'Đặt hàng thành công',
        description: `Mã đơn hàng #${order.id}`
      });

      navigate('/cart', { replace: true });
    } catch (err) {
      const message =
        err?.message || 'Không thể đặt đơn hàng. Vui lòng thử lại.';
      setApiError(message);
    } finally {
      submissionGuard.end();
      setIsSubmitting(false);
    }
  }, [navigate, notifySuccess, refreshCart, selectedItems, values]);

  if (loading || !hasInitializedValues) {
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
          title="Không thể tải giỏ hàng"
          description={error}
          actionLabel="Thử lại"
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
          title="Giỏ hàng trống"
          description="Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán."
          icon={<CartIcon />}
          actions={
            <HStack gap={3} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                label="Xem sản phẩm"
                variant="primary"
                onClick={() => navigate('/products')}
              />
              <Button
                label="Về trang chủ"
                variant="secondary"
                onClick={() => navigate('/')}
              />
            </HStack>
          }
        />
      </VStack>
    );
  }

  if (!selectedItems.length) {
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
          title="Chưa chọn sản phẩm"
          description="Hãy quay lại giỏ hàng và chọn ít nhất một sản phẩm trước khi thanh toán."
          icon={<CartIcon />}
          actions={(
            <HStack gap={3} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button label="Quay lại giỏ hàng" variant="primary" onClick={() => navigate('/cart')} />
              <Button label="Xem sản phẩm" variant="secondary" onClick={() => navigate('/products')} />
            </HStack>
          )}
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
        <Heading level={1}>Thanh toán</Heading>
        <Text color="secondary">
          Kiểm tra đơn hàng, điền thông tin giao hàng và đặt hàng.
          Bạn sẽ thanh toán khi nhận hàng.
        </Text>
      </VStack>

      {profileLoadFailed && (
        <Text color="secondary" role="status">
          Không thể tải hồ sơ. Vui lòng nhập thông tin giao hàng để tiếp tục.
        </Text>
      )}

      {apiError && (
        <Alert
          title="Không thể đặt đơn hàng"
          description={apiError}
          actionLabel="Thử lại"
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
          legacyAddress={legacyAddress}
          disabled={isSubmitting}
        />

        <CheckoutOrderSummary
          items={selectedItems}
          subtotal={selectedSubtotal}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </Grid>
    </VStack>
  );
};

export default CheckoutView;
