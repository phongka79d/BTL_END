# Demo Checklist

This checklist records the verified Plan 1 foundation state and Phase 2 product/category/cart state for the electronics e-commerce MVC project.

## Plan 1 Verification Status

| Check | Status | Evidence |
|---|---|---|
| Backend dependencies install | Passed | 05A recorded `npm install` in `backend` passing. |
| Prisma schema validates | Passed | 05A recorded `npx prisma validate` passing. |
| Initial Prisma migration runs | Passed | 05A recorded `npx prisma migrate dev --name init` passing against the configured database. |
| Seed script runs | Passed | 05A recorded `npx prisma db seed` passing. |
| Backend starts | Passed | 05A recorded `npm run dev` starting the Express backend on port 5000. |
| Backend health endpoint | Passed | 05A recorded `GET http://localhost:5000/api/health` returning HTTP 200. |
| Auth and user API smoke tests | Passed | 05B recorded register, login, `/api/auth/me`, profile read/update, and `/api/admin/users` checks passing without printing secrets or tokens. |
| Frontend dependencies install | Passed | 05C recorded `npm install` in `frontend` passing after the React 19/Astryx dependency alignment. |
| Frontend starts on Vite | Passed | 05C recorded Vite serving the app and route HTTP checks for `/`, `/login`, `/register`, and `/admin` returning HTTP 200. |
| Frontend production build | Passed | 05C recorded `npm run build` passing. |
| Frontend auth UI smoke checks | Passed - user provided | 05C records user-provided manual PASS for home, login validation/error states, customer login/logout, register validation/success states, admin guards, admin dashboard, and no fatal console errors. |
| Security, MVC, and duplication audit | Passed | 05D recorded no committed real `.env` files, no frontend database access, focused MVC boundaries, and no duplicate runtime Prisma client, response helper, or JWT helper. |
| Supabase Table Editor visual table check | User-side confirmation needed | Migration passed, but the agent did not inspect the Supabase dashboard UI. User should confirm the nine main tables are visible in Supabase Table Editor. |

## Plan 2 Verification Status

| Check | Status | Evidence |
|---|---|---|
| Backend Prisma schema validation | Passed | 06A recorded `cd backend && npx prisma validate` passing. |
| Backend startup | Passed | 06A recorded `cd backend && npm run dev` starting the Express backend on port 5000. |
| Public category API | Passed | 06A recorded `GET /api/categories` returning 4 seeded categories with `id`, `name`, and `description`. |
| Public product API | Passed | 06A recorded `GET /api/products` returning 6 seeded products with category data. |
| Product search and filters | Passed | 06A recorded combined `keyword`, `categoryId`, `minPrice`, and `maxPrice` filtering returning the expected narrowed product result. |
| Admin category CRUD API | Passed | 06A recorded admin create, update, and delete checks passing with temporary smoke data. |
| Admin product CRUD API | Passed | 06A recorded admin create, update, and delete checks passing with temporary smoke data. |
| Admin authorization boundaries | Passed | 06A recorded anonymous admin mutations rejected with 401 and customer admin mutations rejected with 403. |
| Customer cart API | Passed | 06A recorded authenticated cart fetch, add, update, and remove checks passing. |
| Cart subtotal and stock behavior | Passed | 06A recorded backend subtotal matching captured `unitPrice * quantity`, above-stock adds rejected with 400, and product stock unchanged after cart operations. |
| Frontend dev server | Passed | 06B recorded `cd frontend && npm run dev` serving the Vite app at `http://localhost:5173/`. |
| Customer homepage and product list UI | Passed | 06B recorded homepage featured products, product list success state, no-match empty state, loading state, and error state checks passing in browser automation. |
| Product detail add-to-cart feedback | Passed | 06B recorded anonymous add-to-cart on product detail showing sign-in-required feedback. |
| Customer cart UI | Passed | 06B recorded authenticated add, subtotal display, quantity update, checkout placeholder, and remove flow checks passing. |
| Admin product/category UI | Passed | 06B recorded admin product and category pages loading tables and opening Astryx form dialogs. |
| Responsive product list | Passed | 06B recorded product list and filters rendering at 1280px, 800px, and 390px without horizontal overflow. |
| Frontend direct database access search | Passed | 06B and 06C recorded no frontend Prisma, database URL, Supabase PostgreSQL, or SQL access. |
| Security, MVC, duplication, and scope audit | Passed | 06C recorded no committed real `.env` files, no duplicate runtime helpers, clear route/controller/model boundaries, Astryx-aligned UI, and no wired checkout/order/payment/review/report/upload/shipping runtime feature. |
| In-app browser surface | Not required after fallback | 06B recorded the in-app browser unavailable, but system Chrome automation was available and all required UI smoke checks passed there. |
| Remaining Phase 2 blocked checks | None | Earlier live-smoke blocked items were superseded by 06A/06B local backend, API, and browser evidence. User-side credential-dependent reruns should be marked `BLOCKED_BY_USER_ACTION` if the local `.env`, database, seeded data, credentials, or browser tooling are unavailable in a future session. |

