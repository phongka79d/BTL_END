import { validatePhone } from '../../utils/phoneValidation.js';

export const validateCheckoutValues = (values) => {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Vui lòng nhập họ và tên.';
  }

  const phoneError = validatePhone(values.phone, { required: true });
  if (phoneError) {
    errors.phone = phoneError;
  }

  if (!values.shippingAddress.trim()) {
    errors.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng.';
  }

  return errors;
};

export const buildCheckoutPayload = (values, selectedItems) => ({
  fullName: values.fullName.trim(),
  phone: values.phone,
  shippingAddress: values.shippingAddress.trim(),
  note: values.note.trim() || undefined,
  cartItemIds: selectedItems.map((item) => item.id)
});

export const createCheckoutRequest = ({ values, selectedItems, createOrder }) => {
  const errors = validateCheckoutValues(values);

  if (Object.keys(errors).length > 0) {
    return { errors, run: null };
  }

  return {
    errors,
    run: () => createOrder(buildCheckoutPayload(values, selectedItems))
  };
};

export const createSubmissionGuard = () => {
  let inFlight = false;

  return {
    begin: () => {
      if (inFlight) {
        return false;
      }

      inFlight = true;
      return true;
    },
    end: () => {
      inFlight = false;
    }
  };
};
