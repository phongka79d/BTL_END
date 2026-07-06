import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Heading, Text, VStack } from '@astryxdesign/core';
import { useCart } from '../contexts/CartContext';
import Alert from '../components/common/Alert';
import CartItemList from '../components/cart/CartItemList';
import CartSummary from '../components/cart/CartSummary';

export const CartView = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    itemCount,
    loading,
    actionLoading,
    error,
    refreshCart,
    updateItem,
    removeItem
  } = useCart();
  const [feedback, setFeedback] = useState(null);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const clearOperationState = useCallback(() => {
    setPendingItemId(null);
    setPendingAction(null);
  }, []);

  const handleQuantityUpdate = useCallback(async (cartItemId, quantity) => {
    setFeedback(null);
    setPendingItemId(cartItemId);
    setPendingAction('update');

    const result = await updateItem(cartItemId, quantity);

    if (result.success) {
      setFeedback({
        title: 'Cart updated',
        description: 'The item quantity and backend subtotal were refreshed.'
      });
    }

    clearOperationState();
    return result;
  }, [clearOperationState, updateItem]);

  const handleRemoveItem = useCallback(async (cartItemId) => {
    setFeedback(null);
    setPendingItemId(cartItemId);
    setPendingAction('remove');

    const result = await removeItem(cartItemId);

    if (result.success) {
      setFeedback({
        title: 'Item removed',
        description: 'The cart totals were refreshed from the backend.'
      });
    }

    clearOperationState();
    return result;
  }, [clearOperationState, removeItem]);

  return (
    <VStack
      style={{
        width: '100%',
        maxWidth: '1200px',
        marginInline: 'auto',
        paddingBlock: 'var(--spacing-6)',
        gap: 'var(--spacing-6)'
      }}
    >
      <VStack gap={1}>
        <Heading level={1}>Cart</Heading>
        <Text color="secondary">
          Review item quantities, remove anything you do not need, and use the backend subtotal as the total source of truth.
        </Text>
      </VStack>

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
        />
      )}

      <Grid columns={{ minWidth: 280, max: 2 }} gap={4} style={{ alignItems: 'start' }}>
        <CartItemList
          items={items}
          isLoading={loading}
          error={error}
          onRetry={refreshCart}
          onBrowseProducts={() => navigate('/products')}
          onQuantityChange={handleQuantityUpdate}
          onRemove={handleRemoveItem}
          pendingItemId={pendingItemId}
          pendingAction={pendingAction}
          isBusy={actionLoading}
        />

        {!loading && !error && items.length > 0 && (
          <CartSummary
            subtotal={subtotal}
            itemCount={itemCount}
            isDisabled={actionLoading}
            onCheckout={() => navigate('/checkout')}
          />
        )}
      </Grid>
    </VStack>
  );
};

export default CartView;
