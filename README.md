# tsshop

## Overview

tsshop is a full-stack electronics storefront. Customers browse products, manage a JWT-backed account and cart, place cash-on-delivery orders, review products, and update their profile. Administrators manage catalog data, users, orders, reviews, reports, and storefront content.

The repository has two independently runnable applications. backend/ is the Express API and owns authentication, authorization, Prisma access, transactions, password-OTP email delivery, and PostgreSQL writes. frontend/ is the Vite + React single-page application and owns browser state, route screens, and HTTP calls to the API.

## Stack

- Backend: Node.js, Express 5, Prisma 6, PostgreSQL, bcrypt, JSON Web Tokens, and Nodemailer.
- Frontend: React 19, React Router 6, Vite 5, and Astryx Design System.
- Persistence: PostgreSQL through Prisma. Supabase may provide hosted PostgreSQL, but this runtime does not use Supabase Auth or a frontend database client.
- Payments: cash on delivery (COD) only; no online payment provider is implemented.

## Project Map

### Model

backend/prisma/schema.prisma is the database contract: models, enums, relations, indexes, and connection variables. backend/prisma/migrations/ contains applied migrations, while seed.js and seedProducts.js provide local demo data.

backend/src/models/ is the persistence boundary and uses the shared Prisma client from backend/src/config/database.js. Product models implement details, filters, pagination, ratings, and catalog mutations. Cart/order models own cart mutation and transactional checkout. passwordChangeOtp.model.js stores hashed OTPs, invalidates active codes, tracks attempts, and atomically consumes an OTP when changing a password. Storefront models manage carousel, navigation, settings, and featured products.

### View

Route-level React UI is under frontend/src/views/. Customer and guest screens cover home, product list/detail, cart, checkout, order history/detail, profile, login, registration, and unauthorized access. frontend/src/views/admin/ contains catalog, category, user, order, review, report, and storefront-management views. frontend/src/layouts/MainLayout.jsx, AuthLayout.jsx, and AdminLayout.jsx provide the route shells.

### Controller

backend/src/controllers/ is the HTTP orchestration layer. Controllers validate request intent, call models, and use backend/src/utils/response.js for the shared JSON envelope.

backend/src/routes/ defines paths and attaches protect, admin, or validation middleware. auth.middleware.js verifies JWTs, reloads users, and rejects blocked accounts; admin.middleware.js requires the admin role. email.service.js delivers password OTPs to the console locally or through SMTP.

### Component

frontend/src/components/ is grouped by feature:

- admin/ and admin/storefront/: management tables, forms, dialogs, pickers, and storefront controls.
- auth/ and profile/: forgot-password and authenticated password-change controls.
- home/, product/, cart/, checkout/, order/, and report/: customer and reporting components.
- common/: feedback, loading, pagination, formatting, and layout helpers.
- layout/StorefrontMegaNav.jsx and storefront/: API-backed navigation and link resolution.

### UI

- frontend/src/main.jsx loads Astryx CSS and mounts React.
- frontend/src/App.jsx installs BrowserRouter, then auth, cart, and notification providers.
- frontend/src/routes/AppRoutes.jsx declares public, authenticated, guest-only, and administrator route guards.
- frontend/src/contexts/AuthContext.jsx persists a token in localStorage and re-validates it through the auth profile endpoint.
- frontend/src/contexts/CartContext.jsx owns authenticated cart loading and mutations.
- frontend/src/api/apiClient.js is the shared fetch wrapper used by feature clients in frontend/src/api/.
- frontend/src/config.js reads VITE_API_BASE_URL and defaults to http://localhost:5000/api.

## Repository Structure

~~~text
.
+-- backend/       Express API, Prisma schema/migrations, seed data
|   +-- prisma/    Database schema, migrations, and seed scripts
|   +-- src/       Controllers, models, routes, middleware, services, utilities
|   +-- .env.example
|   +-- package.json
|   +-- prisma.config.ts
+-- frontend/      Vite React application
|   +-- src/       Views, routes, contexts, components, and API clients
|   +-- .env.example
|   +-- package.json
|   +-- vite.config.js
+-- docs/          Runbooks, database notes, plans, tasks, reports, and reviews
+-- scripts/       Reserved script area; no tracked scripts
+-- scratch/       Reserved local area; no tracked files
+-- AGENTS.md      Project and Astryx contributor guidance
+-- .gitignore
+-- README.md
~~~

The main runtime source of truth is backend/src/app.js, backend/src/routes/, backend/prisma/schema.prisma, frontend/src/routes/AppRoutes.jsx, and frontend/src/api/. docs/plans/, docs/tasks/, docs/reports/, and docs/review/ are process artifacts, not proof of current runtime behavior.

## Backend API

All application endpoints use the /api prefix and shared success/error response helpers. Protected endpoints require an Authorization bearer token.

### Health

- GET /api/health

The health response includes process uptime and a timestamp. It does not test database connectivity.