## Demo Flow for Plan 1

1. Start the backend with `cd backend && npm run dev`.
2. Start the frontend with `cd frontend && npm run dev`.
3. Open the Vite URL and confirm the home, login, register, and admin routes render.
4. Register or log in with demo-safe credentials without exposing passwords in reports or screenshots.
5. Confirm customer login/logout, register success/error states, and admin-only route protection.
6. Confirm API smoke behavior through the backend only; the frontend must not connect directly to Supabase PostgreSQL.
7. In Supabase Table Editor, manually confirm the Plan 1 tables exist after migration: `users`, `categories`, `products`, `carts`, `cart_items`, `orders`, `order_details`, `payments`, and `reviews`.

## Demo Flow for Plan 2

1. Start the backend with `cd backend && npm run dev`.
2. Start the frontend with `cd frontend && npm run dev`.
3. Open the Vite URL and confirm homepage featured products render from the backend.
4. Open `/products`, search/filter products, and confirm success, empty, loading, and error states where practical.
5. Open a product detail page and confirm unauthenticated add-to-cart shows sign-in-required feedback.
6. Log in as a customer, add a product to the cart, update quantity, remove the item, and confirm subtotal comes from the backend cart response.
7. Log in as an admin and confirm `/admin/products` and `/admin/categories` render Astryx-backed tables and form dialogs.
8. Confirm non-admin users cannot access admin product/category routes.

## Phase 3 Handoff Checklist

- Reuse `backend/src/config/database.js` as the single runtime Prisma client export.
- Reuse `backend/prisma/schema.prisma` model names, field names, relationships, and enum values.
- Reuse `backend/src/utils/response.js` for API success and error responses.
- Reuse `backend/src/middlewares/auth.middleware.js` and `backend/src/middlewares/admin.middleware.js` for protected and admin routes.
- Reuse `backend/src/models/product.model.js` and `backend/src/controllers/product.controller.js` for product lookup, filters, category data, and stock reads.
- Reuse `backend/src/models/cart.model.js`, `backend/src/models/cartItem.model.js`, and `backend/src/controllers/cart.controller.js` for cart ownership, item shape, captured `unitPrice`, quantity validation, and backend subtotal behavior.
- Reuse `frontend/src/contexts/AuthContext.jsx` for frontend auth state.
- Reuse `frontend/src/contexts/CartContext.jsx` and `frontend/src/api/cartApi.js` for cart state and cart mutations.
- Reuse the existing frontend API helper pattern in `frontend/src/api/apiClient.js`, `authApi.js`, `userApi.js`, `productApi.js`, `categoryApi.js`, and `cartApi.js`.
- Reuse `frontend/src/routes/AppRoutes.jsx`, `frontend/src/layouts/MainLayout.jsx`, and `frontend/src/layouts/AdminLayout.jsx` route/layout patterns for checkout, order, and admin order work.
- Keep Astryx setup in `frontend/src/main.jsx` and build UI with Astryx components first.
- Do not introduce Supabase Auth, direct frontend database access, a second ORM/database client, a second response helper, or a second JWT helper.
- Do not reduce stock during cart add/update/remove operations; stock reduction belongs to Phase 3 order creation.
- Do not duplicate cart subtotal logic in the frontend as the source of truth; use backend cart/order responses.
- Do not create separate checkout-only product queries when existing product model helpers can be reused.
- Do not alter the Phase 1 schema without an explicit migration section and verification of affected Phase 2 APIs.
