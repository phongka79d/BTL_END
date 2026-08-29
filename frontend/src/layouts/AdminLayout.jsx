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
import { PERMISSIONS } from '../constants/permissions';
import {
  AdminIcon,
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
 * Thành phần AdminLayout đóng vai trò khung trang cho các trang quản trị.
 * Thành phần cung cấp thanh bên có thể thu gọn (SideNav) với các liên kết quản lý và thanh điều hướng trên đơn giản.
 */
export const AdminLayout = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canAccessStaff = hasPermission(PERMISSIONS.ORDERS_VIEW_ALL);

  const sidebar = (
    <SideNav
      collapsible
      header={
        <SideNavHeading
          logo={<Icon icon="wrench" color="accent" />}
          heading="Trang quản trị"
          headingHref="/admin"
          as={Link}
        />
      }
      footerIcons={
        <DropdownMenu
          button={{
            icon: <Avatar name={user?.username || 'Quản trị viên'} size="xsmall" />,
            label: user?.username || 'Quản trị viên',
            variant: 'secondary',
            size: 'sm'
          }}
          items={[
            ...(canAccessStaff
              ? [
                  {
                    label: 'Khu vực Vận hành (Staff)',
                    onClick: () => navigate('/staff'),
                    icon: DashboardIcon
                  }
                ]
              : []),
            {
              label: 'Quay lại cửa hàng',
              onClick: () => navigate('/'),
              icon: HomeIcon
            },
            {
              label: 'Hồ sơ',
              onClick: () => navigate('/profile'),
              icon: UserIcon
            },
            {
              label: 'Đăng xuất',
              onClick: logout,
              icon: LogOutIcon
            }
          ]}
        />
      }
    >
      <SideNavSection title="Quản lý">
        <SideNavItem
          label="Bảng điều khiển"
          href="/admin"
          icon={<DashboardIcon />}
          as={Link}
          isSelected={location.pathname === '/admin'}
        />
        <SideNavItem
          label="Sản phẩm"
          href="/admin/products"
          icon={<ProductsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/products')}
        />
        <SideNavItem
          label="Danh mục"
          href="/admin/categories"
          icon={<CategoriesIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/categories')}
        />
        <SideNavItem
          label="Người dùng"
          href="/admin/users"
          icon={<UsersIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/users')}
        />
        <SideNavItem
          label="Đơn hàng"
          href="/admin/orders"
          icon={<OrderBagIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/orders')}
        />
        <SideNavItem
          label="Đánh giá"
          href="/admin/reviews"
          icon={<ReviewsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/reviews')}
        />
        <SideNavItem
          label="Báo cáo"
          href="/admin/reports"
          icon={<ReportsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/reports')}
        />
        <SideNavItem
          label="Cửa hàng"
          href="/admin/storefront"
          icon={<AdminIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/admin/storefront')}
        />
      </SideNavSection>
    </SideNav>
  );

  const topNav = (
    <TopNav
      heading={<TopNavHeading heading="Bảng điều khiển quản trị" />}
      endContent={
        <HStack gap={2}>
          <Button
            label="Xem cửa hàng"
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
