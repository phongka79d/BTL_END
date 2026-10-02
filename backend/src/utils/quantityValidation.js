const INVENTORY_INVALID_MESSAGE = 'Số lượng phải là số nguyên không âm.';
const INVENTORY_NEGATIVE_MESSAGE = 'Số lượng không được là số âm.';
const PURCHASE_INVALID_MESSAGE = 'Số lượng không hợp lệ';
// Cột quantity là PostgreSQL INTEGER (Prisma Int): vượt giới hạn này sẽ làm lỗi ghi CSDL (500).
const MAX_QUANTITY = 2147483647;
const INVENTORY_TOO_LARGE_MESSAGE = `Số lượng không được vượt quá ${MAX_QUANTITY}.`;

const isIntegerValue = (value) => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value <= MAX_QUANTITY;
  }

  if (typeof value !== 'string' || value.length === 0 || !/^\d+$/.test(value)) {
    return false;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= MAX_QUANTITY;
};

const isTooLarge = (value) => {
  const parsed = typeof value === 'number' ? value : (typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN);
  return Number.isFinite(parsed) && parsed > MAX_QUANTITY;
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
  if (isTooLarge(value)) {
    return INVENTORY_TOO_LARGE_MESSAGE;
  }
  return isIntegerValue(value) ? null : INVENTORY_INVALID_MESSAGE;
};

const describeProduct = (productName) => (
  typeof productName === 'string' && productName.trim() ? `Sản phẩm "${productName.trim()}"` : 'Sản phẩm'
);

/**
 * Thông báo khi số lượng mua vượt tồn kho hiện tại, nêu rõ còn bao nhiêu thay vì "không hợp lệ".
 * @param {{productName?: string, available: number, inCart?: number}} details
 */
const stockShortageMessage = ({ productName, available, inCart = 0 }) => {
  const subject = describeProduct(productName);
  if (available <= 0) return `${subject} đã hết hàng.`;
  const base = `${subject} chỉ còn ${available} sản phẩm trong kho`;
  return inCart > 0 ? `${base}, bạn đã có ${inCart} trong giỏ hàng.` : `${base}.`;
};

/**
 * Trả về null khi hợp lệ; PURCHASE_INVALID_MESSAGE khi số lượng sai định dạng;
 * thông báo tồn kho cụ thể khi vượt quá số lượng còn lại.
 */
const validatePurchaseQuantity = (value, stock, { productName, inCart = 0 } = {}) => {
  const quantity = toQuantity(value);
  const availableStock = toQuantity(stock);

  if (quantity === null || quantity < 1 || availableStock === null) {
    return PURCHASE_INVALID_MESSAGE;
  }
  if (quantity > availableStock) {
    return stockShortageMessage({ productName, available: availableStock, inCart });
  }
  return null;
};

/** Lỗi số lượng mua có thể hiển thị trực tiếp cho người dùng (HTTP 400). */
const purchaseQuantityError = (message) => {
  const error = new Error(message);
  error.code = 'PURCHASE_QUANTITY';
  error.status = 400;
  return error;
};

module.exports = {
  INVENTORY_INVALID_MESSAGE,
  MAX_QUANTITY,
  INVENTORY_NEGATIVE_MESSAGE,
  PURCHASE_INVALID_MESSAGE,
  isIntegerValue,
  purchaseQuantityError,
  stockShortageMessage,
  toQuantity,
  validateInventoryQuantity,
  validatePurchaseQuantity
};
