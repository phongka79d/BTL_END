# Frontend Application - tsshop Web SPA

## Overview

The `frontend/` directory contains the Single Page Application (SPA) for the **tsshop** electronics e-commerce storefront. It is built with **React 19**, **React Router 6**, and **Vite 5**, and styled using the **Astryx Design System** (`@astryxdesign/core`).

The frontend delivers an intuitive user experience for shoppers, operations staff, and administrators:
- **Shoppers:** Discover products via the dynamic mega-menu and homepage carousel, search and filter the catalog, view rich product details and ratings, manage their shopping cart, complete checkout with Cash on Delivery (COD), track past orders, manage profile details, and securely reset/change passwords via email OTPs.
- **Operations Staff:** Access a dedicated operations workspace (`/staff/*`) to fulfill orders, monitor and adjust stock levels, moderate reviews, and inspect operational fulfillment reports.
- **Administrators:** Access a dedicated administrative workspace (`/admin/*`) to manage products, categories, user accounts and roles (`customer` / `staff` / `admin`), access blocking, order status transitions, review moderation, business analytics reports, and storefront content (carousel, navigation tree, and featured products).
- **Backend API Documentation:** [../backend/README.md](../backend/README.md)
- **Root Repository Overview:** [../README.md](../README.md)

---

## Technology Stack

