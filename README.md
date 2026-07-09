# tsshop

## Overview

tsshop is a full-stack electronics commerce application. It includes a customer storefront, account and cart flows, cash-on-delivery checkout, product reviews, and an admin console for catalog, user, order, report, and storefront-content management.

The repository is split into two runtime apps:

- `backend/`: Express API with Prisma-backed PostgreSQL persistence, JWT authentication, role checks, email OTP delivery, and transactional domain logic.
- `frontend/`: Vite React application using React Router, Astryx Design System components, context providers, and feature API wrappers.

The frontend talks to the backend through HTTP API clients only. It must not access Prisma, SQL, Supabase, or database credentials directly.

## Stack

- Backend: Node.js, Express 5, Prisma 6, PostgreSQL, bcrypt, JSON Web Tokens, Nodemailer.
- Frontend: React 19, React Router 6, Vite 5, Astryx Design System.
- Persistence: PostgreSQL through Prisma. Supabase may be used as the hosted PostgreSQL provider.
- Payments: cash-on-delivery workflow only; there is no online payment gateway in the current runtime.

## Project Map

### Model

The model layer is the backend persistence boundary. It owns Prisma queries, transactions, and database-facing behavior.

- `backend/prisma/schema.prisma`: canonical database schema, enums, relationships, indexes, and datasource configuration.
- `backend/src/config/database.js`: single shared Prisma client export.
- `backend/src/models/`: model helpers used by controllers.
- `backend/prisma/seed.js`: demo users, categories, and product seed entrypoint.
- `backend/prisma/seedProducts.js`: product seed data.

Important model files:

- `user.model.js`: user lookup, profile updates, admin user management.
- `product.model.js`: product listing, sorting, filtering, and admin catalog mutations.
- `category.model.js`: category reads and admin category mutations.
- `cart.model.js` and `cartItem.model.js`: authenticated cart state and item mutations.
- `order.model.js`: checkout transaction, order listing, status changes.
- `payment.model.js`: COD payment records and paid-state updates.
- `review.model.js`: customer product reviews and admin moderation visibility.
- `report.model.js`: revenue, order summary, and best-selling product calculations.
- `passwordChangeOtp.model.js`: hashed OTP storage, invalidation, attempt tracking, and atomic password update.
- `storefrontContent.model.js` and `storefrontFeatured.model.js`: carousel, navigation, settings, and featured products.

### View

The view layer is the route-level React UI under `frontend/src/views/`.

Customer and auth views:

- `HomeView.jsx`
- `ProductListView.jsx`
- `ProductDetailView.jsx`
- `CartView.jsx`
- `CheckoutView.jsx`
- `OrderHistoryView.jsx`
- `OrderDetailView.jsx`
- `ProfileView.jsx`
- `LoginView.jsx`
- `RegisterView.jsx`
- `UnauthorizedView.jsx`

Admin views:

- `AdminDashboardView.jsx`
- `AdminProductView.jsx`
- `AdminCategoryView.jsx`
- `AdminUserView.jsx`
- `AdminOrderView.jsx`
- `AdminReviewView.jsx`
- `ReportView.jsx`
- `AdminStorefrontView.jsx`

Layouts wrap these route views:

- `frontend/src/layouts/MainLayout.jsx`: customer shell with storefront navigation, account menu, cart action, and footer.
- `frontend/src/layouts/AuthLayout.jsx`: login/register shell.
- `frontend/src/layouts/AdminLayout.jsx`: protected admin shell.

### Controller

Controllers are the backend HTTP orchestration layer. They validate request intent, call model helpers, and return responses through the shared response helpers.

- `backend/src/controllers/`: controller modules per feature.
- `backend/src/routes/`: Express route definitions and middleware wiring.
- `backend/src/middlewares/auth.middleware.js`: JWT verification and blocked-user protection.
- `backend/src/middlewares/admin.middleware.js`: admin role guard.
- `backend/src/middlewares/validation.middleware.js`: required-body and opt-in registration password policy validation.
- `backend/src/middlewares/error.middleware.js`: global error formatting.
- `backend/src/utils/response.js`: shared success/error JSON envelope.

