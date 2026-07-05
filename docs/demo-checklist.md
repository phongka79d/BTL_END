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

## Plan 3 Verification Status

| Check | Status | Evidence |
|---|---|---|
| Backend Prisma schema validation | Passed | 06A recorded `cd backend && npx prisma validate` passing. |
| Backend startup and health endpoint | Passed | 06A recorded `cd backend && npm run dev` starting the backend on port 5000 and `GET /api/health` returning HTTP 200. |
| Customer checkout API | Passed | 06A recorded `POST /api/orders` creating order `9c8a6f41-46f5-4111-9c00-357d5d6933dd` with one detail row and an unpaid COD payment. |
| Checkout stock and cart side effects | Passed | 06A recorded selected product stock decreasing from 35 to 34 and the authenticated cart clearing after checkout. |
| Empty-cart checkout failure | Passed | 06A recorded empty-cart checkout returning HTTP 400. |
| Insufficient-stock checkout failure | Passed | 06A recorded checkout returning HTTP 400 when requested quantity exceeded stock, then restored the test product/cart state. |
| Customer order history | Passed | 06A recorded `GET /api/orders/my-orders` returning customer order history including the created order. |
| Customer/admin order detail access control | Passed | 06A recorded the customer viewing their own order, another customer receiving HTTP 403, and admin viewing the order through the admin route. |
| Admin order list and status filter | Passed | 06A recorded `GET /api/admin/orders` and `GET /api/admin/orders?status=pending` returning order lists. |
| Admin order status update | Passed | 06A recorded invalid status returning HTTP 400 and `completed` updating the order status. |
| Completed COD payment side effect | Passed | 06A recorded status `completed` marking the COD payment as `paid`. |
| COD payment endpoint idempotency | Passed | 06A recorded repeated `POST /api/payments/cod` calls returning the same existing payment record. |
| Frontend production build | Passed | 06B repair recorded `cd frontend && npm run build` passing with only the existing Vite chunk-size warning. |
| Customer checkout UI flow | Passed - user provided | After the checkout navigation fix, the user reported all manual UI tests PASS, including product/cart to checkout success. |
| Customer order history and detail UI | Passed - user provided | After the checkout navigation fix, the user reported all manual UI tests PASS, including order history and detail checks. |
| Customer/admin/anonymous route guards | Passed - user provided | After the checkout navigation fix, the user reported all manual UI tests PASS, including route guard checks. |
| Admin orders UI | Passed - user provided | After the checkout navigation fix, the user reported all manual UI tests PASS, including admin list, detail dialog, status update, and completed payment status behavior. |
| Desktop/tablet/mobile usability | Passed - user provided | After the checkout navigation fix, the user reported all manual UI tests PASS, including responsive usability checks. |
| Security, MVC, anti-duplication, and Astryx audit | Passed | 06C recorded no committed real `.env` files, no frontend direct database access, one runtime Prisma client export path, centralized response/JWT helpers, focused controller/model boundaries, Astryx-aligned UI, and no out-of-scope runtime behavior. |
| Supabase Table Editor visual row check for `Order`, `OrderDetail`, and `Payment` | BLOCKED_BY_USER_ACTION | API and database-backed smoke checks proved created order/payment behavior, but the agent did not inspect the Supabase dashboard UI. User-side dashboard confirmation remains credential-dependent. |

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

## Demo Flow for Plan 3

1. Start the backend with `cd backend && npm run dev`.
2. Start the frontend with `cd frontend && npm run dev`.
3. Log in as a customer and open a product detail page.
4. Add an in-stock product to the cart, open `/cart`, and confirm the subtotal comes from the backend cart response.
5. Click Checkout, confirm the shipping form validates required input, and confirm COD is the only payment method.
6. Submit checkout with a valid shipping address and confirm the success dialog appears.
7. Confirm the cart refreshes after checkout and the order appears in `/orders`.
8. Open the order detail page and confirm shipping, item rows, order status, payment status, and total display.
9. Log out and confirm anonymous access to `/checkout`, `/orders`, and `/orders/:id` redirects to login.
10. Log in as an admin and open `/admin/orders`.
11. Confirm the admin order table, status filter, detail dialog, and inline status selector work.
12. Update an order to `completed` and confirm the UI reflects the COD payment as `paid`.
13. If credentials are available, visually confirm the created rows in Supabase Table Editor for `Order`, `OrderDetail`, and `Payment`; otherwise record this as `BLOCKED_BY_USER_ACTION`.

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

## Phase 4 Handoff Checklist

- Reuse completed order and payment records from `backend/src/models/order.model.js` and `backend/src/models/payment.model.js` for reports and moderation-adjacent workflows.
- Reuse product/order relationships in `backend/prisma/schema.prisma`; do not create reporting-only order/payment schema copies.
- Reuse `backend/src/middlewares/auth.middleware.js` and `backend/src/middlewares/admin.middleware.js` for review moderation and report access control.
- Reuse backend order and payment status enum values through `frontend/src/constants/orderConstants.js` and the Prisma schema.
- Reuse `frontend/src/views/ProductDetailView.jsx` for review display/form integration.
- Reuse admin layout/table/dialog patterns from `frontend/src/layouts/AdminLayout.jsx`, `frontend/src/views/admin/AdminOrderView.jsx`, `frontend/src/components/admin/AdminOrderDetailDialog.jsx`, and `frontend/src/components/admin/OrderStatusSelect.jsx`.
- Reports must calculate revenue from backend/database order/payment data, not frontend state.
- Phase 4 must not add online payment behavior.
- Phase 4 must not change checkout transaction behavior unless tests cover the full customer/admin order flow.
