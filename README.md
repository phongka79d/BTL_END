# Electronics E-Commerce Project

This is a course-project MVC web application for an electronics e-commerce store.

## Technology Stack

- **Frontend (View):** React, Vite, Astryx
- **Backend (Controller/API):** Express.js, JSON REST
- **Database (Model):** Prisma ORM, Supabase PostgreSQL
- **Auth:** JWT and bcrypt

## Setup Order

1. Setup the backend dependencies and environment variables in `backend/.env`.
2. Run Prisma schema migrations and seed the database.
3. Setup the frontend dependencies and environment variables.
4. Start both development servers.

## Configuration & Environment Variables

### Backend (`backend/.env`)

Create a `backend/.env` file with the following variables:
- `PORT`: Server port (default `5000`)
- `DATABASE_URL`: Supabase transaction connection string
- `DIRECT_URL`: Supabase direct connection string for migrations
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., `7d`)
- `NODE_ENV`: Application environment (`development` or `production`)

### Frontend (`frontend/.env`)

Create a `frontend/.env` file with the following variables:
- `VITE_API_BASE_URL`: Express REST API endpoint URL (default `http://localhost:5000/api`)

## Implemented API Endpoints

All API endpoints are mounted under `/api`:

### Auth APIs
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user and receive JWT
- `GET /api/auth/me` - Get current authenticated user profile (requires JWT)

### User APIs
- `GET /api/users/profile` - Get current user profile (requires JWT)
- `PUT /api/users/profile` - Update current user profile details (requires JWT)
- `GET /api/admin/users` - List all users (requires admin JWT)

### Product Catalog APIs
- `GET /api/products` - List products with search/filters (keyword, categoryId, minPrice, maxPrice) and pagination
- `GET /api/products/:id` - Get product details by ID
- `POST /api/admin/products` - Create a new product (requires admin JWT)
- `PUT /api/admin/products/:id` - Update a product (requires admin JWT)
- `DELETE /api/admin/products/:id` - Delete a product (requires admin JWT)

### Category Catalog APIs
- `GET /api/categories` - List all categories
- `POST /api/admin/categories` - Create a new category (requires admin JWT)
- `PUT /api/admin/categories/:id` - Update a category (requires admin JWT)
- `DELETE /api/admin/categories/:id` - Delete a category (requires admin JWT, blocked if referenced by products)

### Cart APIs
- `GET /api/cart` - Retrieve the user's cart including items, products and backend-calculated subtotal (requires JWT)
- `POST /api/cart/items` - Add a product to the cart, capturing current product price as unitPrice (requires JWT, stock validated)
- `PUT /api/cart/items/:id` - Update cart item quantity (requires JWT, stock validated)
- `DELETE /api/cart/items/:id` - Remove a product from the cart (requires JWT)

### Review APIs
- `GET /api/products/:id/reviews` - List visible reviews for a product, newest first
- `POST /api/products/:id/reviews` - Create a product review with integer rating 1-5 and optional trimmed comment (requires JWT)
- `DELETE /api/admin/reviews/:id` - Hide a review from public listings for admin moderation (requires admin JWT)

### Report APIs
- `GET /api/admin/reports/revenue` - Get revenue and completed-order count from completed orders with paid COD payments (requires admin JWT)
- `GET /api/admin/reports/best-selling-products` - Get the top five products by completed paid-COD sales quantity (requires admin JWT)
- `GET /api/admin/reports/order-summary` - Get order counts by status (requires admin JWT)

## Implemented Frontend Views & Layouts

The application implements a multi-role web interface utilizing the Astryx Design System:

