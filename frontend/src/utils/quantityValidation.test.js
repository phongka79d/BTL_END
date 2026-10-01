import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPurchasableQuantity,
  validateInventoryQuantity,
  validatePurchaseQuantity
} from './quantityValidation.js';
import {
  buildQuantityChanges,
  buildQuantityErrors,
  getDraftQuantity,
  getSelectedQuantityTotals,
  hasInvalidItemQuantity
} from './cartQuantityDrafts.js';

const INVALID_PURCHASE_QUANTITY_MESSAGE = 'Số lượng không hợp lệ';

const createCartItem = ({ id, quantity = 1, stock = 34, unitPrice = 1000 }) => ({
  id,
  quantity,
  unitPrice,
  product: { quantity: stock }
});

test('purchase quantity keeps the raw draft contract around stock boundaries', () => {
  const drafts = [
    ['37', INVALID_PURCHASE_QUANTITY_MESSAGE],
    ['-355', INVALID_PURCHASE_QUANTITY_MESSAGE],
    ['1.5', INVALID_PURCHASE_QUANTITY_MESSAGE],
    ['0', INVALID_PURCHASE_QUANTITY_MESSAGE],
    ['34', null],
    ['35', INVALID_PURCHASE_QUANTITY_MESSAGE]
  ];

  drafts.forEach(([draft, expectedError]) => {
    assert.equal(validatePurchaseQuantity(draft, 34), expectedError, draft);
  });
});

test('purchase quantity rejects empty and nonnumeric drafts without coercing them', () => {
  ['', ' ', ' 34', '34 ', 'abc', '1e2'].forEach((draft) => {
    assert.equal(
      validatePurchaseQuantity(draft, 34),
      INVALID_PURCHASE_QUANTITY_MESSAGE,
      draft
    );
  });
});

test('inventory quantity accepts zero but rejects invalid and negative values', () => {
  assert.equal(validateInventoryQuantity('0'), null);
  assert.equal(validateInventoryQuantity(34), null);
  assert.equal(validateInventoryQuantity('-1'), 'Số lượng không được là số âm.');
  assert.equal(validateInventoryQuantity('-1.5'), 'Số lượng không được là số âm.');
  assert.equal(validateInventoryQuantity('1.5'), 'Số lượng phải là số nguyên không âm.');
  assert.equal(validateInventoryQuantity(''), 'Số lượng phải là số nguyên không âm.');
  assert.equal(validateInventoryQuantity([]), 'Số lượng phải là số nguyên không âm.');
});

test('add-to-cart payload only accepts quantities validated against stock', () => {
  ['37', '-355', '1.5', '0', '', 'abc'].forEach((draft) => {
    assert.equal(getPurchasableQuantity(draft, 34), null, draft);
  });

  assert.equal(getPurchasableQuantity('34', 34), 34);
  assert.equal(getPurchasableQuantity('2', 34), 2);
  assert.equal(getPurchasableQuantity(2, 34), 2);
  assert.equal(getPurchasableQuantity('1', 0), null);
});

test('cart keeps raw invalid drafts untouched and produces no update payload', () => {
  const items = [
    createCartItem({ id: 'over-stock' }),
    createCartItem({ id: 'negative' }),
    createCartItem({ id: 'fraction' }),
    createCartItem({ id: 'zero' })
  ];
  const draftQuantities = {
    'over-stock': '37',
    negative: '-355',
    fraction: '1.5',
    zero: '0'
  };

  const quantityErrors = buildQuantityErrors(items, draftQuantities);

  assert.deepEqual(
    Object.keys(quantityErrors).sort(),
    ['fraction', 'negative', 'over-stock', 'zero']
  );
  items.forEach((item) => {
    assert.equal(getDraftQuantity(item, draftQuantities), draftQuantities[item.id], item.id);
  });
  assert.equal(hasInvalidItemQuantity(items, quantityErrors), true);
  assert.deepEqual(buildQuantityChanges(items, draftQuantities, quantityErrors), []);
  assert.deepEqual(getSelectedQuantityTotals(items, draftQuantities, quantityErrors), {
    itemCount: 0,
    subtotal: 0
  });
});

test('cart update payload carries only valid changed lines while an invalid draft stays local', () => {
  const items = [
    createCartItem({ id: 'valid-change', stock: 34 }),
    createCartItem({ id: 'invalid-draft', stock: 34 })
  ];
  const draftQuantities = { 'valid-change': '34', 'invalid-draft': '35' };
  const quantityErrors = buildQuantityErrors(items, draftQuantities);

  assert.equal(quantityErrors['valid-change'], undefined);
  assert.equal(quantityErrors['invalid-draft'], INVALID_PURCHASE_QUANTITY_MESSAGE);
  // The payload builder drops invalid lines; CartView also refuses to save while any line is invalid.
  assert.deepEqual(buildQuantityChanges(items, draftQuantities, quantityErrors), [
    { id: 'valid-change', quantity: 34 }
  ]);
  assert.equal(hasInvalidItemQuantity(items, quantityErrors), true);
});

test('cart update payload skips valid drafts that match the saved quantity', () => {
  const items = [createCartItem({ id: 'settled', quantity: 34, stock: 34 })];
  const draftQuantities = { settled: '34' };
  const quantityErrors = buildQuantityErrors(items, draftQuantities);

  assert.equal(hasInvalidItemQuantity(items, quantityErrors), false);
  assert.deepEqual(buildQuantityChanges(items, draftQuantities, quantityErrors), []);
});

test('selected valid line stays checkout-ready while an unselected draft is invalid', () => {
  const selectedItem = createCartItem({ id: 'selected', quantity: 2, stock: 34, unitPrice: 1500 });
  const unselectedItem = createCartItem({ id: 'unselected', quantity: 1, stock: 34 });
  const items = [selectedItem, unselectedItem];
  const draftQuantities = { selected: '2', unselected: '35' };
  const quantityErrors = buildQuantityErrors(items, draftQuantities);

  assert.equal(quantityErrors.selected, undefined);
  assert.equal(quantityErrors.unselected, INVALID_PURCHASE_QUANTITY_MESSAGE);
  // Checkout only inspects selected lines, while the save gate still covers the whole cart.
  assert.equal(hasInvalidItemQuantity([selectedItem], quantityErrors), false);
  assert.equal(hasInvalidItemQuantity(items, quantityErrors), true);
  assert.deepEqual(buildQuantityChanges(items, draftQuantities, quantityErrors), []);
  assert.deepEqual(getSelectedQuantityTotals([selectedItem], draftQuantities, quantityErrors), {
    itemCount: 2,
    subtotal: 3000
  });
});

test('invalid selected draft contributes nothing to selection totals', () => {
  const items = [createCartItem({ id: 'selected-invalid', stock: 34 })];
  const draftQuantities = { 'selected-invalid': '1.5' };
  const quantityErrors = buildQuantityErrors(items, draftQuantities);

  assert.equal(hasInvalidItemQuantity(items, quantityErrors), true);
  assert.deepEqual(getSelectedQuantityTotals(items, draftQuantities, quantityErrors), {
    itemCount: 0,
    subtotal: 0
  });
});
