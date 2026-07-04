import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  TopNav,
  TopNavHeading,
  SideNav,
  SideNavHeading,
  SideNavSection,
  SideNavItem,
  Avatar,
  DropdownMenu,
  Icon,
  Button,
  HStack,
  VStack
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';

// Simple custom inline SVG icons for admin navigation items
const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 14.25v2.25m3-2.25v2.25m3-2.25v2.25m3-2.25v2.25A2.25 2.25 0 0 1 13.5 20.25h-9A2.25 2.25 0 0 1 2.25 18V6A2.25 2.25 0 0 1 4.5 3.75h9A2.25 2.25 0 0 1 15.75 6v12a2.25 2.25 0 0 1-2.25 2.25m-9-16.5h.008v.008H4.5V3.75Zm0 3h.008v.008H4.5V6.75Zm0 3h.008v.008H4.5V9.75Zm0 3h.008v.008H4.5V12.75Z"
    />
  </svg>
);

const ProductsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
    />
  </svg>
);

const CategoriesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182L11.16 3.659A2.25 2.25 0 0 0 9.568 3Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 7.5h.008v.008H6V7.5Z"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
    />
  </svg>
);

const OrdersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    />
  </svg>
);

const ReviewsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499c.162-.426.772-.426.934 0l1.79 4.7c.063.167.22.28.398.297l5.068.498c.463.045.65.617.316.924l-3.8 3.5c-.133.123-.194.305-.16.482l1.09 4.981c.099.453-.391.809-.78.583l-4.717-2.7a.81.81 0 0 0-.742 0l-4.717 2.7c-.389.226-.879-.13-.78-.583l1.09-4.98c.034-.178-.026-.36-.16-.483L2.686 11.11c-.334-.307-.148-.88.316-.925l5.067-.497c.18-.016.335-.13.399-.297l1.79-4.7Z"
    />
  </svg>
);

const ReportsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
    />
  </svg>
);

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '16px', height: '16px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '16px', height: '16px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{ width: '16px', height: '16px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
    />
  </svg>
);

/**
 * AdminLayout component that serves as the page shell for administrative pages.
 * It provides a collapsible sidebar (SideNav) with management links and a simplified top nav.
 */
export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebar = (
    <SideNav
      collapsible
      header={
        <SideNavHeading
          logo={<Icon icon="wrench" color="accent" />}
          heading="Admin Panel"
          headingHref="/admin"
          as={Link}
        />
      }
      footerIcons={
        <DropdownMenu
          button={{
            icon: <Avatar name={user?.username || 'Admin'} size="xsmall" />,
            label: user?.username || 'Admin',
            variant: 'secondary',
            size: 'sm'
          }}
          items={[
            {
              label: 'Back to Store',
              onClick: () => navigate('/'),
              icon: HomeIcon
            },
            {
              label: 'Profile',
              onClick: () => navigate('/profile'),
              icon: UserIcon
            },
            {
              label: 'Logout',
              onClick: logout,
              icon: LogOutIcon
            }
          ]}
        />
      }
    >
      <SideNavSection title="Management">
        <SideNavItem
          label="Dashboard"
          href="/admin"
          icon={<DashboardIcon />}
          as={Link}
          isSelected={location.pathname === '/admin'}
        />
        <SideNavItem
          label="Products"
          href="/admin/products"
          icon={<ProductsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/products')}
        />
        <SideNavItem
          label="Categories"
          href="/admin/categories"
          icon={<CategoriesIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/categories')}
        />
        <SideNavItem
          label="Users"
          href="/admin/users"
          icon={<UsersIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/users')}
        />
        <SideNavItem
          label="Orders"
          href="/admin/orders"
          icon={<OrdersIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/orders')}
        />
        <SideNavItem
          label="Reviews"
          href="/admin/reviews"
          icon={<ReviewsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/reviews')}
        />
        <SideNavItem
          label="Reports"
          href="/admin/reports"
          icon={<ReportsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/reports')}
        />
      </SideNavSection>
    </SideNav>
  );

  const topNav = (
    <TopNav
      heading={<TopNavHeading heading="Admin Console" />}
      endContent={
        <HStack gap={2}>
          <Button
            label="View Store"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
          />
        </HStack>
      }
    />
  );

  return (
    <AppShell height="fill" sideNav={sidebar} topNav={topNav}>
      <VStack style={{ height: '100%', padding: 'var(--spacing-4)', overflowY: 'auto' }}>
        <Outlet />
      </VStack>
    </AppShell>
  );
};

export default AdminLayout;