- **Main Layout (Customer Layout):** Provides main user shell with top navigation bar, TechMart logo, search placeholder, cart badge, and dynamic user dropdown.
- **Auth Layout (Centered Card):** Center-aligned card shell wrapping login and registration panels.
- **Admin Layout (Console Layout):** Collapsible dashboard sidebar layout mapping management sections (Dashboard, Products, Categories, Users, Orders, Reviews, Reports).
- **Frontend API Helpers:** `productApi.js`, `categoryApi.js`, `cartApi.js`, and `reviewApi.js` wrap the Express REST endpoints through the shared `apiClient.js`.
- **Cart State:** `CartProvider` and `useCart` load authenticated cart state from the backend, expose cart actions, and provide the navigation badge item count.
- **Phase 2 Routes:** `/products`, `/products/:id`, `/cart`, `/admin/products`, and `/admin/categories` are registered with the existing customer, private, and admin route guards. These views are fully implemented with the customer and admin UI components.
- **Views:**
  - `HomeView`: Main customer landing page featuring a welcome hero panel and categories layout.
  - `ProductListView`: Functional customer product catalog search and filtering view.
  - `ProductDetailView`: Functional customer product detail, cart addition, and product review view.
  - `CartView`: Functional customer cart management view with subtotal and stock validations.
  - `LoginView`: Auth login form with email/password validation, inline errors, and loading states.
  - `RegisterView`: Detailed profile signup form supporting field validation and shipping address text area.
  - `AdminDashboardView`: Administrative statistics panels for sales and inventory tracking.
  - `AdminProductView`: Functional administrative product CRUD management view with form validation.
  - `AdminCategoryView`: Functional administrative category CRUD management view with unique-name and deletion checks.
  - `AdminReviewView`: Administrative review moderation view for hiding visible product reviews.

## Local Commands

