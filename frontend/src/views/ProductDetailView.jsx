import React from 'react';
import { useParams } from 'react-router-dom';
import PlaceholderView from '../components/common/PlaceholderView';

export const ProductDetailView = () => {
  const { id } = useParams();

  return (
    <PlaceholderView
      eyebrow="Customer Catalog"
      title="Product Detail"
      description={`The product detail route is ready for product ${id || 'selected'} and will host the image, stock, and add-to-cart flow in the customer UI batch.`}
      actions={[{ label: 'All Products', to: '/products' }]}
    />
  );
};

export default ProductDetailView;
