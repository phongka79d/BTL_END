import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// View Imports
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

/**
 * Route guard for authenticated users (Customer/Admin).
 * Redirects to /login if the user is not authenticated.
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
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * Route guard for admin users only.
 * Redirects to /login if not authenticated, or /unauthorized if authenticated but not an admin.
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
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

/**
 * Route guard for unauthenticated users only (e.g. login, register pages).
 * Redirects authenticated users to their home/dashboard path.
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
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  }

  return <Outlet />;
};

/**
 * AppRoutes Component
 * Sets up the routing tree using React Router v6.
 * Note: Actual views are mapped dynamically. Sibling tasks will import real views.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Area: Wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeView />} />
        <Route path="/products" element={<ProductListView />} />
        <Route path="/products/:id" element={<ProductDetailView />} />
        <Route path="/unauthorized" element={<UnauthorizedView />} />

        {/* Protected Customer Routes inside MainLayout */}
        <Route element={<PrivateRoute />}>
          <Route path="/cart" element={<CartView />} />
          <Route path="/checkout" element={<CheckoutView />} />
          <Route path="/orders" element={<OrderHistoryView />} />
          <Route path="/orders/:id" element={<OrderDetailView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Route>

        {/* Fallback inside MainLayout */}
        <Route path="*" element={<div>Page Not Found (Placeholder)</div>} />
      </Route>

      {/* Guest Only Routes: Wrapped in AuthLayout */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
        </Route>
      </Route>

      {/* Admin Only Area: Wrapped in AdminLayout */}
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

