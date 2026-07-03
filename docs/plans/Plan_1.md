# Plan 1 - MVC Foundation, Database, and Authentication

## 1. Objective

Build the project foundation for the Electronics E-Commerce Website: root repository structure, React/Vite frontend shell, Express backend shell, Supabase PostgreSQL connection through Prisma, full initial data model, seed data, shared response/error conventions, and JWT authentication.

This phase intentionally finalizes the database schema early so later phases add behavior without changing model shape unless an explicit migration is documented.

## 2. Source of Truth

- `docs/plans/Master_Plan.md` section 1, Project Overview
- `docs/plans/Master_Plan.md` section 2, Technology Stack
- `docs/plans/Master_Plan.md` section 3, Supabase PostgreSQL Usage
- `docs/plans/Master_Plan.md` section 4, MVC Architecture
- `docs/plans/Master_Plan.md` section 8, MVC Folder Structure
- `docs/plans/Master_Plan.md` section 10, Back-end MVC Structure
- `docs/plans/Master_Plan.md` section 11, Database Design
- `docs/plans/Master_Plan.md` section 12, Model Relationships
- `docs/plans/Master_Plan.md` section 13.1, AuthController
- `docs/plans/Master_Plan.md` section 13.2, UserController
- `docs/plans/Master_Plan.md` section 18, Environment Variables
- `docs/plans/Master_Plan.md` section 19, Supabase Setup Checklist
- `docs/plans/Master_Plan.md` section 20, Recommended Commands
- `docs/design/design.md` sections 2, 5, 6, 9, 20, 21, 22 for frontend shell/auth UI constraints

## 3. Prerequisites from Prior Phases

- [ ] None. This is the first implementation phase.
- [ ] A Supabase project can be created or is already available for the team.
- [ ] Node.js and npm are installed locally.
- [ ] The agent implementing this phase has read the root `AGENTS.md` instructions and must follow the reuse, SRP, YAGNI, and Astryx rules.

## 4. Scope

- Create root project structure with `frontend/`, `backend/`, and `docs/`.
- Create Vite React frontend.
- Install and wire Astryx reset/style imports in the frontend entry file.
- Create Express backend with MVC folders: `controllers`, `models`, `routes`, `middlewares`, `config`, and `utils`.
- Use Prisma as the ORM path for this project.
- Configure Supabase PostgreSQL through `DATABASE_URL` and `DIRECT_URL`.
- Define all required Prisma models:
  - `User`
  - `Category`
  - `Product`
  - `Cart`
  - `CartItem`
  - `Order`
  - `OrderDetail`
  - `Payment`
  - `Review`
- Create initial Prisma migration and seed data for demo categories, products, and one admin user.
- Implement authentication and current-user endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Implement user profile endpoints:
  - `GET /api/users/profile`
  - `PUT /api/users/profile`
  - `GET /api/admin/users`
- Implement authentication and admin authorization middleware.
- Implement shared JSON response helper and shared error middleware.
- Create basic customer and admin layout shells plus login/register views wired to the auth APIs.

## 5. Out of Scope

- Product and category CRUD behavior beyond seed data.
- Product list/search/filter/detail pages.
- Cart behavior and cart UI beyond route placeholders.
- Checkout, order, payment, review, and report behavior.
- Real online payment gateway.
- Supabase Auth, Supabase Edge Functions, and direct Supabase calls from React.
- Product image upload or Supabase Storage.
- Advanced dashboard charts, recommendation systems, chatbot, email verification, or forgot-password flow.

## 6. Target Directory Structure

