const ADDRESS_DISPLAY_FIELDS = ['detail', 'streetName', 'wardName', 'provinceName'];

export const formatVietnamAddress = (address) => {
  if (address === null || typeof address !== 'object' || Array.isArray(address)) {
    return '';
  }

  return ADDRESS_DISPLAY_FIELDS
    .map((field) => (typeof address[field] === 'string' ? address[field].trim() : ''))
    .filter(Boolean)
    .join(', ');
};
