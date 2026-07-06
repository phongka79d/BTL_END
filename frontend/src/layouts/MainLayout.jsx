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
  Text,
  useAppShellMobile
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  AdminIcon,
  CartIcon,
  HomeIcon,
  LogOutIcon,
  OrdersIcon,
  UserIcon
} from '../components/common/LayoutIcons';

const CustomerAccountMenu = ({ items, user }) => {
  const { isMobile } = useAppShellMobile();
  const accountLabel = user.username || user.email || 'Account';

  return (
    <DropdownMenu
      button={{
        label: accountLabel,
        icon: <Avatar name={accountLabel} size="xsmall" />,
        variant: 'secondary',
        size: 'sm',
        isIconOnly: isMobile,
        tooltip: isMobile ? accountLabel : undefined
      }}
      hasChevron={!isMobile}
      items={items}
    />
  );
};

/**
 * MainLayout component that serves as the page shell for normal customers.
 * It provides top navigation (logo, home, products, user actions, cart) and a footer.
 */
export const MainLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
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
                  top: 'calc(var(--spacing-1) * -1)',
                  right: 'calc(var(--spacing-1) * -1)',
                  paddingInline: 'var(--spacing-1)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {itemCount}
              </Badge>
            </HStack>
          </Link>

          {/* Authentication actions / User Dropdown */}
          {isAuthenticated && user ? (
            <CustomerAccountMenu
              user={user}
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
    <AppShell height="fill" mobileNav={{ breakpoint: 'lg' }} topNav={topNav}>
      <VStack
        style={{
          minHeight: 'calc(100vh - (var(--spacing-8) * 2))',
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
