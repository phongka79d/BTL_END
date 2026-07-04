import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  TopNav,
  TopNavHeading,
  TopNavItem,
  Avatar,
  DropdownMenu,
  Icon,
  Badge,
  Button,
  VStack,
  HStack,
  Text
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';

// Simple custom inline SVG icons to keep the UI clean and styled
const CartIcon = () => (
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
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
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

const OrdersIcon = () => (
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
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0 1 12 3c1.28 0 2.53.086 3.753.25m-11.23 2.062H4a2.25 2.25 0 0 0-2.25 2.25v10.511a2.25 2.25 0 0 0 2.25 2.25h1.954m.64-18a2.25 2.25 0 0 0-2.25 2.25v1.954"
    />
  </svg>
);

const AdminIcon = () => (
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
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
    />
  </svg>
);

/**
 * MainLayout component that serves as the page shell for normal customers.
 * It provides top navigation (logo, home, products, user actions, cart) and a footer.
 */
export const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Define dropdown items for logged-in user dynamically based on role
  const getDropdownItems = () => {
    const items = [
      {
        label: 'Profile',
        onClick: () => navigate('/profile'),
        icon: UserIcon
      }
    ];

    if (!user || user.role === 'customer') {
      items.push({
        label: 'My Orders',
        onClick: () => navigate('/orders'),
        icon: OrdersIcon
      });
    }

    if (user && user.role === 'admin') {
      items.push({
        label: 'Admin Dashboard',
        onClick: () => navigate('/admin'),
        icon: AdminIcon
      });
    }

    items.push({
      label: 'Logout',
      onClick: logout,
      icon: LogOutIcon
    });

    return items;
  };

  const topNav = (
    <TopNav
      heading={
        <TopNavHeading
          logo={<Icon icon="wrench" color="accent" />}
          heading="TechMart"
          headingHref="/"
          as={Link}
        />
      }
      startContent={
        <HStack gap={1}>
          <TopNavItem
            label="Home"
            href="/"
            as={Link}
            isSelected={location.pathname === '/'}
          />
          <TopNavItem
            label="Products"
            href="/products"
            as={Link}
            isSelected={location.pathname.startsWith('/products')}
          />
        </HStack>
      }
      endContent={
        <HStack gap={3} style={{ alignItems: 'center' }}>
          {/* Cart Icon with badge placeholder */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              display: 'inline-flex',
              textDecoration: 'none',
              color: 'var(--color-text-primary)'
            }}
          >
            <HStack
              style={{
                padding: 'var(--spacing-2)',
                borderRadius: 'var(--radius-element)',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                transition: 'background-color var(--duration-fast)',
                ':hover': {
                  backgroundColor: 'var(--color-overlay-hover)'
                }
              }}
            >
              <CartIcon />
              <Badge
                variant="accent"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  paddingInline: 'var(--spacing-1)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                0
              </Badge>
            </HStack>
          </Link>

          {/* Authentication actions / User Dropdown */}
          {isAuthenticated && user ? (
            <DropdownMenu
              button={{
                label: user.username || user.email || 'Account',
                icon: <Avatar name={user.username || user.email} size="xsmall" />,
                variant: 'secondary',
                size: 'sm'
              }}
              items={getDropdownItems()}
            />
          ) : (
            <HStack gap={2}>
              <Button
                label="Login"
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
              />
              <Button
                label="Register"
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              />
            </HStack>
          )}
        </HStack>
      }
    />
  );

  return (
    <AppShell height="auto" topNav={topNav}>
      <VStack
        style={{
          minHeight: 'calc(100vh - 64px)',
          justifyContent: 'space-between',
          gap: 'var(--spacing-8)'
        }}
      >
        {/* Main Content Area */}
        <VStack style={{ flex: 1, padding: 'var(--spacing-4)' }}>
          <Outlet />
        </VStack>

        {/* Footer component */}
        <VStack
          style={{
            paddingBlock: 'var(--spacing-8)',
            paddingInline: 'var(--spacing-4)',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background-surface)',
            alignItems: 'center',
            gap: 'var(--spacing-3)'
          }}
        >
          <Text size="supporting" color="secondary">
            © 2026 TechMart Electronics E-Commerce. All rights reserved.
          </Text>
          <HStack gap={4}>
            <Link
              to="/about"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--text-supporting-size)'
              }}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--text-supporting-size)'
              }}
            >
              Contact
            </Link>
            <Link
              to="/terms"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--text-supporting-size)'
              }}
            >
              Terms & Conditions
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </AppShell>
  );
};

export default MainLayout;
