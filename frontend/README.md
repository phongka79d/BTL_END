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
│   │   ├── apiClient.js         # Base fetch wrapper with auth header injection, cache-bypassing stock reads & error handling
│   │   ├── authApi.js           # Login, registration, OTP request/verify/reset, getMe
│   │   ├── cartApi.js           # Cart retrieval, item addition, updates, deletion
│   │   ├── categoryApi.js       # Category queries and admin category CRUD
│   │   ├── orderApi.js          # Checkout, customer orders, admin order management
│   │   ├── paymentApi.js        # COD payment trigger
│   │   ├── productApi.js        # Product queries, search/filter, no-store stock reads, admin catalog CRUD
│   │   ├── reportApi.js         # Revenue, best-sellers, order summary reports
│   │   ├── reviewApi.js         # Product reviews, submission, admin moderation
│   │   ├── storefrontContentApi.js # Carousel, navigation, and featured product API calls
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
│   │   │   └── checkoutFormUtils.js # Checkout validation and request payload builder
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
│   │   │   ├── PaymentStatusBadge.jsx
│   │   │   └── orderRecipientUtils.js # Recipient snapshot display with profile fallback
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
│   │   ├── orderConstants.js    # Order status definitions, labels, badge colors, and allowed transition map
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
│   │   ├── AppRoutes.jsx        # Route registry with PrivateRoute, StaffRoute, StaffCapabilityRoute, AdminRoute, PublicOnlyRoute
│   │   └── staffRoutePermissions.js # Per-page /staff capability requirements
│   ├── utils/                   # Helper functions and business logic
│   │   ├── cartQuantityDrafts.js # Cart quantity draft parsing (strict integers, no clamping)
│   │   ├── csvExport.js         # Excel-ready UTF-8 (BOM) CSV builder and browser download helper
│   │   ├── excelExport.js       # True XLSX workbook export (Revenue, Order Summary, Best Selling Products)
│   │   ├── passwordPolicy.js    # Client-side password validation matching backend policy
│   │   ├── phoneValidation.js   # Digits-only phone validation (leading zeros preserved)
│   │   └── quantityValidation.js # Inventory/purchase quantity validators (reject, never clamp)
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
| `/orders/:id` | `MainLayout` | `PrivateRoute` | `OrderDetailView` | Single order details, line items, payment status, and customer self-cancel (`Hủy đơn hàng`) while the order is cancellable |
| `/profile` | `MainLayout` | `PrivateRoute` | `ProfileView` | User details update and authenticated OTP password change |
| `/staff` | `StaffLayout` | `StaffRoute` | `StaffDashboardView` | Operations dashboard (order backlog, stock alerts, review queue); any staff-area capability |
| `/staff/orders` | `StaffLayout` | `StaffRoute` + `StaffCapabilityRoute` | `StaffOrderView` | Field-specific order search (ID, customer, delivery address), fulfillment and status transitions; requires `orders.view_all` |
| `/staff/inventory` | `StaffLayout` | `StaffRoute` + `StaffCapabilityRoute` | `StaffInventoryView` | Fast product stock and inventory adjustment (requires `products.update_stock`) |
| `/staff/reviews` | `StaffLayout` | `StaffRoute` + `StaffCapabilityRoute` | `StaffReviewView` | Review moderation and hiding inappropriate comments (requires `reviews.view_all`) |
| `/staff/reports` | `StaffLayout` | `StaffRoute` + `StaffCapabilityRoute` | `StaffReportView` | Operational order counts and top product volume (requires `reports.view_operational`) |
| `/admin` | `AdminLayout`| `AdminRoute` | `AdminDashboardView` | Admin dashboard overview |
| `/admin/products` | `AdminLayout` | `AdminRoute` | `AdminProductView` | Full product catalog CRUD, pricing, and inventory |
| `/admin/categories` | `AdminLayout` | `AdminRoute` | `AdminCategoryView` | Category hierarchy management |
| `/admin/users` | `AdminLayout` | `AdminRoute` | `AdminUserView` | User list, role management (`customer`/`staff`/`admin`), account blocking, and the `UserCreateDialog` account-creation form |
| `/admin/orders` | `AdminLayout` | `AdminRoute` | `AdminOrderView` | Broad order search combined with status and pagination, plus lifecycle-limited status transitions |
| `/admin/reviews`| `AdminLayout` | `AdminRoute` | `AdminReviewView` | Product review moderation (hiding inappropriate reviews) |
| `/admin/reports` | `AdminLayout` | `AdminRoute` | `ReportView` | Date-filtered reports, existing CSV exports, and true three-sheet XLSX export (`utils/excelExport.js`) |
| `/admin/storefront` | `AdminLayout` | `AdminRoute` | `AdminStorefrontView` | Carousel, navigation tree, and featured products |
| `/unauthorized` | `MainLayout` | Public | `UnauthorizedView` | Access denied notification |
| `*` | `MainLayout` | Public | `NotFoundView` | 404 page |

### Route Guards Explained
1. **`PrivateRoute`**: Verifies user authentication. If unauthenticated, redirects to `/login`.
2. **`StaffRoute`**: Entry gate for the operations workspace — verifies the user holds **any** staff-area capability (`constants/permissions.js` → `STAFF_AREA_CAPABILITIES` + `canAccessStaffArea`), so a staff member with only `products.update_stock` can reach `/staff/inventory` without `orders.view_all`. Customers (no capabilities) are redirected to `/unauthorized`.
3. **`StaffCapabilityRoute`**: Per-page capability guard (`routes/staffRoutePermissions.js` → `STAFF_ROUTE_CAPABILITIES` / `canAccessStaffRoute`). Required capabilities: `orders.view_all` for `/staff/orders`, `products.update_stock` for `/staff/inventory`, `reviews.view_all` for `/staff/reviews`, `reports.view_operational` for `/staff/reports`; `/staff` (dashboard) only needs any staff-area capability. Users lacking the capability are redirected to `/unauthorized`; `StaffLayout` uses the same mapping to hide inaccessible navigation items.
4. **`AdminRoute`**: Verifies that the user is authenticated and possesses the `admin` role. Non-admins are redirected to `/unauthorized`.
5. **`PublicOnlyRoute`**: Prevents already-logged-in users from visiting `/login` or `/register`, redirecting them to `/admin` or `/` depending on their role.
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