```text
.
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |   |-- authApi.js
|   |   |   `-- userApi.js
|   |   |-- components/
|   |   |   `-- common/
|   |   |-- contexts/
|   |   |   `-- AuthContext.jsx
|   |   |-- layouts/
|   |   |   |-- AdminLayout.jsx
|   |   |   |-- AuthLayout.jsx
|   |   |   `-- MainLayout.jsx
|   |   |-- routes/
|   |   |   `-- AppRoutes.jsx
|   |   |-- views/
|   |   |   |-- HomeView.jsx
|   |   |   |-- LoginView.jsx
|   |   |   |-- RegisterView.jsx
|   |   |   `-- admin/
|   |   |       `-- AdminDashboardView.jsx
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.js
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.js
|   |-- src/
|   |   |-- config/
|   |   |   `-- database.js
|   |   |-- controllers/
|   |   |   |-- auth.controller.js
|   |   |   `-- user.controller.js
|   |   |-- middlewares/
|   |   |   |-- admin.middleware.js
|   |   |   |-- auth.middleware.js
|   |   |   |-- error.middleware.js
|   |   |   `-- validation.middleware.js
|   |   |-- models/
|   |   |   |-- cart.model.js
|   |   |   |-- cartItem.model.js
|   |   |   |-- category.model.js
|   |   |   |-- order.model.js
|   |   |   |-- orderDetail.model.js
|   |   |   |-- payment.model.js
|   |   |   |-- product.model.js
|   |   |   |-- review.model.js
|   |   |   `-- user.model.js
|   |   |-- routes/
|   |   |   |-- auth.routes.js
|   |   |   `-- user.routes.js
|   |   |-- utils/
|   |   |   |-- generateToken.js
|   |   |   `-- response.js
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- docs/
|   |-- database-design.md
|   `-- demo-checklist.md
|-- .gitignore
`-- README.md
```

## 7. Technical Specifications

### 7.1 Architecture Decisions

- Use Prisma, not Sequelize, to keep one ORM implementation path.
- Use Supabase only as hosted PostgreSQL.
- Use JWT plus bcrypt for authentication.
- React must call Express REST APIs only.
- Backend listens on `PORT`, default `5000`.
- Frontend reads `VITE_API_BASE_URL`, default `http://localhost:5000/api`.

### 7.2 Environment Variables

`backend/.env.example`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[DATABASE_PASSWORD]@[SUPABASE_HOST]:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[DATABASE_PASSWORD]@[SUPABASE_HOST]:5432/postgres"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

`frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 7.3 Prisma Schema Contract

Use these model names and relationships. Field names may use Prisma `camelCase` with `@map` for database `snake_case`, but API JSON should stay consistent across phases.

```prisma
enum Role {
  customer
  admin
}

enum OrderStatus {
  pending
  confirmed
  shipping
  completed
  cancelled
}

enum PaymentMethod {
  COD
}

enum PaymentStatus {
  unpaid
  paid
  failed
}

enum ReviewStatus {
  visible
  hidden
}

model User {
  id           String   @id @default(uuid())
  username     String
  email        String   @unique
  passwordHash String   @map("password_hash")
  fullName     String?  @map("full_name")
  phone        String?
  address      String?
  role         Role     @default(customer)
  cart         Cart?
  orders       Order[]
  reviews      Review[]
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
}

model Product {
  id           String        @id @default(uuid())
  name         String
  brand        String
  description  String?
  price        Decimal       @db.Decimal(10, 2)
  quantity     Int
  imageUrl     String?       @map("image_url")
  categoryId   String        @map("category_id")
  category     Category      @relation(fields: [categoryId], references: [id])
  cartItems    CartItem[]
  orderDetails OrderDetail[]
  reviews      Review[]
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
}

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique @map("user_id")
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String   @map("cart_id")
  productId String   @map("product_id")
  quantity  Int
  unitPrice Decimal  @map("unit_price") @db.Decimal(10, 2)
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([cartId, productId])
}

model Order {
  id              String        @id @default(uuid())
  userId          String        @map("user_id")
  user            User          @relation(fields: [userId], references: [id])
  totalAmount     Decimal       @map("total_amount") @db.Decimal(10, 2)
  status          OrderStatus   @default(pending)
  shippingAddress String        @map("shipping_address")
  details         OrderDetail[]
  payment         Payment?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
}

model OrderDetail {
  id        String   @id @default(uuid())
  orderId   String   @map("order_id")
  productId String   @map("product_id")
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])
}

model Payment {
  id            String        @id @default(uuid())
  orderId       String        @unique @map("order_id")
  order         Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  paymentMethod PaymentMethod @default(COD) @map("payment_method")
  paymentStatus PaymentStatus @default(unpaid) @map("payment_status")
  amount        Decimal       @db.Decimal(10, 2)
  paymentDate   DateTime?     @map("payment_date")
}

model Review {
  id        String       @id @default(uuid())
  userId    String       @map("user_id")
  productId String       @map("product_id")
  rating    Int
  comment   String?
  status    ReviewStatus @default(visible)
  user      User         @relation(fields: [userId], references: [id])
  product   Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")
}
```

### 7.4 Shared API Response Shape

All controllers must return one of these shapes:

```js
// success
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}