### Backend
```bash
cd backend
npm install
npx prisma validate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Plan 1 Verification State

Plan 1 foundation checks are recorded in `docs/demo-checklist.md` and the Batch05 execution/review reports.

- 05A backend checks passed: install, Prisma validate, migration, seed, backend startup, and health check.
- 05B API smoke checks passed: register, login, current user, profile read/update, and admin user authorization.
- 05C frontend command checks passed, and the required auth UI smoke checks have user-provided manual PASS evidence.
- 05D security, MVC boundary, and duplication audit passed.
- Supabase Table Editor visual confirmation is still user-side unless the user has manually confirmed the dashboard view.

## Plan 2 Verification State

Plan 2 product, category, cart, customer UI, admin UI, and handoff checks are recorded in `docs/demo-checklist.md` and the Batch06 execution/review reports.

- 06A backend checks passed: Prisma validation, backend startup, product/category APIs, admin product/category CRUD, admin authorization boundaries, authenticated cart add/update/remove, backend subtotal, above-stock rejection, and unchanged stock after cart operations.
- 06B frontend checks passed: Vite dev startup, homepage, product list states, product detail add-to-cart feedback, customer cart mutation flow, admin product/category pages, responsive product list, and frontend database-access search.
- 06C security, MVC, duplication, scope, and Astryx audit passed. A historical report secret was redacted; rotate that credential if it was ever pushed or shared outside the local repository.
- No Phase 3 checkout, order creation, COD payment, order history, admin order status, report, review, upload, or shipping behavior is implemented by Plan 2.

## Phase 2 Handoff Contract

Phase 2 should build product, category, and cart behavior on top of the existing foundation. It must consume these Plan 1 artifacts instead of redefining them:

- `backend/src/config/database.js` - the single runtime Prisma client export.
- `backend/prisma/schema.prisma` - model names, field names, relationships, and enum values.
- `backend/src/utils/response.js` - shared JSON success/error response helpers.
- `backend/src/middlewares/auth.middleware.js` and `backend/src/middlewares/admin.middleware.js` - auth/admin route protection.
- `frontend/src/contexts/AuthContext.jsx` - frontend auth state and auth actions.
- `frontend/src/api/apiClient.js`, `frontend/src/api/authApi.js`, `frontend/src/api/userApi.js`, `frontend/src/api/productApi.js`, `frontend/src/api/categoryApi.js`, and `frontend/src/api/cartApi.js` - frontend API helper pattern using `VITE_API_BASE_URL`.
- `frontend/src/contexts/CartContext.jsx` - authenticated frontend cart state that consumes backend cart APIs and backend-calculated subtotal/item data.
- `frontend/src/routes/AppRoutes.jsx` and layout route guards - customer, cart, and admin product/category routes for subsequent UI batches.
- `frontend/src/main.jsx` and installed `@astryxdesign/core` - Astryx reset/style setup.

Phase 2 must not rename database fields or enum values without a documented migration, create second database/response/JWT helpers, use Supabase Auth, or let React connect directly to Supabase PostgreSQL.

## Phase 3 Handoff Contract

Phase 3 checkout and order work must consume the verified Phase 2 artifacts instead of redefining product, cart, auth, admin, API, context, route, or layout behavior:

- `backend/src/models/product.model.js` and `backend/src/controllers/product.controller.js` - product lookup, filters, category include behavior, and stock reads.
- `backend/src/models/cart.model.js`, `backend/src/models/cartItem.model.js`, and `backend/src/controllers/cart.controller.js` - authenticated cart ownership, item shape, captured `unitPrice`, quantity validation, and backend subtotal behavior.
- `backend/src/middlewares/auth.middleware.js` - current-user identity for checkout and customer order routes.
- `backend/src/middlewares/admin.middleware.js` - admin-only order management routes.
- `frontend/src/contexts/CartContext.jsx` and `frontend/src/api/cartApi.js` - frontend cart state and cart mutation calls.
- `frontend/src/api/productApi.js`, `frontend/src/api/categoryApi.js`, and `frontend/src/api/apiClient.js` - existing REST helper pattern and API base URL behavior.
- `frontend/src/routes/AppRoutes.jsx`, `frontend/src/layouts/MainLayout.jsx`, and `frontend/src/layouts/AdminLayout.jsx` - existing customer/admin route guard and layout patterns.

Phase 3 constraints:

- Do not reduce stock during cart add/update/remove operations; stock reduction belongs to order creation.
- Do not duplicate cart subtotal logic in the frontend as the source of truth. Use backend cart/order totals.
- Do not create separate checkout-only product queries when existing product model helpers can be reused.
- Do not alter the Phase 1 schema without an explicit migration section and verification of affected Plan 2 APIs.
- Record credential-dependent or user-side live checks as `BLOCKED_BY_USER_ACTION` instead of claiming completion when local `.env`, database, seeded data, credentials, or browser tooling are unavailable.

## Phase 3 Implementation Status

### Completed Batches

- **Batch01 (P3B1): Backend Checkout Transaction Models** — Complete
  - Order checkout transaction helper with atomic Prisma transaction (cart loading, stock validation, backend total calculation, order/detail/payment creation, stock reduction, cart clearing)
  - Customer order read helpers (`listByUser`, `findOwnedOrAdminVisible`) with query-level access filtering
  - Admin order list helper (`listForAdmin`) with optional status filter
  - Order status update helper (`updateStatus`) with completed→paid COD side effects
  - COD payment helper (`createOrGetCODPayment`) with idempotent find-or-create
  - Files: `backend/src/models/order.model.js`, `backend/src/models/payment.model.js`

- **Batch02 (P3B2): Backend Order and Payment APIs** — Complete
  - Order controller: `POST /api/orders` (checkout), `GET /api/orders/my-orders`, `GET /api/orders/:id`
  - Admin order controller: `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status`
  - COD payment controller: `POST /api/payments/cod` (idempotent, owner/admin scoped)
  - Route mounting with auth/admin middleware matching Plan 2 multi-mount patterns
  - Files: `backend/src/controllers/order.controller.js`, `backend/src/controllers/payment.controller.js`, `backend/src/routes/order.routes.js`, `backend/src/routes/payment.routes.js`, `backend/src/routes/index.js`

- **Batch03 (P3B3): Frontend API, Routing, and Cart Refresh** — Complete
  - Frontend order API helpers (`orderApi.js`): checkout, customer reads, admin reads, admin status updates
  - Frontend payment API helper (`paymentApi.js`): explicit COD endpoint
  - Protected routes: `/checkout`, `/orders`, `/orders/:id` (PrivateRoute), `/admin/orders` (AdminRoute)
  - Placeholder views: `CheckoutView`, `OrderHistoryView`, `OrderDetailView`, `AdminOrderView`
  - Shared order/payment status constants (`orderConstants.js`) matching backend Prisma enums
  - Files: `frontend/src/api/orderApi.js`, `frontend/src/api/paymentApi.js`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/constants/orderConstants.js`, `frontend/src/views/CheckoutView.jsx`, `frontend/src/views/OrderHistoryView.jsx`, `frontend/src/views/OrderDetailView.jsx`, `frontend/src/views/admin/AdminOrderView.jsx`