Main controller files:

- `auth.controller.js`
- `user.controller.js`
- `product.controller.js`
- `category.controller.js`
- `cart.controller.js`
- `order.controller.js`
- `payment.controller.js`
- `review.controller.js`
- `report.controller.js`
- `storefrontContent.controller.js`

### Component

Reusable frontend UI lives under `frontend/src/components/`.

- `common/`: shared loading, alert/toast bridge, pagination, icons, and formatting helpers.
- `layout/`: storefront mega navigation.
- `home/`: homepage hero, featured products, category and product sections.
- `product/`: product cards, filters, detail media, purchase panel, reviews, and rating badges.
- `cart/`: cart item rows, list, and summary.
- `checkout/`: checkout form, order summary, and success dialog.
- `order/`: order detail panel and status badges.
- `profile/`: account profile and password-change controls.
- `admin/`: admin table, dialogs, forms, pickers, and admin feature components.
- `admin/storefront/`: carousel, navigation, settings, and featured product managers.
- `report/`: report display components.
- `auth/`: forgot-password OTP form.

### UI

Frontend app wiring:

- `frontend/src/main.jsx`: imports Astryx reset/theme CSS and mounts React.
- `frontend/src/App.jsx`: installs router plus auth, cart, and notification providers.
- `frontend/src/routes/AppRoutes.jsx`: route tree and route guards.
- `frontend/src/contexts/AuthContext.jsx`: login/register/logout/session state.
- `frontend/src/contexts/CartContext.jsx`: cart loading and mutation state.
- `frontend/src/contexts/NotificationContext.jsx`: Astryx toast notification system.
- `frontend/src/api/apiClient.js`: shared fetch wrapper with bearer token support.
- `frontend/src/config.js`: reads `VITE_API_BASE_URL`, defaulting to `http://localhost:5000/api`.

## Repository Structure

```text
.
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   |-- seed.js
|   |   `-- seedProducts.js
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   |-- package-lock.json
|   |-- package.json
|   `-- prisma.config.ts
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- layouts/
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- views/
|   |   |-- App.jsx
|   |   |-- config.js
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package-lock.json
|   |-- package.json
|   `-- vite.config.js
|-- AGENTS.md
|-- .gitignore
`-- README.md
```

Use `backend/` for API, persistence, email, and auth behavior. Use `frontend/` for route screens, API calls, state contexts, and Astryx UI. Treat `README.md` and `AGENTS.md` as important onboarding and agent guidance files.

## Backend API

All endpoints are mounted under `/api`. For example, `POST /auth/login` means `POST http://localhost:5000/api/auth/login`.

### Health

- `GET /health`

