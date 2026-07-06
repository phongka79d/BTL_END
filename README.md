# TechMart Electronics E-Commerce

TechMart is a course-project e-commerce application for browsing electronics, managing a cart, completing cash-on-delivery (COD) checkout, reviewing products, managing store data, and viewing basic sales reports.

## MVC Architecture

- **Model:** Prisma modules in `backend/src/models` own PostgreSQL queries, transactions, and report aggregation.
- **View:** React pages and components in `frontend/src` render UI states, collect input, and call the REST API. The frontend does not access PostgreSQL directly.
- **Controller:** Express controllers in `backend/src/controllers` validate HTTP input, call model helpers, and return the shared JSON response format.
- **Routes and middleware:** Express routes map API endpoints to controllers. JWT authentication and admin authorization are enforced by reusable middleware.

Supabase is used only as the hosted PostgreSQL provider. The project does not use Supabase Auth, direct browser database access, Edge Functions, online payment, shipping-provider integration, or realtime features.

## Technology Stack

- Frontend: React 19, React Router 6, Vite 5, Astryx Design System
- Backend: Node.js, Express 5, Prisma 6
- Database: Supabase PostgreSQL
- Authentication: JSON Web Tokens and bcrypt password hashing
- Payments: simulated cash on delivery only

## Prerequisites

- Node.js and npm
- A Supabase project with a PostgreSQL database
- Connection strings for Prisma runtime and migrations

## Supabase PostgreSQL Setup

1. Create a Supabase project.
2. In Supabase project settings, copy the PostgreSQL transaction/pooler connection string for `DATABASE_URL` and the direct connection string for `DIRECT_URL`.
3. Copy `backend/.env.example` to `backend/.env` and replace only the placeholders locally.
4. Apply the tracked Prisma migration and seed the demo data using the backend commands below.
5. Optionally confirm the resulting tables and rows in Supabase Table Editor.

Keep `backend/.env` private. Never commit database passwords, JWT secrets, or real account credentials.

## Environment Variables

Backend (`backend/.env`):

```dotenv
PORT=5000
DATABASE_URL=postgres://[user]:[password]@[host]:[port]/[database]
DIRECT_URL=postgres://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Frontend (`frontend/.env`):

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

The examples contain placeholders only. Use the tracked `.env.example` files as the canonical variable lists.

## Install and Run

Backend:

```powershell
cd backend
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

The backend runs at `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

Frontend, in a second terminal:

```powershell
cd frontend
npm install
npm run dev -- --host localhost
```

Open the localhost URL printed by Vite (normally `http://localhost:5173`).

For local schema development, use `npm run prisma:migrate -- --name <migration-name>` instead of `prisma migrate deploy`.

## Seeded Demo Accounts

These credentials are demo-only values verified in the tracked `backend/prisma/seed.js` file:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@example.com` | `customer123` |
| Admin | `admin@example.com` | `admin123` |

Do not reuse these passwords outside local/course demonstration environments.

## Implemented Features

Customer and public features:

- Registration, login, current-user lookup, and profile update
- Product listing, filters, product detail, and categories
- Authenticated cart add, quantity update, removal, stock validation, and backend subtotal
- COD checkout with transactional order, order-detail, payment, stock, and cart updates
- Customer order history and owned-order detail
- Public visible-review listing and authenticated 1-5 rating submission

Admin features:

- User listing
- Product and category management
- Order listing, detail, status filtering, and status updates
- Product review moderation by hiding reviews from public results
- Dashboard and reports for paid-COD revenue, best-selling products, and order-status totals

Frontend routes include `/`, `/login`, `/register`, `/products`, `/products/:id`, `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/reviews`, and `/admin/reports`. Customer and admin routes use the existing authentication/role guards.

## API Groups

All endpoints are under `/api`.

### Health

- `GET /health`

### Authentication and Users

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /users/profile`
- `PUT /users/profile`
- `GET /admin/users` (admin)

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
- `PUT /admin/orders/:id/status` (admin)
- `POST /payments/cod`

Order and payment endpoints require authentication. Order detail access is owner/admin scoped.

### Reviews

- `GET /products/:id/reviews`
- `POST /products/:id/reviews` (authenticated)
- `DELETE /admin/reviews/:id` (admin; hides the review)

### Reports

- `GET /admin/reports/revenue`
- `GET /admin/reports/best-selling-products`
- `GET /admin/reports/order-summary`

Report endpoints require an admin JWT. Revenue and best-selling calculations include completed orders with paid COD payments only.

## Verification Status and Known Manual Checks

- Phase 4 review APIs/UI and admin report APIs/UI are implemented and backed by focused tests, full frontend tests, production builds, API smoke checks, and recorded manual browser evidence.
- The responsive repair checks for the authenticated header, customer order table, login, product detail scrolling, empty cart, and admin order table passed at the requested tablet/mobile sizes; desktop regression also passed. This evidence was supplied manually by the user on 2026-07-06.
- Supabase Table Editor visual confirmation remains a user-side check when dashboard access is unavailable to the agent. API smoke checks have verified database-backed order, order-detail, payment, review, and report behavior.
- Final demo, database-design/ERD, API-testing, and presentation artifacts are maintained separately under `docs/`; their unchecked items must not be treated as completed runtime behavior.

## Validation Commands

```powershell
cd backend
npx prisma validate
```

```powershell
cd frontend
npm run lint
npm run build
```

Focused backend and frontend test files use Node's built-in test runner where present:

```powershell
node --test <path-to-test-file>
```
