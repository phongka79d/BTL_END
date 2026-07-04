import React from 'react';
import PlaceholderView from '../components/common/PlaceholderView';

export const ProductListView = () => (
  <PlaceholderView
    eyebrow="Customer Catalog"
    title="Products"
    description="The product listing route is ready for the catalog grid, filters, loading, empty, and error states scheduled in the customer UI batch."
    actions={[{ label: 'Back Home', to: '/' }]}
  />
);

export default ProductListView;
