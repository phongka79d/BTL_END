import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    loading,
    actionLoading,
    error,
    refreshCart,
    updateItems,
    removeItem
  } = useCart();
  const [feedback, setFeedback] = useState(null);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [draftQuantities, setDraftQuantities] = useState({});
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const selectionInitializedRef = useRef(false);

  const clearOperationState = useCallback(() => {
    setPendingItemId(null);
    setPendingAction(null);
  }, []);

  useEffect(() => {
    const availableItemIds = new Set(items.map((item) => item.id));

    setDraftQuantities((currentDrafts) => {
      const nextDrafts = {};
      items.forEach((item) => {
        nextDrafts[item.id] = currentDrafts[item.id] ?? Number(item.quantity);
      });
      return nextDrafts;
    });

    setSelectedItemIds((currentSelection) => {
      if (!selectionInitializedRef.current && items.length > 0) {
        selectionInitializedRef.current = true;
        return items.map((item) => item.id);
      }
      if (items.length === 0) {
        selectionInitializedRef.current = false;
      }
      return currentSelection.filter((itemId) => availableItemIds.has(itemId));
    });
  }, [items]);

  const quantityChanges = useMemo(() => {
    return items
      .map((item) => ({
        id: item.id,
        quantity: Number(draftQuantities[item.id] ?? item.quantity),
        savedQuantity: Number(item.quantity)
      }))
      .filter((item) => item.quantity !== item.savedQuantity)
      .map(({ id, quantity }) => ({ id, quantity }));
  }, [draftQuantities, items]);

  const selectedItems = useMemo(() => {
    const selectedItemIdSet = new Set(selectedItemIds);
    return items.filter((item) => selectedItemIdSet.has(item.id));
  }, [items, selectedItemIds]);

  const selectedItemCount = useMemo(() => {
    return selectedItems.reduce(
      (total, item) => total + Number(draftQuantities[item.id] ?? item.quantity),
      0
    );
  }, [draftQuantities, selectedItems]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      const quantity = Number(draftQuantities[item.id] ?? item.quantity);
      return total + (Number(item.unitPrice) || 0) * quantity;
    }, 0);
  }, [draftQuantities, selectedItems]);

  const handleQuantityChange = useCallback((cartItemId, quantity) => {
    setDraftQuantities((currentDrafts) => ({
      ...currentDrafts,
      [cartItemId]: quantity
    }));
  }, []);

  const handleSelectAll = useCallback((isSelected) => {
    setSelectedItemIds(isSelected ? items.map((item) => item.id) : []);
  }, [items]);

  const handleSelectionChange = useCallback((cartItemId, isSelected) => {
    setSelectedItemIds((currentSelection) => {
      const selectedItemIdSet = new Set(currentSelection);
      if (isSelected) {
        selectedItemIdSet.add(cartItemId);
      } else {
        selectedItemIdSet.delete(cartItemId);
      }
      return [...selectedItemIdSet];
    });
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!quantityChanges.length) {
      return;
    }

    setFeedback(null);
    setIsSaving(true);
    const result = await updateItems(quantityChanges);
    setIsSaving(false);

    if (result.success) {
      setFeedback({
        title: 'Cart changes saved',
        description: 'Quantities and totals were refreshed from the backend.',
        status: 'success'
      });
    }
  }, [quantityChanges, updateItems]);

  const handleRemoveItem = useCallback(async (cartItemId) => {
    setFeedback(null);
    setPendingItemId(cartItemId);
    setPendingAction('remove');

    const result = await removeItem(cartItemId);

    if (result.success) {
      setFeedback({
        title: 'Item removed',
        description: 'The cart totals were refreshed from the backend.',
        status: 'success'
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
          Select products for checkout, adjust quantities, then save all changes together before continuing.
        </Text>
      </VStack>

      {feedback && (
        <Alert
          title={feedback.title}
          description={feedback.description}
          status={feedback.status}
        />
      )}

      <Grid columns={{ minWidth: 280, max: 2 }} gap={4} style={{ alignItems: 'start' }}>
        <CartItemList
          items={items}
          isLoading={loading}
          error={error}
          onRetry={refreshCart}
          onBrowseProducts={() => navigate('/products')}
          onQuantityChange={handleQuantityChange}
          draftQuantities={draftQuantities}
          selectedItemIds={selectedItemIds}
          onSelectAll={handleSelectAll}
          onSelectionChange={handleSelectionChange}
          onRemove={handleRemoveItem}
          pendingItemId={pendingItemId}
          pendingAction={pendingAction}
          isBusy={actionLoading}
        />

        {!loading && !error && items.length > 0 && (
          <CartSummary
            subtotal={selectedSubtotal}
            itemCount={selectedItemCount}
            selectedProductCount={selectedItems.length}
            hasUnsavedChanges={quantityChanges.length > 0}
            isSaving={isSaving}
            isDisabled={actionLoading || isSaving}
            onSaveChanges={handleSaveChanges}
            onCheckout={() => navigate('/checkout', { state: { cartItemIds: selectedItemIds } })}
            onContinueShopping={() => navigate('/products')}
          />
        )}
      </Grid>
    </VStack>
  );
};

export default CartView;
