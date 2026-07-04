import React from 'react';
import PlaceholderView from '../../components/common/PlaceholderView';

export const AdminCategoryView = () => (
  <PlaceholderView
    eyebrow="Admin Management"
    title="Categories"
    description="The admin categories route is protected by the existing admin guard and ready for category table, form, and delete behavior in the admin UI batch."
    actions={[{ label: 'Admin Dashboard', to: '/admin' }]}
  />
);

export default AdminCategoryView;
