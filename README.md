# tsshop

## Overview

tsshop is a full-stack electronics e-commerce app for browsing products, managing a cart, completing cash-on-delivery checkout, submitting reviews, and managing store data from an admin panel.

Runtime parts:

- `backend/`: Express API, Prisma models, PostgreSQL persistence, JWT auth, admin authorization.
- `frontend/`: Vite React app with customer pages, admin pages, shared API clients, and Astryx UI components.
- Database: PostgreSQL through Prisma. Supabase can provide the hosted PostgreSQL database.

The frontend only talks to the backend API. It does not use Prisma, SQL, or Supabase directly.

## Stack

- Backend: Node.js, Express 5, Prisma 6, bcrypt, JWT
- Frontend: React 19, React Router 6, Vite 5, Astryx Design System
- Database: PostgreSQL
- Payment mode: simulated cash on delivery only

## Project Map

### Model

- `backend/prisma/schema.prisma`: database schema, enums, relations, indexes, datasource config.
- `backend/src/models/`: Prisma query helpers and transactions.
- `backend/src/config/database.js`: shared `PrismaClient` instance.
- `backend/prisma/seed.js`: demo users, categories, and products.
- `backend/prisma/seedProducts.js`: product seed dataset.

Main model files:

- `user.model.js`
- `product.model.js`
- `category.model.js`
- `cart.model.js`
- `order.model.js`
- `payment.model.js`
- `review.model.js`
- `report.model.js`
- `passwordChangeOtp.model.js`
- `storefrontContent.model.js`
- `storefrontFeatured.model.js`

### View

- `frontend/src/views/`: route-level React screens.
- `frontend/src/views/admin/`: admin screens.
- `frontend/src/layouts/MainLayout.jsx`: customer storefront shell.
- `frontend/src/layouts/AuthLayout.jsx`: login/register shell.
- `frontend/src/layouts/AdminLayout.jsx`: admin console shell.

Customer views:

- `HomeView.jsx`
- `ProductListView.jsx`
- `ProductDetailView.jsx`
- `CartView.jsx`
- `CheckoutView.jsx`
- `OrderHistoryView.jsx`
- `OrderDetailView.jsx`
- `LoginView.jsx`
- `RegisterView.jsx`

Admin views:

- `AdminDashboardView.jsx`
- `AdminProductView.jsx`
- `AdminCategoryView.jsx`
- `AdminUserView.jsx`
- `AdminOrderView.jsx`
- `AdminReviewView.jsx`
- `ReportView.jsx`
- `AdminStorefrontView.jsx`

### Controller

- `backend/src/controllers/`: HTTP input validation, model orchestration, response shaping.
- `backend/src/routes/`: endpoint declarations and middleware wiring.
- `backend/src/middlewares/auth.middleware.js`: JWT authentication.
- `backend/src/middlewares/admin.middleware.js`: admin-only access guard.
- `backend/src/middlewares/error.middleware.js`: global error response handler.
- `backend/src/utils/response.js`: shared success/error response format.

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

- `frontend/src/components/common/`: shared alerts, loading states, pagination, formatting, icons.
- `frontend/src/components/layout/`: storefront navigation.
- `frontend/src/components/home/`: homepage hero, featured products, category showcase, all-products section.
- `frontend/src/components/product/`: product cards, filters, reviews, purchase panel, detail media.
- `frontend/src/components/cart/`: cart item list, cart item, cart summary.
- `frontend/src/components/checkout/`: checkout form, order summary, success dialog.
- `frontend/src/components/order/`: order detail panel and status badges.
- `frontend/src/components/profile/`: account security controls.
- `frontend/src/components/admin/`: reusable admin table/forms/dialogs.
- `frontend/src/components/admin/storefront/`: carousel, navigation, featured-product admin controls.
- `frontend/src/components/report/`: revenue, order summary, and best-selling-product report components.

### UI

- `frontend/src/main.jsx`: imports Astryx reset/theme CSS and mounts React.
- `frontend/src/App.jsx`: installs router, auth context, and cart context.
- `frontend/src/routes/AppRoutes.jsx`: customer, auth, and admin route tree.
- `frontend/src/contexts/AuthContext.jsx`: login/register/logout/session state.
- `frontend/src/contexts/CartContext.jsx`: cart loading and mutation state.
- `frontend/src/api/apiClient.js`: shared fetch wrapper with bearer token support.
- `frontend/src/config.js`: reads `VITE_API_BASE_URL`, defaulting to `http://localhost:5000/api`.

## Repository Structure

```text
.
|-- backend/
|   |-- prisma/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   |-- package.json
|   `-- prisma.config.ts
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- layouts/
|   |   |-- routes/
|   |   |-- views/
|   |   |-- App.jsx
|   |   |-- config.js
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.js
|-- .gitignore
`-- README.md
```

