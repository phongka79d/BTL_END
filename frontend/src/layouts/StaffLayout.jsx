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
  DashboardIcon,
  OrdersIcon,
  ProductsIcon,
  ReviewsIcon,
  ReportsIcon,
  HomeIcon,
  UserIcon,
  LogOutIcon,
  AdminIcon
} from '../components/common/LayoutIcons';

/**
 * StaffLayout Component - Cổng thông tin vận hành & xử lý đơn hàng chuẩn hóa với AppShell & SideNav của Astryx
 */
export const StaffLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <SideNav
      collapsible
      header={
        <SideNavHeading
          logo={<Icon icon="package" color="accent" />}
          heading="Khu vực Vận hành"
          headingHref="/staff"
          as={Link}
        />
      }
      footerIcons={
        <DropdownMenu
          button={{
            icon: <Avatar name={user?.fullName || user?.username || 'Nhân viên'} size="xsmall" />,
            label: user?.fullName || user?.username || 'Nhân viên',
            variant: 'secondary',
            size: 'sm'
          }}
          items={[
            ...(isAdmin
              ? [
                  {
                    label: 'Khu vực Quản trị (Admin)',
                    onClick: () => navigate('/admin'),
                    icon: AdminIcon
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
              onClick: handleLogout,
              icon: LogOutIcon
            }
          ]}
        />
      }
    >
      <SideNavSection title="Vận hành & Đơn hàng">
        <SideNavItem
          label="Bảng vận hành"
          href="/staff"
          icon={<DashboardIcon />}
          as={Link}
          isSelected={location.pathname === '/staff'}
        />
        <SideNavItem
          label="Xử lý đơn hàng"
          href="/staff/orders"
          icon={<OrdersIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/staff/orders')}
        />
        <SideNavItem
          label="Kiểm kê tồn kho"
          href="/staff/inventory"
          icon={<ProductsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/staff/inventory')}
        />
        <SideNavItem
          label="Kiểm duyệt đánh giá"
          href="/staff/reviews"
          icon={<ReviewsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/staff/reviews')}
        />
        <SideNavItem
          label="Báo cáo vận hành"
          href="/staff/reports"
          icon={<ReportsIcon />}
          as={Link}
          isSelected={location.pathname.startsWith('/staff/reports')}
        />
      </SideNavSection>
    </SideNav>
  );

  const topNav = (
    <TopNav
      heading={<TopNavHeading heading="Cổng thông tin vận hành & xử lý đơn hàng" />}
      endContent={
        <HStack gap={2}>
          <Button
            label="Xem cửa hàng"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
          />
          {isAdmin && (
            <Button
              label="Trang Admin"
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin')}
            />
          )}
        </HStack>
      }
    />
  );

  return (
    <AppShell height="fill" sideNav={sidebar} topNav={topNav}>
      <VStack style={{ height: '100%', padding: 'var(--spacing-6)', overflowY: 'auto', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
        <Outlet />
      </VStack>
    </AppShell>
  );
};

export default StaffLayout;
