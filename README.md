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

## Implemented Frontend Views & Layouts

The application implements a multi-role web interface utilizing the Astryx Design System:

- **Main Layout (Customer Layout):** Provides main user shell with top navigation bar, TechMart logo, search placeholder, cart badge, and dynamic user dropdown.
- **Auth Layout (Centered Card):** Center-aligned card shell wrapping login and registration panels.
- **Admin Layout (Console Layout):** Collapsible dashboard sidebar layout mapping management sections (Dashboard, Products, Categories, Users, Orders, Reviews, Reports).
- **Views:**
  - `HomeView`: Main customer landing page featuring a welcome hero panel and categories layout.
  - `LoginView`: Auth login form with email/password validation, inline errors, and loading states.
  - `RegisterView`: Detailed profile signup form supporting field validation and shipping address text area.
  - `AdminDashboardView`: Administrative statistics panels for sales and inventory tracking.

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

## Phase 2 Handoff Contract

Phase 2 should build product, category, and cart behavior on top of the existing foundation. It must consume these Plan 1 artifacts instead of redefining them:

- `backend/src/config/database.js` - the single runtime Prisma client export.
- `backend/prisma/schema.prisma` - model names, field names, relationships, and enum values.
- `backend/src/utils/response.js` - shared JSON success/error response helpers.
- `backend/src/middlewares/auth.middleware.js` and `backend/src/middlewares/admin.middleware.js` - auth/admin route protection.
- `frontend/src/contexts/AuthContext.jsx` - frontend auth state and auth actions.
- `frontend/src/api/apiClient.js`, `frontend/src/api/authApi.js`, and `frontend/src/api/userApi.js` - frontend API helper pattern using `VITE_API_BASE_URL`.
- `frontend/src/main.jsx` and installed `@astryxdesign/core` - Astryx reset/style setup.

Phase 2 must not rename database fields or enum values without a documented migration, create second database/response/JWT helpers, use Supabase Auth, or let React connect directly to Supabase PostgreSQL.
