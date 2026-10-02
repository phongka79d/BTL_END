import { validateAddress } from '../../utils/addressValidation.js';
import { validateCheckoutFullName } from '../../utils/checkoutValidation.js';
import { validatePhone } from '../../utils/phoneValidation.js';
import { toAddressPayload } from '../address/addressFormUtils.js';

export const validateCheckoutValues = (values) => {
  const errors = {};

  const fullNameError = validateCheckoutFullName(values.fullName);
  if (fullNameError) {
    errors.fullName = fullNameError;
  }

  const phoneError = validatePhone(values.phone, { required: true });
  if (phoneError) {
    errors.phone = phoneError;
  }

  const addressErrors = validateAddress(values.address, { required: true });
  if (Object.keys(addressErrors).length > 0) {
    errors.address = addressErrors;
  }

  return errors;
};

export const buildCheckoutPayload = (values, selectedItems) => ({
  fullName: values.fullName.trim(),
  phone: values.phone,
  address: toAddressPayload(values.address),
  note: values.note.trim() || undefined,
  cartItemIds: selectedItems.map((item) => item.id)
});

export const createCheckoutRequest = ({ values, selectedItems, createOrder }) => {
  const errors = validateCheckoutValues(values);

  if (Object.keys(errors).length > 0) {
    return { errors, run: null };
  }

  const payload = buildCheckoutPayload(values, selectedItems);
  return {
    errors,
    run: () => createOrder(payload)
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