- **Framework:** [React 19](https://react.dev/) (`^19.2.7`) with `react-dom` (`^19.2.7`)
- **Routing:** [React Router 6](https://reactrouter.com/) (`^6.22.3`)
- **Build Tool & Dev Server:** [Vite 5](https://vitejs.dev/) (`^5.2.0`)
- **Design System & Styling:** `@astryxdesign/core` (`^0.1.2`)
- **Code Quality:** [ESLint](https://eslint.org/) (`^8.57.0`)
- **State Management:** React Context API (`AuthContext`, `CartContext`, `NotificationContext`)
- **HTTP Client:** Native `fetch` with centralized interceptor in `src/api/apiClient.js`

---

## Directory Structure

```text
frontend/
├── src/
│   ├── api/                     # Centralized API service modules
│   │   ├── apiClient.js         # Base fetch wrapper with auth header injection & error handling
│   │   ├── authApi.js           # Login, registration, OTP request/verify/reset, getMe
│   │   ├── cartApi.js           # Cart retrieval, item addition, updates, deletion
│   │   ├── categoryApi.js       # Category queries and admin category CRUD
│   │   ├── orderApi.js          # Checkout, customer orders, admin order management
│   │   ├── paymentApi.js        # COD payment trigger
│   │   ├── productApi.js        # Product queries, search/filter, admin catalog CRUD
│   │   ├── reportApi.js         # Revenue, best-sellers, order summary reports
│   │   ├── reviewApi.js         # Product reviews, submission, admin moderation
│   │   └── userApi.js           # Profile updates, admin user listing, roles, account blocking
│   ├── components/              # Modular UI components grouped by feature
│   │   ├── admin/               # Management forms, tables, dialogs, and pickers
│   │   │   ├── storefront/      # Carousel, navigation, and featured product management
│   │   │   │   ├── CarouselSlideForm.jsx
│   │   │   │   ├── CarouselSlideTable.jsx
│   │   │   │   ├── FeaturedProductBulkPicker.jsx
│   │   │   │   ├── FeaturedProductManager.jsx
│   │   │   │   ├── LinkTargetFields.jsx
│   │   │   │   ├── NavigationItemForm.jsx
│   │   │   │   ├── NavigationItemTable.jsx
│   │   │   │   └── storefrontFormUtils.js
│   │   │   ├── AdminOrderDetailDialog.jsx
│   │   │   ├── AdminTable.jsx
│   │   │   ├── CategoryForm.jsx
│   │   │   ├── CategoryTable.jsx
│   │   │   ├── OrderStatusSelect.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductPicker.jsx
│   │   │   ├── ProductTable.jsx
│   │   │   ├── UserManagementTable.jsx
│   │   │   ├── UserProfileDialog.jsx
│   │   │   ├── categoryFormUtils.js
│   │   │   └── productFormUtils.js
│   │   ├── auth/                # Authentication forms
│   │   │   └── ForgotPasswordForm.jsx
│   │   ├── cart/                # Shopping cart components
│   │   │   ├── CartItem.jsx
│   │   │   ├── CartItemList.jsx
│   │   │   └── CartSummary.jsx
│   │   ├── checkout/            # Checkout workflow components
│   │   │   ├── CheckoutForm.jsx
│   │   │   ├── CheckoutOrderSummary.jsx
│   │   │   └── CheckoutSuccessDialog.jsx
│   │   ├── common/              # Reusable UI primitives and utilities
│   │   │   ├── Alert.jsx
│   │   │   ├── Can.jsx          # Declarative permission/role guard
│   │   │   ├── ConfirmationDialog.jsx # Standard confirmation modal
│   │   │   ├── DataTable.jsx    # Standardized data table with skeleton & empty states
│   │   │   ├── Drawer.jsx       # Slide-over side panel
│   │   │   ├── EmptyState.jsx   # Cohesive empty state container
│   │   │   ├── FilterBar.jsx    # Unified search & filter toolbar
│   │   │   ├── formatDate.js
│   │   │   ├── LayoutIcons.jsx
│   │   │   ├── LoadingSkeleton.jsx # Skeleton loaders (table, card grid, detail)
│   │   │   ├── PageHeader.jsx   # Standardized page header with breadcrumb & actions
│   │   │   ├── Pagination.jsx
│   │   │   ├── StatCard.jsx     # Metric KPI card
│   │   │   └── StatusBadge.jsx  # Standardized semantic status badge
│   │   ├── home/                # Homepage sections
│   │   │   ├── HomeAllProductsSection.jsx
│   │   │   ├── HomeCategoryShowcase.jsx
│   │   │   └── HomeHero.jsx
│   │   ├── order/               # Order display components
│   │   │   ├── OrderDetailPanel.jsx
│   │   │   ├── OrderStatusBadge.jsx
│   │   │   └── PaymentStatusBadge.jsx
│   │   ├── product/             # Product catalog components
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductDetailMedia.jsx
│   │   │   ├── ProductFilter.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductPurchasePanel.jsx
│   │   │   ├── ProductReviewForm.jsx
│   │   │   ├── ProductReviewList.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── productUtils.js
│   │   ├── profile/             # Profile management components
│   │   │   └── ChangePasswordPanel.jsx
│   │   ├── report/              # Admin reporting widgets
│   │   │   ├── BestSellingProductsTable.jsx
│   │   │   ├── OrderSummaryCards.jsx
│   │   │   └── RevenueSummaryCard.jsx
│   │   └── storefront/          # Storefront navigation link utilities
│   │       └── storefrontLinkUtils.js
│   ├── constants/               # Application-wide constants & permissions
│   │   ├── orderConstants.js    # Order status definitions, labels, and badge colors
│   │   └── permissions.js       # Centralized capability definitions matching backend
│   ├── contexts/                # Global state providers
│   │   ├── AuthContext.jsx      # Authentication state, token sync, user session
│   │   ├── CartContext.jsx      # Cart items, total count, sync with backend
│   │   └── NotificationContext.jsx # Toast messages and system alerts
│   ├── layouts/                 # Page layout shells
│   │   ├── AdminLayout.jsx      # Admin sidebar, header, and management content shell
│   │   ├── AuthLayout.jsx       # Centered card layout for login and registration
│   │   ├── MainLayout.jsx       # Public storefront layout with Staff & Admin header tabs
│   │   └── StaffLayout.jsx      # Staff operational workspace sidebar and header
│   ├── routes/                  # Route definitions and route guards
│   │   └── AppRoutes.jsx        # Route registry with PrivateRoute, AdminRoute, PublicOnlyRoute
│   ├── utils/                   # Helper functions and business logic
│   │   └── passwordPolicy.js    # Client-side password validation matching backend policy
│   ├── views/                   # Route page components
│   │   ├── admin/               # Admin workspace views
│   │   │   ├── AdminCategoryView.jsx
│   │   │   ├── AdminOrderView.jsx
│   │   │   ├── AdminProductView.jsx
│   │   │   ├── AdminReviewView.jsx
│   │   │   ├── AdminStorefrontView.jsx
│   │   │   ├── AdminUserView.jsx
│   │   │   └── ReportView.jsx
│   │   ├── staff/               # Operations staff views
│   │   │   ├── StaffDashboardView.jsx
│   │   │   ├── StaffInventoryView.jsx
│   │   │   ├── StaffOrderView.jsx
│   │   │   ├── StaffReportView.jsx
│   │   │   └── StaffReviewView.jsx
│   │   ├── AdminDashboardView.jsx
│   │   ├── NotFoundView.jsx
│   │   ├── OrderDetailView.jsx
│   │   ├── OrderHistoryView.jsx
│   │   ├── ProductDetailView.jsx
│   │   ├── ProductListView.jsx
│   │   ├── ProfileView.jsx
│   │   ├── RegisterView.jsx
│   │   └── UnauthorizedView.jsx
│   ├── App.jsx                  # Root component wiring router and context providers
│   ├── config.js                # Environment config (API Base URL resolution)
│   └── main.jsx                 # Application entrypoint importing Astryx styles and mounting React
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── .eslintrc.cjs                # ESLint rules
├── .env.example                 # Frontend environment variables template
└── package.json                 # Project manifest and scripts
```

---

## Routing & Access Control

The routing architecture is declared in `src/routes/AppRoutes.jsx` using React Router v6:

| Path | Layout | Access Guard | View Component | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `MainLayout` | Public | `HomeView` | Homepage with carousel, categories, and featured products |
| `/products` | `MainLayout` | Public | `ProductListView` | Catalog search, category filter, sorting, and pagination |
| `/products/:id`| `MainLayout` | Public | `ProductDetailView` | Product specs, images, inventory, reviews, add-to-cart |
| `/login` | `AuthLayout` | `PublicOnlyRoute` | `LoginView` | Customer & staff/admin login, forgot password OTP flow |
| `/register` | `AuthLayout` | `PublicOnlyRoute` | `RegisterView` | New customer account registration |
| `/cart` | `MainLayout` | `PrivateRoute` | `CartView` | Shopping cart items, quantity modification, price total |
| `/checkout` | `MainLayout` | `PrivateRoute` | `CheckoutView` | Shipping address entry and COD order confirmation |
| `/orders` | `MainLayout` | `PrivateRoute` | `OrderHistoryView` | Customer order history list with status badges |
| `/orders/:id` | `MainLayout` | `PrivateRoute` | `OrderDetailView` | Single order details, line items, and payment status |
| `/profile` | `MainLayout` | `PrivateRoute` | `ProfileView` | User details update and authenticated OTP password change |
| `/staff` | `StaffLayout` | `StaffRoute` | `StaffDashboardView` | Operations dashboard (order backlog, stock alerts, review queue) |
| `/staff/orders` | `StaffLayout` | `StaffRoute` | `StaffOrderView` | Order fulfillment queue and status transitions |
| `/staff/inventory` | `StaffLayout` | `StaffRoute` | `StaffInventoryView` | Fast product stock and inventory adjustment |
| `/staff/reviews` | `StaffLayout` | `StaffRoute` | `StaffReviewView` | Review moderation and hiding inappropriate comments |
| `/staff/reports` | `StaffLayout` | `StaffRoute` | `StaffReportView` | Operational order counts and top product volume |
| `/admin` | `AdminLayout`| `AdminRoute` | `AdminDashboardView` | Admin dashboard overview |
| `/admin/products` | `AdminLayout` | `AdminRoute` | `AdminProductView` | Full product catalog CRUD, pricing, and inventory |
| `/admin/categories` | `AdminLayout` | `AdminRoute` | `AdminCategoryView` | Category hierarchy management |
| `/admin/users` | `AdminLayout` | `AdminRoute` | `AdminUserView` | User list, role management (`customer`/`staff`/`admin`), account blocking |
| `/admin/orders` | `AdminLayout` | `AdminRoute` | `AdminOrderView` | System order monitoring and status transitions |
| `/admin/reviews`| `AdminLayout` | `AdminRoute` | `AdminReviewView` | Product review moderation (hiding inappropriate reviews) |
| `/admin/reports`| `AdminLayout` | `AdminRoute` | `ReportView` | Financial revenue reports and best sellers |
| `/admin/storefront` | `AdminLayout` | `AdminRoute` | `AdminStorefrontView` | Carousel, navigation tree, and featured products |
| `/unauthorized` | `MainLayout` | Public | `UnauthorizedView` | Access denied notification |
| `*` | `MainLayout` | Public | `NotFoundView` | 404 page |

### Route Guards Explained
1. **`PrivateRoute`**: Verifies user authentication. If unauthenticated, redirects to `/login`.
2. **`StaffRoute`**: Verifies that the user has operational capability (`hasPermission(PERMISSIONS.ORDERS_VIEW_ALL)`). Non-staff/customers are redirected to `/unauthorized`.
3. **`AdminRoute`**: Verifies that the user is authenticated and possesses the `admin` role. Non-admins are redirected to `/unauthorized`.
4. **`PublicOnlyRoute`**: Prevents already-logged-in users from visiting `/login` or `/register`, redirecting them to `/admin` or `/` depending on their role.
---

## State Management & Context Architecture

The application uses three React Context providers declared in `src/contexts/`:

1. **`AuthContext` (`src/contexts/AuthContext.jsx`)**
   - Stores JWT token in `localStorage` under key `token`.
   - Fetches and validates current user session via `GET /api/auth/me` on startup.
   - Exposes `user`, `token`, `isAuthenticated`, `isAdmin`, `isStaff`, `isStaffOrAdmin`, `hasPermission(permission)`, `loading`, `login()`, `register()`, `logout()`, and `changePassword()`.
   - Handles automatic logout and state cleanup when a 401/403 or account block is detected.
2. **`CartContext` (`src/contexts/CartContext.jsx`)**
   - Automatically loads the authenticated user's cart from `GET /api/cart`.
   - Exposes `cart`, `cartItems`, `cartCount`, `cartTotal`, `addToCart()`, `updateQuantity()`, `removeFromCart()`, and `clearCart()`.
   - Refreshes cart state after checkout and resets on logout.

3. **`NotificationContext` (`src/contexts/NotificationContext.jsx`)**
   - Provides global alert and toast notifications (`notifySuccess`, `notifyError`, `notifyInfo`, `notifyWarning`).

---

## Environment Configuration

Configure environment variables in `frontend/.env` (see `.env.example`):

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Base URL of the backend REST API |

---

## Setup & Running

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Set VITE_API_BASE_URL if backend runs on a non-default host or port
```

### 3. Start Development Server
```bash
npm run dev
```
The Vite development server will start at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Build artifacts will be emitted to the `frontend/dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

### 6. Linting
```bash
npm run lint
```

---

## Development Notes for AI Agents

1. **Astryx Design System Standards:**
   - Always utilize `@astryxdesign/core` components and style tokens (`style.css` imported in `main.jsx`).
   - Use standard CSS variables for colors (`var(--color-primary)`, `var(--color-text-secondary)`, etc.) to preserve visual consistency.
2. **API Communication:**
   - All network calls must pass through the domain modules in `src/api/` rather than calling raw `fetch()` directly in components.
   - `apiClient.js` automatically attaches `Authorization: Bearer <token>` when a token is present in `localStorage`.
3. **Password Policy Synchronization:**
   - Form validation on password fields must use `src/utils/passwordPolicy.js` to ensure the client-side validation rules match the backend `passwordPolicy.js` contract exactly.
4. **Error & Notification Handling:**
   - Catch API errors and display user-friendly error banners using `NotificationContext` or localized `Alert` components. Avoid unhandled promise rejections.