### Authentication and Users

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password/request-otp`
- `POST /auth/forgot-password/verify-otp`
- `POST /auth/forgot-password/reset`
- `POST /auth/change-password/request-otp` (authenticated)
- `POST /auth/change-password/confirm` (authenticated)
- `GET /users/profile` (authenticated)
- `PUT /users/profile` (authenticated)
- `GET /admin/users` (admin)
- `PUT /admin/users/:id` (admin)
- `PUT /admin/users/:id/role` (admin)
- `PUT /admin/users/:id/block` (admin)

### Products and Categories

- `GET /products`
- `GET /products/:id`
- `POST /admin/products` (admin)
- `PUT /admin/products/:id` (admin)
- `DELETE /admin/products/:id` (admin)
- `GET /categories`
- `POST /admin/categories` (admin)
- `PUT /admin/categories/:id` (admin)
- `DELETE /admin/categories/:id` (admin)

### Cart

- `GET /cart`
- `POST /cart/items`
- `PUT /cart/items/:id`
- `DELETE /cart/items/:id`

Cart endpoints require a valid JWT.

### Orders and COD Payment

- `POST /orders`
- `GET /orders/my-orders`
- `GET /orders/:id`
- `GET /admin/orders` (admin)
- `GET /admin/orders?status=<status>` (admin)
- `PUT /admin/orders/:id/status` (admin)
- `POST /payments/cod`

Order and payment endpoints require authentication. Order detail access is scoped to the order owner or an admin.

### Reviews

- `GET /products/:id/reviews`
- `POST /products/:id/reviews` (authenticated)
- `GET /admin/reviews` (admin)
- `DELETE /admin/reviews/:id` (admin)

Admin review deletion hides a review from public product review results.

### Reports

- `GET /admin/reports/revenue` (admin)
- `GET /admin/reports/best-selling-products` (admin)
- `GET /admin/reports/order-summary` (admin)

Reports are calculated by the backend from completed orders and paid COD payments.

### Storefront Content

- `GET /storefront/carousel`
- `GET /storefront/navigation`
- `GET /storefront/featured-products`
- `GET /admin/storefront/carousel` (admin)
- `POST /admin/storefront/carousel` (admin)
- `PUT /admin/storefront/carousel/:id` (admin)
- `DELETE /admin/storefront/carousel/:id` (admin)
- `GET /admin/storefront/navigation` (admin)
- `POST /admin/storefront/navigation` (admin)
- `PUT /admin/storefront/navigation/:id` (admin)
- `DELETE /admin/storefront/navigation/:id` (admin)
- `GET /admin/storefront/featured-products` (admin)
- `POST /admin/storefront/featured-products` (admin)
- `POST /admin/storefront/featured-products/bulk` (admin)
- `PUT /admin/storefront/featured-products/reorder` (admin)
- `PUT /admin/storefront/featured-products/:id` (admin)
- `DELETE /admin/storefront/featured-products/:id` (admin)
- `PUT /admin/storefront/settings` (admin)

## Frontend Routes

### Public and Customer UI

- `/`
- `/products`
- `/products/:id`
- `/login`
- `/register`
- `/cart` (authenticated)
- `/checkout` (authenticated)
- `/orders` (authenticated)
- `/orders/:id` (authenticated)
- `/profile` (authenticated)
- `/unauthorized`

### Admin UI

- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/users`
- `/admin/orders`
- `/admin/reviews`
- `/admin/reports`
- `/admin/storefront`

Admin routes are behind `AdminRoute` in `frontend/src/routes/AppRoutes.jsx`. Non-admin users are redirected to `/unauthorized`.

## Main Runtime Flows

### Login Session

1. `LoginView.jsx` collects email and password.
2. `frontend/src/api/authApi.js` calls `POST /auth/login` through `apiClient.js`.
3. `auth.controller.js` finds the user and checks the submitted password with `bcrypt.compare`.
4. Blocked users are rejected before a token is issued.
5. Successful login returns a JWT and safe user payload.
6. `AuthContext.jsx` stores the token in `localStorage`.
7. Later API calls attach the token through `apiClient.js`.
8. `auth.middleware.js` verifies the token and loads `req.user` for protected endpoints.

### Profile Change Password with Email OTP

1. The logged-in user opens `/profile`.
2. `ProfileView.jsx` renders `ChangePasswordPanel`.
3. The user enters the current password and clicks `Send OTP`.
4. The frontend calls `POST /auth/change-password/request-otp`.
5. The backend verifies the JWT, reloads the user, rejects blocked users, and checks the current password.
6. The backend generates a six-digit OTP, hashes it, stores it in `PasswordChangeOtp`, invalidates previous active OTPs, and sends the OTP through `email.service.js`.
7. The user enters OTP, new password, and confirmation.
8. The frontend checks the shared password policy and confirmation match.
9. The frontend calls `POST /auth/change-password/confirm`.
10. The backend re-checks current password, validates OTP state and hash, enforces the new-password policy, hashes the new password, and atomically marks the OTP used while updating `User.passwordHash`.
11. If any step fails, the password is not changed.

### Forgot Password with Email OTP

