import { validatePurchaseQuantity } from './quantityValidation.js';

export const getDraftQuantity = (item, draftQuantities) => (
  draftQuantities[item.id] ?? item.quantity
);

export const buildQuantityErrors = (items, draftQuantities) => (
  items.reduce((errors, item) => {
    const error = validatePurchaseQuantity(
      getDraftQuantity(item, draftQuantities),
      item?.product?.quantity
    );

    if (error) {
      errors[item.id] = error;
    }

    return errors;
  }, {})
);

export const hasInvalidItemQuantity = (items, quantityErrors) => (
  items.some((item) => Boolean(quantityErrors[item.id]))
);

export const buildQuantityChanges = (items, draftQuantities, quantityErrors) => (
  items
    .filter((item) => !quantityErrors[item.id])
    .map((item) => ({
      id: item.id,
      quantity: Number(getDraftQuantity(item, draftQuantities)),
      savedQuantity: Number(item.quantity)
    }))
    .filter((item) => item.quantity !== item.savedQuantity)
    .map(({ id, quantity }) => ({ id, quantity }))
);

export const getSelectedQuantityTotals = (items, draftQuantities, quantityErrors) => (
  items.reduce((totals, item) => {
    if (quantityErrors[item.id]) {
      return totals;
    }

    const quantity = Number(getDraftQuantity(item, draftQuantities));

    return {
      itemCount: totals.itemCount + quantity,
      subtotal: totals.subtotal + (Number(item.unitPrice) || 0) * quantity
    };
  }, { itemCount: 0, subtotal: 0 })
);
