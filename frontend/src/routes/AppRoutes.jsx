import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

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

/**
 * Lớp bảo vệ route cho người dùng đã xác thực (Customer/Admin).
 * Chuyển hướng đến /login nếu người dùng chưa xác thực.
 */
export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
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
    return (
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
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

/**
 * Lớp bảo vệ route chỉ dành cho người dùng chưa xác thực (ví dụ các trang login, register).
 * Chuyển hướng người dùng đã xác thực đến đường dẫn trang chủ/dashboard của họ.
 */
export const PublicOnlyRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
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

