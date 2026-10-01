const INVENTORY_INVALID_MESSAGE = 'Số lượng phải là số nguyên không âm.';
const INVENTORY_NEGATIVE_MESSAGE = 'Số lượng không được là số âm.';
const PURCHASE_INVALID_MESSAGE = 'Số lượng không hợp lệ';

const isIntegerValue = (value) => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value);
  }

  if (typeof value !== 'string' || value.length === 0 || !/^\d+$/.test(value)) {
    return false;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed);
};

const isNegativeValue = (value) => {
  if (typeof value === 'number') {
    return value < 0;
  }
  return typeof value === 'string' && /^-/.test(value);
};

const toQuantity = (value) => {
  if (!isIntegerValue(value)) {
    return null;
  }
  return Number(value);
};

const validateInventoryQuantity = (value) => {
  if (isNegativeValue(value)) {
    return INVENTORY_NEGATIVE_MESSAGE;
  }
  return isIntegerValue(value) ? null : INVENTORY_INVALID_MESSAGE;
};

const validatePurchaseQuantity = (value, stock) => {
  const quantity = toQuantity(value);
  const availableStock = toQuantity(stock);

  if (quantity === null || quantity < 1 || availableStock === null || quantity > availableStock) {
    return PURCHASE_INVALID_MESSAGE;
  }
  return null;
};

module.exports = {
  INVENTORY_INVALID_MESSAGE,
  INVENTORY_NEGATIVE_MESSAGE,
  PURCHASE_INVALID_MESSAGE,
  isIntegerValue,
  toQuantity,
  validateInventoryQuantity,
  validatePurchaseQuantity
};
