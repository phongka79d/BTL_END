import React from 'react';
import PlaceholderView from '../components/common/PlaceholderView';

export const CartView = () => (
  <PlaceholderView
    eyebrow="Customer Cart"
    title="Cart"
    description="The authenticated cart route is wired to the existing guard and cart provider. Item controls and subtotal UI remain scheduled for the customer UI batch."
    actions={[{ label: 'Browse Products', to: '/products', variant: 'primary' }]}
  />
);

export default CartView;