1. The user opens `/login` and clicks `Forgot Password?`.
2. `LoginView.jsx` renders `ForgotPasswordForm`.
3. The user enters an email and clicks `Send OTP`.
4. The frontend validates email format and calls `POST /auth/forgot-password/request-otp`.
5. The backend returns a generic success message for both known and unknown emails.
6. If the account exists and is not blocked, the backend creates and emails a hashed OTP.
7. The user enters the OTP and clicks `Verify OTP`.
8. The frontend calls `POST /auth/forgot-password/verify-otp`.
9. The backend validates OTP existence, expiry, attempts, and hash match.
10. After a valid OTP, the frontend shows new-password and confirmation fields.
11. The frontend checks shared password policy and confirmation match.
12. The frontend calls `POST /auth/forgot-password/reset`.
13. The backend re-validates the OTP and password policy, then atomically updates `User.passwordHash` and marks the OTP used.
14. On success, a toast notification is shown and the user returns to the login form.

### Product Browsing

1. Customer route views call feature API wrappers in `frontend/src/api/`.
2. `apiClient.js` sends requests to `/products`, `/categories`, or `/storefront/*`.
3. Express routes dispatch to controllers.
4. Controllers call model helpers for Prisma reads.
5. Data returns in the shared backend response envelope and is rendered by product/home components.

### Cart and Checkout

1. `CartContext.jsx` loads cart state from `/cart` for authenticated users.
2. Cart UI mutates items through `/cart/items`.
3. Checkout submits `POST /orders`.
4. `order.model.js` creates the order inside a Prisma transaction that also decrements stock, creates a COD payment, and clears the cart.
5. Order history and detail pages read `/orders/my-orders` and `/orders/:id`.
6. Admins can update order status through `/admin/orders/:id/status`.

### Admin Management

1. `AdminRoute` checks authentication and admin role in `frontend/src/routes/AppRoutes.jsx`.
2. Admin pages use feature API wrappers for users, products, categories, orders, reviews, reports, and storefront content.
3. Backend admin endpoints use `protect` and `admin` middleware.
4. Controllers validate request intent and call model helpers.
5. Admin changes are persisted through Prisma and reflected in the admin UI after reload or local state update.

## Database

Primary Prisma models:

- `User`
- `Category`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderDetail`
- `Payment`
- `Review`
- `PasswordChangeOtp`
- `CarouselSlide`
- `StorefrontNavItem`
- `StorefrontSetting`
- `StorefrontFeaturedProduct`

Important behavior:

- User roles are `customer` and `admin`.
- Blocked users cannot log in and cannot keep using protected endpoints with an old token.
- Registration, profile password changes, and forgot-password resets share the password policy: at least 12 characters with uppercase, lowercase, number, and special character.
- Login does not apply the password policy to existing passwords; it only checks the submitted password against the stored hash.
- Password-change and forgot-password OTPs are stored hashed, expire after the configured window, track attempts, and are invalidated after use.
- Checkout is transactional.
- The only payment method currently implemented is COD.
- Completed orders update COD payment state to `paid`.
- Storefront carousel, navigation, and featured products use `isActive` and `sortOrder`.

## Environment Variables

Backend variables in `backend/.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Backend HTTP port. Defaults to `5000`. |
| `DATABASE_URL` | Yes | Prisma runtime PostgreSQL connection string. |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection for Prisma migrations. |
| `JWT_SECRET` | Yes | JWT signing and verification secret. |
| `JWT_EXPIRES_IN` | No | JWT expiration duration. |
| `NODE_ENV` | No | Runtime environment. Production changes OTP email delivery expectations. |
| `PASSWORD_OTP_EXPIRES_MINUTES` | No | OTP lifetime. Defaults to `10`. |
| `PASSWORD_OTP_MAX_ATTEMPTS` | No | Failed OTP attempt limit. Defaults to `5`. |
| `PASSWORD_OTP_DELIVERY_MODE` | No | `console` for local development or `smtp` for email delivery. |
| `SMTP_HOST` | For SMTP | SMTP host. |
| `SMTP_PORT` | For SMTP | SMTP port. Defaults to `587`. |
| `SMTP_USER` | For SMTP | SMTP username. |
| `SMTP_PASS` | For SMTP | SMTP password or app password. |
| `SMTP_FROM` | For SMTP | Sender email address. |

Frontend variables in `frontend/.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | No | Backend API base URL. Defaults to `http://localhost:5000/api`. |

