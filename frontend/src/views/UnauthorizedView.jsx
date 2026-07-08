import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PlaceholderView from '../components/common/PlaceholderView';

export const UnauthorizedView = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  const actions = [
    {
      label: 'Back to store',
      to: '/',
      variant: 'primary',
    },
  ];

  if (isAuthenticated) {
    actions.push({
      label: 'My profile',
      to: '/profile',
    });
  } else {
    actions.push({
      label: 'Sign in',
      to: '/login',
    });
  }

  if (isAdmin) {
    actions.push({
      label: 'Admin dashboard',
      to: '/admin',
    });
  }

  return (
    <PlaceholderView
      eyebrow="Access restricted"
      title="You do not have permission to view this page"
      description="This area is available only to accounts with the required role. Use one of the actions below to continue."
      actions={actions}
    />
  );
};

export default UnauthorizedView;
