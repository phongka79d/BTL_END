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
import {
  CategoriesIcon,
  DashboardIcon,
  HomeIcon,
  LogOutIcon,
  OrderBagIcon,
  ProductsIcon,
  ReportsIcon,
  ReviewsIcon,
  UserIcon,
  UsersIcon
} from '../components/common/LayoutIcons';

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
          icon={<OrderBagIcon />}
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
