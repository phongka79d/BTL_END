export const EMPTY_ADDRESS = Object.freeze({
  provinceCode: '',
  provinceName: '',
  wardCode: '',
  wardName: '',
  detail: ''
});

const PROFILE_FIELDS = [
  ['provinceCode', 'addressProvinceCode'],
  ['provinceName', 'addressProvinceName'],
  ['wardCode', 'addressWardCode'],
  ['wardName', 'addressWardName'],
  ['detail', 'addressDetail']
];
const ADDRESS_FIELDS = PROFILE_FIELDS.map(([field]) => field);
const PAYLOAD_FIELDS = ['provinceCode', 'wardCode', 'detail'];
const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const emptyAddress = () => ({ ...EMPTY_ADDRESS });

export const addressFromUser = (user) => {
  if (!isRecord(user)) return emptyAddress();

  const address = {};
  for (const [field, profileField] of PROFILE_FIELDS) {
    address[field] = asTrimmedString(user[profileField]);
  }

  return ADDRESS_FIELDS.every((field) => address[field] !== '') ? address : emptyAddress();
};

export const isCompleteAddress = (address) => (
  isRecord(address) && ADDRESS_FIELDS.every((field) => asTrimmedString(address[field]) !== '')
);

export const hasLegacyAddress = (user) => (
  isRecord(user)
  && asTrimmedString(user.address) !== ''
  && !isCompleteAddress(addressFromUser(user))
);

export const toAddressPayload = (address) => {
  const payload = Object.fromEntries(PAYLOAD_FIELDS.map((field) => [field, asTrimmedString(address?.[field])]));
  return Object.values(payload).some(Boolean) ? payload : null;
};

const getSelection = (selection, key) => {
  if (!isRecord(selection)) return '';
  return asTrimmedString(selection[key]);
};

export const changeProvince = (address, selectedProvince) => ({
  ...EMPTY_ADDRESS,
  provinceCode: getSelection(selectedProvince, 'code'),
  provinceName: getSelection(selectedProvince, 'name'),
  detail: typeof address?.detail === 'string' ? address.detail : ''
});

export const changeWard = (address, selectedWard) => ({
  ...EMPTY_ADDRESS,
  provinceCode: asTrimmedString(address?.provinceCode),
  provinceName: asTrimmedString(address?.provinceName),
  wardCode: getSelection(selectedWard, 'code'),
  wardName: getSelection(selectedWard, 'name'),
  detail: typeof address?.detail === 'string' ? address.detail : ''
});

