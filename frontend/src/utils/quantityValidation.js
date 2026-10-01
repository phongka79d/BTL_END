const INVALID_PURCHASE_QUANTITY_MESSAGE = 'Số lượng không hợp lệ';
const INVALID_INVENTORY_QUANTITY_MESSAGE = 'Số lượng phải là số nguyên không âm.';
const NEGATIVE_INVENTORY_QUANTITY_MESSAGE = 'Số lượng không được là số âm.';

const isEmptyQuantity = (value) => (
  value === null
  || value === undefined
  || (typeof value === 'string' && value.length === 0)
);

const parseIntegerQuantity = (value) => {
  if (
    isEmptyQuantity(value)
    || (typeof value !== 'number' && typeof value !== 'string')
  ) {
    return null;
  }

  if (typeof value === 'string' && !/^-?\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

export const validateInventoryQuantity = (value) => {
  const isNegative = (
    (typeof value === 'number' && value < 0)
    || (typeof value === 'string' && value.startsWith('-'))
  );

  if (isNegative) {
    return NEGATIVE_INVENTORY_QUANTITY_MESSAGE;
  }

  const parsed = parseIntegerQuantity(value);

  if (parsed === null) {
    return INVALID_INVENTORY_QUANTITY_MESSAGE;
  }

  return null;
};

export const validatePurchaseQuantity = (value, stock) => {
  const parsed = parseIntegerQuantity(value);
  const parsedStock = parseIntegerQuantity(stock);

  if (parsed === null || parsedStock === null || parsed < 1 || parsed > parsedStock) {
    return INVALID_PURCHASE_QUANTITY_MESSAGE;
  }

  return null;
};

export const getPurchasableQuantity = (value, stock) => {
  if (validatePurchaseQuantity(value, stock)) {
    return null;
  }

  return Number(value);
};