- **Batch04 (P3B4): Customer Checkout and Order UI** — Complete
  - Astryx component discovery and choice mapping for checkout/order views
  - Checkout flow: shipping form, COD payment badge, cart-derived order summary, success dialog with navigation
  - Order history view: paginated table with status badges (order + payment), date/total columns, detail links
  - Order detail view: full order panel with info, shipping, payment, items table, and total sections
  - Reusable `OrderStatusBadge` and `PaymentStatusBadge` components (shared with admin Batch05)
  - Four-state pattern (loading/error/empty/data) on all three customer views
  - Files: `frontend/src/views/CheckoutView.jsx`, `frontend/src/views/OrderHistoryView.jsx`, `frontend/src/views/OrderDetailView.jsx`, `frontend/src/components/checkout/CheckoutForm.jsx`, `frontend/src/components/checkout/CheckoutOrderSummary.jsx`, `frontend/src/components/checkout/CheckoutSuccessDialog.jsx`, `frontend/src/components/order/OrderStatusBadge.jsx`, `frontend/src/components/order/PaymentStatusBadge.jsx`, `frontend/src/components/order/OrderDetailPanel.jsx`

- **Batch05 (P3B5): Admin Order Management UI** — Complete
  - Astryx component discovery and choice mapping for admin order views
  - Admin order table: 7-column table with customer info, order ID, date, total, inline status selector, payment badge, and actions
  - Status filter with client-side pagination
  - Admin order detail dialog: customer metadata card + shared OrderDetailPanel, four-state handling
  - Inline OrderStatusSelect component: calls PUT /api/admin/orders/:id/status, transient success/error feedback
  - Five UI states: loading, empty, error, permission denied, success
  - Files: `frontend/src/views/admin/AdminOrderView.jsx`, `frontend/src/components/admin/AdminOrderDetailDialog.jsx`, `frontend/src/components/admin/OrderStatusSelect.jsx`, `frontend/src/components/common/formatDate.js`

### Verification and Handoff Status

- Batch06 06A backend/API verification passed: Prisma validation, backend startup/health, checkout success, empty-cart failure, insufficient-stock failure, customer order reads, cross-customer denial, admin order reads, admin status updates, completed-to-paid COD behavior, and COD payment idempotency.
- Batch06 06B frontend/UI verification passed with user-provided browser evidence after the checkout navigation fix: customer product/cart/checkout success, order history/detail, route guards, admin order list/detail/status update, completed payment status, and desktop/tablet/mobile usability.
- Batch06 06C security/MVC/scope audit passed: no committed real env files, no frontend direct database access, no duplicate runtime Prisma client/response/JWT helpers, focused order/payment MVC boundaries, Astryx-aligned UI, and no online payment, shipping, review, report, upload, or schema-redesign runtime behavior added in Phase 3.
- Supabase dashboard visual row confirmation for `Order`, `OrderDetail`, and `Payment` remains `BLOCKED_BY_USER_ACTION` unless a user with dashboard access confirms it. API smoke checks already verified database-backed order, detail, and payment creation.