## Validation & Data Freshness Contracts

Client-side validators mirror the backend rules and **reject invalid input instead of clamping it** (an out-of-range quantity is never silently adjusted).

- **Inventory quantities (`src/utils/quantityValidation.js`):** `validateInventoryQuantity(value)` accepts only non-negative safe integers (including `0`) and returns an error message — or `null` when valid. Empty values, decimals, and negatives are rejected. Used by the admin product form (`components/admin/productFormUtils.js`) to validate the stock field.
- **Purchase quantities:** `validatePurchaseQuantity(value, stock)` rejects non-integers, `< 1`, and `> stock`; `getPurchasableQuantity(value, stock)` returns the numeric quantity or `null` when it cannot be purchased. Used by product detail, cart, and the quantity-draft helpers (`src/utils/cartQuantityDrafts.js`).
- **Phone (`src/utils/phoneValidation.js`):** accepts digits-only strings (`^[0-9]+$`) and is always handled as a string, so leading zeros are preserved (never coerced with `Number()`/`parseInt()`). Empty is allowed for optional profile and admin user edits; checkout requires it. The backend mirrors these rules in `backend/src/utils/phoneValidation.js`.
- **Checkout payload (`src/components/checkout/checkoutFormUtils.js`):** `fullName` (required), `phone` (required, digits-only), `shippingAddress` (required), optional `note`, and optional `cartItemIds` for partial-cart checkout. The created order stores a recipient snapshot (`recipientName`, `recipientPhone`, `note`), so later profile changes never alter an existing order; `orderRecipientUtils.js` falls back to the current profile for orders without a snapshot.
- **Stock freshness:** `apiClient.js` forces `cache: 'no-store'` for `GET /cart`, `GET /products`, and `GET /products/:id`, and the API also sends `Cache-Control: no-store` on those reads, so stock badges and quantities reflect the latest database state. Checkout decrements stock with a conditional `quantity >= ordered` write and responds with HTTP 409 when a concurrent checkout wins the race or the cart changed, rather than overselling.
- **Staff inventory:** `/staff/inventory` requires `products.update_stock`. Stock filters run on the server before pagination (`low`: ≤ 5, including zero; `out`: zero). Zero-stock badges show `Hết hàng (0)`; stock edits accept zero and reject invalid drafts. Load failures keep a visible error and `Thử lại` action until recovery.
- **Order search:** Staff choose ID, customer, or delivery address; Admin search all domains. Typing stays a draft until Enter/Search. Status or field changes reset to page one; pagination retains applied filters. Customer searches include saved recipient name/phone and current customer identity; unknown API `searchField` values return HTTP 400.
- **Checkout success:** guard repeated submissions, refresh the cart, show a global success notification, and replace the route with `/cart`; only checked-out lines are removed during partial-cart checkout.
- **Excel reports:** `Xuất Excel` (`Export Excel`) exports the currently loaded date-filtered data into `Revenue`, `Order Summary`, and `Best Selling Products` sheets with numeric cells and Vietnamese labels. No additional report request is made; absent per-product revenue stays blank rather than being inferred.
- **Product photos:** all 40 seed models have photos: 17 licensed local WebP images and 23 direct manufacturer/retailer links with unverified reuse permission. Empty/broken URLs still use the generic fallback on every product-image surface without retry loops (never unrelated Picsum images). The customer footer links local attribution manifests [`phones-laptops.json`](public/products/phones-laptops.json) and [`watches-accessories.json`](public/products/watches-accessories.json), plus direct-link source manifests [`linked-phones-laptops.json`](public/products/linked-phones-laptops.json) and [`linked-watches-accessories.json`](public/products/linked-watches-accessories.json). Adapted WebP images retain the source license; external URLs depend on third-party availability and are not presented as licensed.
- **Mobile navigation:** `ResponsiveNavButton` keeps accessible names while compacting icon-bearing storefront/Staff shortcuts at the AppShell mobile breakpoint. Staff's long workspace heading becomes `Vận hành`; page titles and all actions remain available. Staff-area visibility uses the same capability helper in storefront/Admin navigation and the Staff route guard.

---

## Environment Configuration

Configure environment variables in `frontend/.env` (see `.env.example`):

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Base URL of the backend REST API |

Local development defaults: Vite serves the SPA on `http://localhost:5173` and the backend API listens on `http://localhost:5000` (CORS is enabled on the Express app), matching both `.env.example` files.

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
4. **Shared Validation Contracts:**
   - `phoneValidation.js` and `quantityValidation.js` must stay synchronized with their backend counterparts in `backend/src/utils/`; invalid values are rejected with a message, never clamped or coerced (phone numbers stay digit-only strings).
   - Keep stock-sensitive reads (`/cart`, `/products`, `/products/:id`) `no-store` in `apiClient.js`/`productApi.js` — stock badges must never render from a stale cached response.
5. **Error & Notification Handling:**
   - Catch API errors and display user-friendly error banners using `NotificationContext` or localized `Alert` components. Avoid unhandled promise rejections.