### Authentication and Users

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (authenticated)
- POST /api/auth/forgot-password/request-otp
- POST /api/auth/forgot-password/verify-otp
- POST /api/auth/forgot-password/reset
- POST /api/auth/change-password/request-otp (authenticated)
- POST /api/auth/change-password/confirm (authenticated)
- GET and PUT /api/users/profile (authenticated)
- GET /api/admin/users (admin)
- PUT /api/admin/users/:id, /:id/role, and /:id/block (admin)

Registration and password replacement apply the password policy. Login verifies bcrypt hashes and rejects blocked accounts. Protected middleware reloads users, so blocking also prevents use of an existing token.

### Products and Categories

- GET /api/products and /api/products/:id
- POST, PUT, DELETE /api/admin/products and /api/admin/products/:id (admin)
- GET /api/categories
- POST, PUT, DELETE /api/admin/categories and /api/admin/categories/:id (admin)

The product model provides filtering and pagination; frontend API wrappers expose this to views.

### Cart

- GET /api/cart (authenticated)
- POST /api/cart/items (authenticated)
- PUT and DELETE /api/cart/items/:id (authenticated)

### Orders and COD Payment

- POST /api/orders (authenticated)
- GET /api/orders/my-orders and /api/orders/:id (authenticated; detail is owner/admin scoped)
- GET /api/admin/orders and PUT /api/admin/orders/:id/status (admin)
- POST /api/payments/cod (authenticated)

Checkout validates stock, creates order details and a COD payment, adjusts stock, and clears the cart in one Prisma transaction.

### Reviews

- GET and POST /api/products/:id/reviews; POST is authenticated.
- GET /api/admin/reviews and DELETE /api/admin/reviews/:id (admin).

The admin delete path hides a review from public results; there is no public delete route.

### Reports

- GET /api/admin/reports/revenue
- GET /api/admin/reports/best-selling-products
- GET /api/admin/reports/order-summary

All report endpoints require admin access. Calculations are Prisma aggregations in the backend.

### Storefront Content

- GET /api/storefront/carousel, /navigation, and /featured-products.
- Admin CRUD paths exist for /api/admin/storefront/carousel and /navigation.
- Admin listing, creation, bulk creation, reordering, update, and deletion paths exist for /api/admin/storefront/featured-products.
- PUT /api/admin/storefront/settings updates storefront settings.

Carousel and navigation entries can target products, categories, or custom URLs. Public queries return active content in configured order.

## Frontend Routes

### Public and Customer UI

- /
- /products and /products/:id
- /login and /register (guest-only)
- /cart, /checkout, /orders, /orders/:id, and /profile (authenticated)
- /unauthorized

MainLayout wraps customer routes. PrivateRoute redirects users without a verified session to /login. PublicOnlyRoute redirects authenticated customers to / and administrators to /admin.

### Admin UI

- /admin
- /admin/products
- /admin/categories
- /admin/users
- /admin/orders
- /admin/reviews
- /admin/reports
- /admin/storefront

AdminRoute and AdminLayout protect these routes. Authenticated non-admin users are redirected to /unauthorized.

## Main Runtime Flows

### Login Session

1. LoginView calls frontend/src/api/authApi.js.
2. The login controller verifies the bcrypt hash and blocks denied accounts before token issuance.
3. AuthContext stores the returned token in localStorage.
4. apiClient attaches the bearer token to later requests.
5. App load calls /api/auth/me; failed verification clears the stored token.
6. protect verifies the token, reloads the user, and rejects invalid, missing, deleted, or blocked accounts.

### Profile Change Password with Email OTP

1. ProfileView renders ChangePasswordPanel.
2. The user submits their current password to the authenticated OTP request endpoint.
3. The backend verifies the account/current password, creates a six-digit OTP, persists its hash, and sends it through email.service.js.
4. The confirm endpoint rechecks the current password, new-password policy, expiry, attempts, and OTP hash.
5. It atomically updates the password and consumes the OTP. Any failed check leaves the password unchanged.

### Forgot Password with Email OTP

1. LoginView switches to ForgotPasswordForm.
2. The request endpoint returns a generic result whether or not an eligible account exists.
3. An existing unblocked account receives a hashed OTP through the same persistence and delivery service.
4. The form verifies the code, then submits the confirmed new password.
5. The reset endpoint revalidates the OTP and policy before atomically replacing the password and consuming the code.

### Product Browsing

1. Home, listing, and detail views call feature API wrappers.
2. apiClient requests product, category, review, and storefront endpoints.
3. Express routes dispatch to controllers; controllers call Prisma-backed models.
4. Components render the API response.

### Cart and Checkout

1. CartContext loads /api/cart after authentication.
2. Cart UI mutates items through the cart API wrapper.
3. CheckoutView validates shipping address and submits POST /api/orders.
4. order.model.js performs transactional stock, order, COD payment, and cart-clearing work.
5. Customer history/detail and admin order views read the corresponding API paths.

### Admin Management

