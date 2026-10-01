export const getOrderRecipient = (order = {}) => {
  const user = order.user || {};

  return {
    name: order.recipientName || user.fullName || user.username || '—',
    phone: order.recipientPhone || user.phone || '—',
    note: order.note || ''
  };
};
