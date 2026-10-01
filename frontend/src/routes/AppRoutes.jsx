import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';
import { canAccessStaffArea } from '../constants/permissions';
import { canAccessStaffRoute } from './staffRoutePermissions';
// Nhập các giao diện
import HomeView from '../views/HomeView';
import LoginView from '../views/LoginView';
import RegisterView from '../views/RegisterView';
import ProductListView from '../views/ProductListView';
import ProductDetailView from '../views/ProductDetailView';
import CartView from '../views/CartView';
import AdminDashboardView from '../views/AdminDashboardView';
import AdminProductView from '../views/admin/AdminProductView';
import AdminCategoryView from '../views/admin/AdminCategoryView';
import AdminUserView from '../views/admin/AdminUserView';
import AdminOrderView from '../views/admin/AdminOrderView';
import AdminReviewView from '../views/admin/AdminReviewView';
import ReportView from '../views/admin/ReportView';
import AdminStorefrontView from '../views/admin/AdminStorefrontView';
import CheckoutView from '../views/CheckoutView';
import OrderHistoryView from '../views/OrderHistoryView';
import OrderDetailView from '../views/OrderDetailView';
import ProfileView from '../views/ProfileView';
import UnauthorizedView from '../views/UnauthorizedView';
import NotFoundView from '../views/NotFoundView';

// Nhập các giao diện khu vực nhân viên vận hành
import StaffDashboardView from '../views/staff/StaffDashboardView';
import StaffOrderView from '../views/staff/StaffOrderView';
import StaffInventoryView from '../views/staff/StaffInventoryView';
import StaffReviewView from '../views/staff/StaffReviewView';
import StaffReportView from '../views/staff/StaffReportView';

/**
 * Khối hiển thị trong lúc chờ trạng thái xác thực của các route guard.
 */
const RouteLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--color-text-secondary, #666)'
  }}>
    Đang tải...
  </div>
);

/**
 * Lớp bảo vệ route cho người dùng đã xác thực (Customer/Admin).
 * Chuyển hướng đến /login nếu người dùng chưa xác thực.
 */
export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * Lớp bảo vệ route chỉ dành cho người dùng admin.
 * Chuyển hướng đến /login nếu chưa xác thực hoặc /unauthorized nếu đã xác thực nhưng không phải admin.
 */
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

/**
 * Lớp bảo vệ khu vực vận hành (/staff) dành cho nhân viên vận hành hoặc admin.
 * Chỉ cần một capability vận hành bất kỳ (ví dụ PRODUCTS_UPDATE_STOCK của trang tồn kho),
 * không phụ thuộc riêng ORDERS_VIEW_ALL; từng trang con được kiểm tra riêng
 * bằng StaffCapabilityRoute. Chuyển hướng đến /login nếu chưa xác thực
 * hoặc /unauthorized nếu không có quyền vận hành.
 */
export const StaffRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return canAccessStaffArea(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

/**
 * Lớp bảo vệ route theo capability riêng của từng trang vận hành.
 * Chuyển hướng đến /login nếu chưa xác thực hoặc /unauthorized nếu thiếu capability.
 * @param {Object} props
 * @param {string} props.routeKey - Khóa trang trong STAFF_ROUTE_CAPABILITIES
 */
export const StaffCapabilityRoute = ({ routeKey }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return canAccessStaffRoute(user?.role, routeKey) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

/**
 * Lớp bảo vệ route chỉ dành cho người dùng chưa xác thực (ví dụ các trang login, register).
 * Chuyển hướng người dùng đã xác thực đến đường dẫn trang chủ/dashboard của họ.
 */
export const PublicOnlyRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
};

/**
 * Thành phần AppRoutes
 * Thiết lập cây routing bằng React Router v6.
 * Lưu ý: Các giao diện thực tế được ánh xạ động. Các task liên quan sẽ import giao diện thật.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Khu vực khách hàng: được bọc trong MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeView />} />
        <Route path="/products" element={<ProductListView />} />
        <Route path="/products/:id" element={<ProductDetailView />} />
        <Route path="/unauthorized" element={<UnauthorizedView />} />

        {/* Các route khách hàng được bảo vệ bên trong MainLayout */}
        <Route element={<PrivateRoute />}>
          <Route path="/cart" element={<CartView />} />
          <Route path="/checkout" element={<CheckoutView />} />
          <Route path="/orders" element={<OrderHistoryView />} />
          <Route path="/orders/:id" element={<OrderDetailView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Route>

        <Route path="*" element={<NotFoundView />} />
      </Route>

        {/* Các route chỉ dành cho khách: được bọc trong AuthLayout */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
        </Route>
      </Route>

      {/* Khu vực dành cho nhân viên vận hành: được bọc trong StaffLayout */}
      <Route element={<StaffRoute />}>
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<StaffDashboardView />} />
          <Route element={<StaffCapabilityRoute routeKey="orders" />}>
            <Route path="/staff/orders" element={<StaffOrderView />} />
          </Route>
          <Route element={<StaffCapabilityRoute routeKey="inventory" />}>
            <Route path="/staff/inventory" element={<StaffInventoryView />} />
          </Route>
          <Route element={<StaffCapabilityRoute routeKey="reviews" />}>
            <Route path="/staff/reviews" element={<StaffReviewView />} />
          </Route>
          <Route element={<StaffCapabilityRoute routeKey="reports" />}>
            <Route path="/staff/reports" element={<StaffReportView />} />
          </Route>
        </Route>
      </Route>

      {/* Khu vực chỉ dành cho admin: được bọc trong AdminLayout */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardView />} />
          <Route path="/admin/products" element={<AdminProductView />} />
          <Route path="/admin/categories" element={<AdminCategoryView />} />
          <Route path="/admin/users" element={<AdminUserView />} />
          <Route path="/admin/orders" element={<AdminOrderView />} />
          <Route path="/admin/reviews" element={<AdminReviewView />} />
          <Route path="/admin/reports" element={<ReportView />} />
          <Route path="/admin/storefront" element={<AdminStorefrontView />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;