// failure
{
  "success": false,
  "message": "Human readable error",
  "errors": []
}
```

### 7.5 Auth API Contract

`POST /api/auth/register`

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Password123",
  "fullName": "Alice Nguyen",
  "phone": "0900000000",
  "address": "Demo address"
}
```

Response data:

```json
{
  "user": {
    "id": "uuid",
    "username": "alice",
    "email": "alice@example.com",
    "fullName": "Alice Nguyen",
    "role": "customer"
  },
  "token": "jwt"
}
```

`POST /api/auth/login`

```json
{
  "email": "alice@example.com",
  "password": "Password123"
}
```

`GET /api/auth/me`

- Requires `Authorization: Bearer <token>`.
- Returns the current user without `passwordHash`.

### 7.6 Frontend Foundation Contract

- `main.jsx` must import:

```js
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
```

- Layouts must use Astryx layout/navigation primitives first.
- Do not build custom layout with raw `div` wrappers when an Astryx layout component applies.
- No raw hex colors or pixel spacing in custom CSS. Use Astryx tokens.

## 8. Implementation Steps

- [ ] Inspect the existing repository before adding files and avoid duplicating existing helpers or config.
- [ ] Create root `.gitignore`, `README.md`, and `docs/` support files.
- [ ] Scaffold `backend/` with Express, Prisma, bcrypt, jsonwebtoken, cors, dotenv, and development scripts.
- [ ] Add `backend/.env.example` using the Supabase connection variables from this plan.
- [ ] Initialize Prisma and add the schema contract from this plan.
- [ ] Run the first Prisma migration against Supabase PostgreSQL.
- [ ] Add `seed.js` with demo categories, products, one customer, and one admin user.
- [ ] Create Prisma client export in `backend/src/config/database.js`.
- [ ] Add model modules that wrap Prisma operations without accepting HTTP `req` or `res`.
- [ ] Add `generateToken.js`, `response.js`, auth middleware, admin middleware, validation middleware, and error middleware.
- [ ] Implement `auth.controller.js` and `user.controller.js`.
- [ ] Implement auth and user routes and mount them under `/api`.
- [ ] Scaffold `frontend/` with Vite React.
- [ ] Install Astryx and import the required reset/style files in `main.jsx`.
- [ ] Add API client helpers for auth/user requests.
- [ ] Build `AuthContext.jsx`, route guards, `MainLayout`, `AdminLayout`, and `AuthLayout`.
- [ ] Build minimal `HomeView`, `LoginView`, `RegisterView`, and placeholder `AdminDashboardView`.
- [ ] Confirm React never imports Prisma, Supabase client credentials, or database connection strings.

## 9. Verification & Testing Plan

Automated commands:

```bash
cd backend
npm install
npx prisma validate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

API smoke tests:

```http
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
GET http://localhost:5000/api/auth/me
GET http://localhost:5000/api/users/profile
PUT http://localhost:5000/api/users/profile
GET http://localhost:5000/api/admin/users
```

Expected evidence:

- Backend starts without Prisma connection errors.
- Frontend starts on Vite.
- Supabase Table Editor shows all nine main tables.
- Passwords are stored as bcrypt hashes, not plain text.
- Login returns a JWT.
- `GET /api/auth/me` works with a valid token and fails without one.
- Admin users can call `GET /api/admin/users`; customer users cannot.
- Login and register views display loading, success, and error states.

Manual checks:

- Verify `.env` files are not committed.
- Verify `.env.example` files contain placeholders only.
- Verify the frontend uses `VITE_API_BASE_URL` and does not expose Supabase database credentials.
- Verify file/module responsibilities stay focused and avoid large mixed-purpose files.

## 10. Handoff Notes for Phase 2

Phase 2 must consume, not redefine:

- Prisma client export from `backend/src/config/database.js`.
- Model names, enum values, and relationships from `backend/prisma/schema.prisma`.
- Shared API response shape from `backend/src/utils/response.js`.
- Auth middleware and admin middleware.
- Existing `AuthContext` and API helper pattern in the frontend.
- Astryx setup in `frontend/src/main.jsx`.

Phase 2 is expected to implement product, category, and cart behavior on top of this foundation.

Hard rules for Phase 2:

- Do not change database field names or enum values unless a migration note is added to Phase 2 and all affected controllers/views are updated together.
- Do not create a second database client, second response helper, or second JWT helper.
- Do not introduce Supabase Auth.
- Do not let frontend code connect directly to Supabase PostgreSQL.