## Backend API

All endpoints below are mounted under `/api`. For example, `POST /auth/login` means `POST http://localhost:5000/api/auth/login`.

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
- `GET /users/profile`
- `PUT /users/profile`
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

Cart endpoints require authentication.

### Orders and COD Payment

- `POST /orders`
- `GET /orders/my-orders`
- `GET /orders/:id`
- `GET /admin/orders` (admin)
- `GET /admin/orders?status=<status>` (admin)
- `PUT /admin/orders/:id/status` (admin)
- `POST /payments/cod`

Order and payment endpoints require authentication. Order detail access is owner/admin scoped.

### Reviews

- `GET /products/:id/reviews`
- `POST /products/:id/reviews`
- `GET /admin/reviews` (admin)
- `DELETE /admin/reviews/:id` (admin)

Admin review delete hides a review from public results.

### Reports

- `GET /admin/reports/revenue` (admin)
- `GET /admin/reports/best-selling-products` (admin)
- `GET /admin/reports/order-summary` (admin)

Reports are calculated from completed orders with paid COD payments.

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

Admin routes require an authenticated admin user.

## Main Runtime Flows

### Login Session

1. UI calls `frontend/src/api/authApi.js`.
2. `apiClient.js` sends JSON requests to the backend.
3. `auth.controller.js` validates credentials and returns a JWT.
4. `AuthContext.jsx` stores the token in `localStorage`.
5. `apiClient.js` attaches the token to protected requests.
6. `auth.middleware.js` verifies the token and loads `req.user`.

### Profile Change Password with Email OTP

1. The authenticated user opens `/profile`.
2. `ProfileView.jsx` renders `ChangePasswordPanel`.
3. The user enters their current password and clicks `Send OTP`.
4. The frontend calls `POST /auth/change-password/request-otp`.
5. `protect` verifies the JWT and blocks unauthenticated or blocked users.
6. `auth.controller.js` reloads the user and verifies the current password with bcrypt.
7. The backend generates a six-digit OTP, stores only the hashed OTP in `PasswordChangeOtp`, invalidates previous active OTPs for the user, and sends the OTP email.
8. The user enters OTP, new password, and new password confirmation.
9. The frontend checks the shared password policy and confirms that the new password and confirmation match before submitting.
10. The frontend calls `POST /auth/change-password/confirm`.
11. The backend re-verifies the current password, validates the shared password policy, validates OTP existence, expiry, attempts, and hash match, then updates `User.passwordHash` and marks the OTP used in one Prisma transaction.
12. If any check fails, the backend returns an error and does not update `User.passwordHash`.

### Forgot Password with Email OTP

1. The user opens the login page and clicks `Forgot Password?`.
2. `LoginView.jsx` swaps to `ForgotPasswordForm`.
3. The user enters an email address and clicks `Send OTP`.
4. The frontend validates the email format and calls `POST /auth/forgot-password/request-otp`.
5. The backend looks up the email. If an unblocked account exists, it generates a six-digit OTP, stores only the hashed OTP in `PasswordChangeOtp`, invalidates previous unused OTPs for that user, and sends the OTP email.
6. The request endpoint returns the same success message whether or not an account exists, so it does not reveal registered emails.
7. The user enters the OTP and clicks `Verify OTP`.
8. The frontend calls `POST /auth/forgot-password/verify-otp`.
9. The backend validates OTP existence, expiry, attempt count, and hash match. Invalid OTPs increment the attempt counter. Expired or over-attempt OTPs are invalidated.
10. After a valid OTP, the frontend shows `New Password` and `Confirm New Password`.
11. The frontend checks the shared password policy, confirms that both password fields match, and calls `POST /auth/forgot-password/reset`.
12. The backend re-validates the OTP, password policy, and password confirmation, then updates `User.passwordHash` and marks the OTP used in one Prisma transaction.
13. If any check fails, the backend returns an error and does not update `User.passwordHash`.
14. After success, the frontend shows a toast notification and returns the user to the normal login form.

### Product Browsing

1. UI routes render `ProductListView.jsx`, `ProductDetailView.jsx`, or `HomeView.jsx`.
2. API wrappers call `/products`, `/categories`, or `/storefront/*`.
3. Backend routes call controllers.
4. Controllers call Prisma model helpers.
5. Responses return through the shared response envelope.

### Cart and Checkout

1. `CartContext.jsx` loads the authenticated cart from `/cart`.
2. Cart views mutate items through `/cart/items`.
3. Checkout submits `POST /orders`.
4. `order.model.js` runs one Prisma transaction for order creation, stock decrement, COD payment creation, and cart clearing.
5. Order history/detail pages read `/orders/my-orders` and `/orders/:id`.

### Admin Management

