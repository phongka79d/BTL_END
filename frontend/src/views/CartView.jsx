import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Heading, Text, VStack } from '@astryxdesign/core';
import { useCart } from '../contexts/CartContext';
import Alert from '../components/common/Alert';
import CartItemList from '../components/cart/CartItemList';
import CartSummary from '../components/cart/CartSummary';
import {
  buildQuantityChanges,
  buildQuantityErrors,
  getSelectedQuantityTotals,
  hasInvalidItemQuantity
} from '../utils/cartQuantityDrafts';

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
        nextDrafts[item.id] = currentDrafts[item.id] ?? String(item.quantity);
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

  const quantityErrors = useMemo(
    () => buildQuantityErrors(items, draftQuantities),
    [draftQuantities, items]
  );

  const hasInvalidQuantity = hasInvalidItemQuantity(items, quantityErrors);

  const quantityChanges = useMemo(
    () => buildQuantityChanges(items, draftQuantities, quantityErrors),
    [draftQuantities, items, quantityErrors]
  );

  const selectedItems = useMemo(() => {
    const selectedItemIdSet = new Set(selectedItemIds);
    return items.filter((item) => selectedItemIdSet.has(item.id));
  }, [items, selectedItemIds]);

  const hasInvalidSelectedQuantity = hasInvalidItemQuantity(selectedItems, quantityErrors);

  const { itemCount: selectedItemCount, subtotal: selectedSubtotal } = useMemo(
    () => getSelectedQuantityTotals(selectedItems, draftQuantities, quantityErrors),
    [draftQuantities, quantityErrors, selectedItems]
  );

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
    if (hasInvalidQuantity || !quantityChanges.length) {
      return;
    }

    setFeedback(null);
    setIsSaving(true);
    const result = await updateItems(quantityChanges);
    setIsSaving(false);

    if (!result.success) {
      setFeedback({
        title: 'Không thể lưu thay đổi giỏ hàng',
        description: result.error || 'Vui lòng kiểm tra lại số lượng và thử lại.',
        status: 'error'
      });
      return;
    }

    setFeedback({
      title: 'Đã lưu thay đổi giỏ hàng',
      description: 'Số lượng và tổng tiền đã được cập nhật từ backend.',
      status: 'success'
    });
  }, [hasInvalidQuantity, quantityChanges, updateItems]);

  const handleRemoveItem = useCallback(async (cartItemId) => {
    setFeedback(null);
    setPendingItemId(cartItemId);
    setPendingAction('remove');

    const result = await removeItem(cartItemId);

    if (result.success) {
      setFeedback({
        title: 'Đã xóa sản phẩm',
        description: 'Tổng tiền giỏ hàng đã được cập nhật từ backend.',
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
        <Heading level={1}>Giỏ hàng</Heading>
        <Text color="secondary">
          Chọn sản phẩm để thanh toán, điều chỉnh số lượng rồi lưu tất cả thay đổi trước khi tiếp tục.
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
          quantityErrors={quantityErrors}
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
            isSaveDisabled={hasInvalidQuantity}
            isCheckoutDisabled={actionLoading || isSaving || hasInvalidSelectedQuantity}
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