1. AdminRoute confirms the client role.
2. Admin views call feature API wrappers for users, catalog, orders, reviews, reports, and storefront content.
3. Routes apply protect and admin middleware.
4. Controllers delegate persistence and aggregation to models; views refresh state after mutation.

## Database

backend/prisma/schema.prisma defines PostgreSQL models for User, PasswordChangeOtp, Category, Product, Cart, CartItem, Order, OrderDetail, Payment, Review, CarouselSlide, StorefrontNavItem, StorefrontSetting, and StorefrontFeaturedProduct.

Roles are customer and admin. Password and OTP hashes are persisted rather than clear-text values. The PasswordChangeOtp model serves both password-change and forgot-password flows. COD is the implemented payment method. Storefront data uses activation and sort-order fields; its targets can be catalog records or custom URLs.

## Environment Variables

Create local .env files from the examples. Do not commit connection URLs, JWT secrets, SMTP credentials, or provider keys.

| Variable | Required | Purpose |
| --- | --- | --- |
| PORT | No | HTTP port; defaults to 5000. |
| DATABASE_URL | Yes | Prisma PostgreSQL connection. |
| DIRECT_URL | Required for the schema direct connection | Direct PostgreSQL connection for Prisma. |
| JWT_SECRET | Yes | JWT signing and verification. |
| JWT_EXPIRES_IN | No | Token lifetime. |
| NODE_ENV | No | Enables production OTP-delivery requirements. |
| PASSWORD_OTP_EXPIRES_MINUTES | No | OTP lifetime; example is 10. |
| PASSWORD_OTP_MAX_ATTEMPTS | No | Failed-code limit; example is 5. |
| PASSWORD_OTP_DELIVERY_MODE | Local optional; SMTP in production | Console or SMTP delivery. |
| SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM | For SMTP | SMTP transport configuration. |
| VITE_API_BASE_URL | Frontend optional | API base URL; defaults to http://localhost:5000/api. |

## Setup

Prerequisites: Node.js, npm, and a PostgreSQL database reachable from backend/. Configure backend/.env before Prisma commands.

~~~powershell
cd backend
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed

cd ..\frontend
npm install
~~~

For local schema development:

~~~powershell
cd backend
npm run prisma:migrate -- --name <migration-name>
~~~

migrate deploy applies existing migrations; migrate dev can create new migrations. Do not run either against a database you do not intend to modify.

## Running the Project

Start the API:

~~~powershell
cd backend
npm run dev
~~~

It listens on http://localhost:5000 unless PORT changes it. Confirm startup at http://localhost:5000/api/health.

Start the frontend in a second terminal:

~~~powershell
cd frontend
npm run dev
~~~

Vite prints the browser URL. The default API URL is http://localhost:5000/api.

## Seeded Demo Accounts

backend/prisma/seed.js upserts one administrator and one customer, four electronics categories, and representative products. Account identities are visible in the seed source (admin@example.com and customer@example.com); this README intentionally does not repeat seed passwords. Use the seed only for disposable development data.

## Testing and Validation

The repository currently contains 24 backend and 41 frontend Node test files. Many are focused unit or structure tests with mocked dependencies.

~~~powershell
cd backend
node --test
npx prisma validate

cd ..\frontend
node --test
npm run build
~~~

frontend/package.json defines npm run lint, but no frontend ESLint configuration is tracked. A failure caused by missing configuration is a repository setup gap, not a code-quality result.

Use docs/api-testing.md for API requests and docs/demo-checklist.md for the recorded customer/admin demo flow.

## Development Notes

- Read AGENTS.md first, especially the Astryx discovery workflow and UI restrictions.
- Trace changes through React view/component -> feature API wrapper -> Express route -> controller -> model -> Prisma schema/migration.
- Reuse apiClient.js, response helpers, middleware, and model modules rather than adding parallel paths.
- Authentication changes normally coordinate auth.controller.js, auth.routes.js, authApi.js, AuthContext.jsx, affected UI, and tests. Keep blocked-user checks in login and protected middleware.
- Schema changes require a migration, client regeneration, and seed/model/controller caller checks.
- Preserve transactional boundaries for checkout, payment, stock, and password/OTP operations.
- For UI work, inspect Astryx with npx astryx build, npx astryx template, and npx astryx component before adding markup; keep styling token-based.
- Ignore generated folders, logs, and local .env files. Do not edit plans/reports to make runtime work appear complete.
- Validate affected tests, npx prisma validate for schema work, and npm run build for frontend work.

## Known Gaps

- No root-level command installs, runs, tests, or builds both applications.
- backend npm test is a placeholder; use node --test directly.
- The frontend lint script exists without tracked ESLint configuration.
- /api/health reports process state only, not database, migration, or SMTP health.
- Console OTP delivery is local-development only; production requires SMTP.
- Tracked runtime files show no online payment integration, upload subsystem, background worker, CI workflow, or production deployment configuration.
- docs/ includes historical plans and reports that can lag behind runtime code; prefer current source files for behavior.
