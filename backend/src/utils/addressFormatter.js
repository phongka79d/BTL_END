const ADDRESS_DISPLAY_FIELDS = ['detail', 'streetName', 'wardName', 'provinceName'];

const formatVietnamAddress = (address) => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return '';
  }

  return ADDRESS_DISPLAY_FIELDS
    .map((field) => (typeof address[field] === 'string' ? address[field].trim() : ''))
    .filter(Boolean)
    .join(', ');
};

module.exports = {
  formatVietnamAddress,
};
