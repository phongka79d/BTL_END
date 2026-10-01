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
import { canAccessStaffArea } from '../constants/permissions';
import StorefrontMegaNav from '../components/layout/StorefrontMegaNav';
import { ResponsiveNavButton } from '../components/common/ResponsiveNavButton';
import {
  AdminIcon,
  CartIcon,
  DashboardIcon,
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
 * Thành phần MainLayout đóng vai trò khung trang cho khách hàng thông thường.
 * Thành phần cung cấp điều hướng trên (logo, trang chủ, sản phẩm, thao tác người dùng, giỏ hàng) và chân trang.
 */
export const MainLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const canAccessStaff = isAuthenticated && canAccessStaffArea(user?.role);
  const canAccessAdmin = isAuthenticated && isAdmin;

  // Xác định động các mục dropdown cho người dùng đang đăng nhập dựa trên role
  const getDropdownItems = () => {
    const items = [
      {
        label: 'Hồ sơ',
        onClick: () => navigate('/profile'),
        icon: UserIcon
      },
      {
        label: 'Đơn hàng của tôi',
        onClick: () => navigate('/orders'),
        icon: OrdersIcon
      }
    ];

    if (canAccessStaff) {
      items.push({
        label: 'Khu vực Vận hành (Staff)',
        onClick: () => navigate('/staff'),
        icon: DashboardIcon
      });
    }

    if (canAccessAdmin) {
      items.push({
        label: 'Bảng điều khiển quản trị (Admin)',
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
        <HStack gap={2} style={{ alignItems: 'center' }}>
          <IconButton
            label="Tìm kiếm sản phẩm"
            tooltip="Tìm kiếm"
            variant="ghost"
            icon={<Icon icon="search" size="sm" />}
            onClick={() => navigate('/products')}
          />

          {/* Staff Tab trực tiếp trên Header */}
          {canAccessStaff && (
            <ResponsiveNavButton
              label="Staff"
              variant="secondary"
              size="sm"
              icon={<DashboardIcon size={14} />}
              onClick={() => navigate('/staff')}
            />
          )}

          {/* Admin Tab trực tiếp trên Header */}
          {canAccessAdmin && (
            <ResponsiveNavButton
              label="Admin"
              variant="secondary"
              size="sm"
              icon={<AdminIcon size={14} />}
              onClick={() => navigate('/admin')}
            />
          )}

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

          <ResponsiveNavButton
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
        {/* Khu vực nội dung chính */}
        <VStack style={{ flex: 1, padding: 'var(--spacing-4)' }}>
          <Outlet />
        </VStack>

        {/* Thành phần chân trang */}
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
          <Text size="supporting" color="secondary">
            Nguồn ảnh sản phẩm:
          </Text>
          <HStack gap={4} style={{ fontSize: 'var(--text-supporting-size)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/products/phones-laptops.json" style={{ color: 'var(--color-text-secondary)' }}>
              Ảnh điện thoại
            </a>
            <a href="/products/watches-accessories.json" style={{ color: 'var(--color-text-secondary)' }}>
              Ảnh đồng hồ và phụ kiện
            </a>
            <a href="/products/linked-phones-laptops.json" style={{ color: 'var(--color-text-secondary)' }}>
              Điện thoại và laptop (URL)
            </a>
            <a href="/products/linked-watches-accessories.json" style={{ color: 'var(--color-text-secondary)' }}>
              Đồng hồ và phụ kiện (URL)
            </a>
          </HStack>
        </VStack>
      </VStack>
    </AppShell>
  );
};

export default MainLayout;