Use `.env.example` files as variable lists only. Never commit real `.env` files, database credentials, JWT secrets, SMTP passwords, or provider keys.

## Setup

Backend install and database preparation:

```powershell
cd backend
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

Frontend install:

```powershell
cd frontend
npm install
```

For local schema development, create migrations with:

```powershell
cd backend
npm run prisma:migrate -- --name <migration-name>
```

## Running the Project

Backend development server:

```powershell
cd backend
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Frontend development server:

```powershell
cd frontend
npm run dev -- --host localhost
```

Vite usually serves:

```text
http://localhost:5173
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Seeded Demo Accounts

`backend/prisma/seed.js` creates demo accounts for local testing:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@example.com` | `customer123` |
| Admin | `admin@example.com` | `admin123` |

These credentials are for local/demo environments only.

## Testing and Validation

Backend schema validation:

```powershell
cd backend
npx prisma validate
```

Focused backend auth test:

```powershell
cd backend
node --test .\src\controllers\auth.controller.test.js
```

Password-change backend tests:

```powershell
cd backend
node --test .\src\utils\otp.test.js
node --test .\src\utils\passwordPolicy.test.js
node --test .\src\middlewares\validation.middleware.test.js
node --test .\src\services\email.service.test.js
node --test .\src\models\passwordChangeOtp.model.test.js
node --test .\src\routes\auth.routes.structure.test.js
node --test .\src\controllers\auth.controller.test.js
```

Forgot-password frontend tests:

```powershell
cd frontend
node --test .\src\api\authApi.structure.test.js
node --test .\src\views\LoginView.structure.test.js
node --test .\src\views\RegisterView.structure.test.js
node --test .\src\utils\passwordPolicy.test.js
node --test .\src\components\auth\ForgotPasswordForm.structure.test.js
node --test .\src\components\profile\ChangePasswordPanel.structure.test.js
```

All backend test files:

```powershell
cd backend
node --test
```

Frontend lint and build:

```powershell
cd frontend
npm run lint
npm run build
```

Focused frontend storefront test:

```powershell
cd frontend
node --test .\src\api\storefrontContentApi.test.js
```

Password-change frontend tests:

```powershell
cd frontend
node --test .\src\api\authApi.structure.test.js
node --test .\src\components\profile\ChangePasswordPanel.structure.test.js
node --test .\src\views\ProfileView.structure.test.js
```

All frontend test files:

```powershell
cd frontend
node --test
```

## Development Notes

- Read `AGENTS.md` before frontend or architecture work. It requires Astryx layout/components for UI work and forbids raw div/Tailwind-style shortcuts in new UI.
- Keep backend changes inside the existing route/controller/model split.
- Keep Prisma usage in `backend/src/models/` or explicitly backend-only services. Do not add Prisma or database access to `frontend/src`.
- Use `backend/src/config/database.js` as the shared Prisma client source.
- Use `frontend/src/api/apiClient.js` plus feature API wrappers for frontend API calls.
- Coordinate auth changes across backend controllers, route middleware, `AuthContext.jsx`, API wrappers, and login/profile UI.
- Coordinate password-policy changes across backend `passwordPolicy.js`, frontend `passwordPolicy.js`, registration, forgot-password, and profile password-change flows.
- Use `NotificationContext.jsx` and the shared toast system for user-facing success/error/warning/info messages.
- Checkout behavior belongs in backend transactions, not frontend-only calculations.
- Report calculations belong in `backend/src/models/report.model.js`.
- Run focused tests first, then broader backend/frontend validation before claiming completion.

## Known Gaps

- `backend/package.json` still has a placeholder `npm test` script; use `node --test` directly.
- The not-found route renders placeholder-level UI.
- Runtime database checks require a private backend `.env` and a reachable PostgreSQL database.
- Browser walkthrough validation requires both servers, seed data, and valid accounts.
- SMTP OTP delivery requires real SMTP environment variables; console delivery is for local development.
- Online payment, shipping-provider integration, Supabase Auth, direct frontend database access, and realtime features are not implemented in the current runtime source.
