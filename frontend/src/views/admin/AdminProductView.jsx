import React from 'react';
import PlaceholderView from '../../components/common/PlaceholderView';

export const AdminProductView = () => (
  <PlaceholderView
    eyebrow="Admin Management"
    title="Products"
    description="The admin products route is protected by the existing admin guard and ready for the table, form dialog, and delete confirmation batch."
    actions={[{ label: 'Admin Dashboard', to: '/admin' }]}
  />
);

export default AdminProductView;
