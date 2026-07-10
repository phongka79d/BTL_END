import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppShell,
  TopNav,
  TopNavHeading,
  Avatar,
  DropdownMenu,
  Icon,
  NavIcon,
  Badge,
  Button,
  IconButton,
  VStack,
  HStack,
  Text,
  useAppShellMobile
} from '@astryxdesign/core';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import StorefrontMegaNav from '../components/layout/StorefrontMegaNav';
import {
  AdminIcon,
  CartIcon,
  LogOutIcon,
  OrdersIcon,
  UserIcon
} from '../components/common/LayoutIcons';

const CustomerAccountMenu = ({ items, user }) => {
  const { isMobile } = useAppShellMobile();
  const accountLabel = user.username || user.email || 'Tài khoản';

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

  // Define dropdown items for logged-in user dynamically based on role
  const getDropdownItems = () => {
    const items = [
      {
        label: 'Hồ sơ',
        onClick: () => navigate('/profile'),
        icon: UserIcon
      }
    ];

    if (!user || user.role === 'customer') {
      items.push({
        label: 'Đơn hàng của tôi',
        onClick: () => navigate('/orders'),
        icon: OrdersIcon
      });
    }

    if (user && user.role === 'admin') {
      items.push({
        label: 'Bảng điều khiển quản trị',
        onClick: () => navigate('/admin'),
        icon: AdminIcon
      });
    }

    items.push({
      label: 'Đăng xuất',
      onClick: logout,
      icon: LogOutIcon
    });

    return items;
  };

  const topNav = (
    <TopNav
      label="Điều hướng cửa hàng tsshop"
      heading={
        <TopNavHeading
          logo={<NavIcon icon={<Icon icon="wrench" size="sm" />} />}
          heading="tsshop"
          headingHref="/"
          as={Link}
        />
      }
      centerContent={
        <HStack gap={1} style={{ alignItems: 'center' }}>
          <StorefrontMegaNav />
        </HStack>
      }
      endContent={
        <HStack gap={3} style={{ alignItems: 'center' }}>
          <IconButton
            label="Tìm kiếm sản phẩm"
            tooltip="Tìm kiếm"
            variant="ghost"
            icon={<Icon icon="search" size="sm" />}
            onClick={() => navigate('/products')}
          />

          {isAuthenticated && user ? (
            <CustomerAccountMenu
              user={user}
              items={getDropdownItems()}
            />
          ) : (
            <Button
              label="Đăng nhập"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            />
          )}

          <Button
            label="Thanh toán"
            variant="primary"
            size="sm"
            icon={<CartIcon />}
            endContent={<Badge label={itemCount} />}
            onClick={() => navigate('/cart')}
          />
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
            © 2026 tsshop. Bảo lưu mọi quyền.
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
              Về chúng tôi
            </Link>
            <Link
              to="/contact"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--text-supporting-size)'
              }}
            >
              Liên hệ
            </Link>
            <Link
              to="/terms"
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--text-supporting-size)'
              }}
            >
              Điều khoản và điều kiện
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </AppShell>
  );
};

export default MainLayout;