### Phase 4 Handoff Notes

Phase 4 review, moderation, reporting, documentation, and final-demo work must reuse these verified Phase 3 artifacts:

- Order/payment models and records: `backend/src/models/order.model.js`, `backend/src/models/payment.model.js`
- Product/order/payment relationships and enum values: `backend/prisma/schema.prisma`
- Auth and admin access control: `backend/src/middlewares/auth.middleware.js`, `backend/src/middlewares/admin.middleware.js`
- Order/payment APIs and route patterns: `backend/src/controllers/order.controller.js`, `backend/src/controllers/payment.controller.js`, `backend/src/routes/order.routes.js`, `backend/src/routes/payment.routes.js`
- Customer product/review integration surface: `frontend/src/views/ProductDetailView.jsx`
- Customer order UI patterns: `frontend/src/views/CheckoutView.jsx`, `frontend/src/views/OrderHistoryView.jsx`, `frontend/src/views/OrderDetailView.jsx`, `frontend/src/components/order/OrderDetailPanel.jsx`
- Admin layout/table/dialog patterns: `frontend/src/layouts/AdminLayout.jsx`, `frontend/src/views/admin/AdminOrderView.jsx`, `frontend/src/components/admin/AdminOrderDetailDialog.jsx`, `frontend/src/components/admin/OrderStatusSelect.jsx`
- Shared status constants: `frontend/src/constants/orderConstants.js`

Phase 4 constraints:

- Do not recalculate revenue from frontend state; reports must use backend/database order and payment data.
- Do not create duplicate order/payment models or reporting-only schema copies.
- Do not add online payment behavior.
- Do not change checkout transaction behavior unless tests cover the full customer/admin order flow.
- Keep credential-dependent dashboard checks marked `BLOCKED_BY_USER_ACTION` when the agent cannot access the required account or UI.

## Phase 4 Implementation Status

### Completed Batches

- **Batch01 (P4B1): Backend Review APIs** - Complete
  - Review model helpers list only visible reviews newest first, create visible customer reviews, find reviews for moderation, and hide reviews by status.
  - Review controller and routes expose `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews`, and `DELETE /api/admin/reviews/:id`.
  - Review creation requires authentication, validates integer ratings from 1 to 5, trims optional comments, and reuses existing product lookup, response, auth, admin, and Prisma patterns.
  - Backend smoke validation passed for public listing, unauthenticated creation rejection, invalid rating rejection, authenticated creation, customer moderation denial, admin hide behavior, and hidden-review exclusion from public results.
  - The validation smoke created one review row and hid it through the admin API, leaving a hidden validation review row in the connected database.

- **Batch02 (P4B2): Customer Review UI** - Complete
  - Frontend review API helper `frontend/src/api/reviewApi.js` wraps product review list/create calls and the admin hide endpoint through the shared API client.
  - Product detail now loads visible product reviews, shows loading/error/empty/data states, and lets authenticated customer accounts submit ratings with optional comments.
  - Review list and form UI live in focused product components and avoid direct database access or frontend API base URL duplication.
  - Admin Reviews UI is available at `/admin/reviews` behind the existing admin route/layout, lets admins choose a product, view visible reviews, and hide a review from public product detail.
  - Focused review UI tests and the frontend production build passed; user-provided manual evidence confirmed customer review UI checks passed, and browser smoke verified admin hide removes the review from public product detail.

- **Batch03 (P4B3): Backend Report APIs** - Complete
  - Admin-only revenue, best-selling-product, and order-summary endpoints are mounted under `/api/admin/reports`.
  - Report calculations use existing Prisma order, order-detail, payment, and product data; revenue and product sales are filtered to completed orders with paid COD payments.
  - Revenue uses API-safe decimal strings, best-selling products are limited to five, and missing order statuses return zero counts.
  - Prisma validation, focused report tests, live admin/customer/anonymous authorization checks, and independent database-to-API comparisons passed.