1. `AdminRoute` in `AppRoutes.jsx` checks auth and admin role.
2. Admin pages call feature API wrappers.
3. Backend admin endpoints use `protect` and `admin` middleware.
4. Admin writes update products, categories, users, orders, reviews, reports, and storefront content through model helpers.

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
- Blocked users cannot log in or continue using protected endpoints.
- Checkout is transactional.
- Payment method is COD only.
- Completed orders update COD payment status to `paid`.
- Storefront carousel, navigation, and featured products use `isActive` and `sortOrder`.
- Registration, profile password changes, and forgot-password resets all use the shared password policy: at least 12 characters with uppercase, lowercase, number, and special character.
- Login does not apply the password policy to existing passwords; it only verifies the submitted password against the stored hash.
- Password changes require a valid logged-in JWT, current password verification, a valid unexpired email OTP, shared password policy validation, and matching new password confirmation.
- Password-change OTPs are hashed, expire after the configured window, track failed attempts, and are invalidated after use.

## Environment Variables

Backend variables in `backend/.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Backend HTTP port. Defaults to `5000`. |
| `DATABASE_URL` | Yes | Prisma runtime PostgreSQL connection. |
| `DIRECT_URL` | Yes | Prisma direct PostgreSQL connection for migrations. |
| `JWT_SECRET` | Yes | JWT signing and verification secret. |
| `JWT_EXPIRES_IN` | No | JWT expiration. |
| `NODE_ENV` | No | Node environment. |
| `PASSWORD_OTP_EXPIRES_MINUTES` | No | Password-change OTP lifetime. Defaults to `10`. |
| `PASSWORD_OTP_MAX_ATTEMPTS` | No | Maximum failed OTP attempts before invalidation. Defaults to `5`. |
| `PASSWORD_OTP_DELIVERY_MODE` | No | `console` for local development or `smtp` for real email delivery. |
| `SMTP_HOST` | For SMTP | SMTP host for password-change OTP email. |
| `SMTP_PORT` | For SMTP | SMTP port. Defaults to `587`. |
| `SMTP_USER` | For SMTP | SMTP username. |
| `SMTP_PASS` | For SMTP | SMTP password. |
| `SMTP_FROM` | For SMTP | Sender address for OTP emails. |

Frontend variables in `frontend/.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | No | Backend API base URL. Defaults to `http://localhost:5000/api`. |

Use the tracked `.env.example` files as variable lists. Do not commit real `.env` files, database passwords, JWT secrets, or live credentials.

## Setup

Backend:

```powershell
cd backend
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

Frontend:

```powershell
cd frontend
npm install
```

For local schema development:

```powershell
cd backend
npm run prisma:migrate -- --name <migration-name>
```

## Running the Project

Backend:

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

Frontend:

```powershell
cd frontend
npm run dev -- --host localhost
```

Vite usually serves:

```text
http://localhost:5173
```

Frontend build:

```powershell
cd frontend
npm run build
```

## Seeded Demo Accounts

`backend/prisma/seed.js` creates demo-only accounts:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@example.com` | `customer123` |
| Admin | `admin@example.com` | `admin123` |

Do not reuse these credentials outside local/demo environments.

## Testing and Validation

Backend schema validation:

```powershell
cd backend
npx prisma validate
```

Focused backend test:

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
Get-ChildItem .\src, .\prisma -Recurse -Filter *.test.js | ForEach-Object { node --test $_.FullName }
```

Frontend lint and build:

```powershell
cd frontend
npm run lint
npm run build
```

Focused frontend test:

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
Get-ChildItem .\src -Recurse -Filter *.test.js | ForEach-Object { node --test $_.FullName }
```

## Development Notes

- Backend behavior should stay in the route/controller/model split.
- Prisma access should go through `backend/src/models/` and the shared client in `backend/src/config/database.js`.
- Frontend API calls should go through `frontend/src/api/apiClient.js` and feature-specific API wrappers.
- Frontend state should stay in `AuthContext.jsx` and `CartContext.jsx` where applicable.
- Route changes belong in `frontend/src/routes/AppRoutes.jsx`.
- Do not add direct database, Prisma, or Supabase access to `frontend/src`.
- Report calculations belong in `backend/src/models/report.model.js`, not in the frontend.
- Checkout stock, order, payment, and cart-clearing behavior belongs in the backend transaction.

## Known Gaps

- `backend/package.json` still has a placeholder `npm test` script, so use `node --test` directly.
- `/unauthorized` and not-found UI are placeholder-level screens.
- Runtime database checks require a configured private backend `.env` and reachable PostgreSQL database.
- Browser walkthrough checks require both servers, seed data, and valid login flow.
- There is no online payment gateway, shipping-provider integration, Supabase Auth, direct frontend database access, or realtime feature in the current runtime source.
