# Demo Checklist

This checklist records evidence-backed status for the complete electronics
e-commerce MVC demo. `Passed - user provided` identifies manual browser evidence
reported by the user; `BLOCKED_BY_USER_ACTION` and `Pending` are not completion
claims. Batch06 final verification evidence now includes accepted 06A backend/API
checks, accepted 06B user-provided UI/demo checks, accepted 06C
security/MVC/scope audit checks, and this 06D handoff-evidence update. Batch06
itself remains open until reviewer/orchestrator acceptance.

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

## Plan 4 Verification Status

| Check | Status | Evidence |
|---|---|---|
| Review API behavior and authorization | Passed | Accepted task 01D recorded Prisma validation, backend startup/health, and live review list/create/hide checks, including anonymous/customer/admin boundaries and hidden-review exclusion. |
| Customer review UI | Passed - user provided | Accepted task 02D records user-provided customer review UI PASS plus 12 focused tests, a production build, and an admin moderation browser smoke check. |
| Revenue, best-selling products, and order-summary APIs | Passed | Accepted task 03D independently compared all three admin-only API responses with current database rows and verified admin `200`, anonymous `401`, and customer `403` behavior. |
| Admin dashboard and reports UI | Passed - user provided | Accepted task 04D records user-provided dashboard/report navigation, loading, error, retry, refresh, responsive, and access PASS; 31 frontend tests and the production build also passed. |
| Responsive demo routes | Passed - user provided | Accepted task 05A records the user's post-repair PASS for tablet header and orders, mobile login/product detail/cart/admin orders, and desktop regression. This is manual evidence, not automated browser evidence. |
| README setup and runtime documentation | Passed | Accepted task 05B verified setup, API groups, routes, MVC description, seed credential provenance, and secret-safe environment examples against runtime files. |
| Database design and embedded ERD | Passed | Accepted task 05C verified all nine models, five enums, fields, constraints, and relationships against the Prisma schema and tracked migration. |
| Batch06 backend/API verification | Passed | Task 06A ran Prisma validation, backend startup/health, review list/create/hide checks, report authorization boundaries, and database-to-report comparisons for revenue, best-selling products, and order-summary responses. |
| Batch06 frontend dev command | Passed | Task 06B ran `cd frontend && npm run dev`; Vite started successfully at `http://localhost:5174/` in the user run and the SPA shell returned HTTP 200. The repair rerun also started Vite successfully at `http://127.0.0.1:5173/` and confirmed HTTP 200 before stopping the temporary server. |
| Batch06 full customer/admin UI demo | Passed - user provided | User reports backend health PASS, backend/frontend launched, browser-subagent/manual checks completed at `http://localhost:5174/`, no blockers, no code files modified, and PASS for customer homepage/products/search/product detail/review/cart/checkout/orders, admin dashboard/reports/orders/status/reviews/products/categories, route guards, loading/empty/error/success states, and desktop/tablet/mobile responsive checks. Focused frontend structure and integration tests were rerun and passed as corroborating evidence. |
| Supabase Table Editor visual confirmation | BLOCKED_BY_USER_ACTION | Database-backed checks passed, but no agent inspected the Supabase dashboard. A user with project access must confirm the expected tables and representative seeded/order/review rows. |
| Team-specific slide ownership and rehearsal | BLOCKED_BY_USER_ACTION | The role template is documented below, but names, slide completion, timing, and each member's understanding require team confirmation. |
| Batch06 security/MVC/scope audit | Passed | Task 06C was accepted after safe secret handling, frontend database-access, duplicate-helper, MVC-boundary, Astryx, out-of-scope, and broad-file checks passed. Existing ignored local `.env` files remain untracked and were not read. |
| Batch06 final handoff evidence | Pending A2 review | Task 06D reconciled this checklist against accepted 06A/06B/06C evidence, README, database docs, API runbook, Plan 4 final handoff notes, and Master Plan final checklist. A1 did not update the 06D checkbox or mark Batch06 complete. |

## Customer Demo Flow - Homepage Through Review

1. Start the backend and frontend using the commands in `README.md`.
2. Open `http://localhost:5173/` and show featured products.
3. Open `/products`, search by keyword, filter by category, and open a product.
4. Register or log in as a customer.
5. Add the in-stock product to the cart and update its quantity.
6. Checkout with COD and a valid shipping address.
7. Open `/orders`, then open the new order detail.
8. Return to the product detail page.
9. Submit a rating from 1 to 5 with an optional comment.
10. Confirm the new review appears in the visible review list.

Use seeded demo accounts only in a local/course environment. Do not expose
tokens, `.env` contents, or database credentials in screenshots or reports.

## Admin Demo Flow - Dashboard Through Reports

1. Log in as the seeded admin and open `/admin`.
2. Show report-backed dashboard metrics and the reports navigation action.
3. Open `/admin/categories`; create a temporary category if mutation evidence is needed.
4. Open `/admin/products`; create or update a temporary product if mutation evidence is needed.
5. Open `/admin/orders`, filter orders, open details, and update an appropriate order status.
6. Open `/admin/reviews`, select a product, and show visible review moderation.
7. Open `/admin/reports`.
8. Show revenue, best-selling products, and all order-status counts.
9. Explain that report truth comes from Express/Prisma queries, not React calculations.
10. Remove disposable demo records when safe; do not delete shared seeded data.

## Final Submission Checklist - Master Plan Section 26

| Master-plan item | Status | Evidence or required action |
|---|---|---|
| React View layer runs successfully | Passed | Accepted 05A evidence includes Vite startup, frontend tests/build, and manual route checks. |
| Express Controller layer runs successfully | Passed | Accepted 01D and 03D live API evidence used the running Express app. |
| Supabase project is created | Passed - runtime evidence | Accepted database-backed migrations, Prisma queries, API smoke checks, and report comparisons require the configured project; dashboard ownership was not inspected. |
| Supabase PostgreSQL database connects successfully | Passed | Accepted Prisma, migration, seed, order, review, and report evidence used the configured database. |
| `DATABASE_URL` is configured in backend `.env` | Passed - runtime evidence | Accepted Prisma and runtime checks loaded the private backend environment. The value remains undisclosed. |
| `DIRECT_URL` is configured for Prisma migrations | Passed - runtime evidence | Accepted migration evidence used the private migration connection. The value remains undisclosed. |
| ORM Models are created | Passed | `docs/database-design.md` and accepted 05C evidence cover all nine Prisma models. |
| Tables are visible in Supabase Table Editor | BLOCKED_BY_USER_ACTION | Confirm visually while signed in to the correct Supabase project. |
| MVC folder structure is clear | Passed | README and accepted task evidence document React Views, Express Controllers, and Prisma Models. |
| Register works | Passed | Plan 1 accepted API/UI evidence. |
| Login works | Passed | Plan 1 accepted API/UI evidence. |
| Product list works | Passed | Plan 2 accepted API/UI evidence. |
| Product detail works | Passed | Plan 2 evidence plus accepted 02D/05A review and responsive checks. |
| Add to cart works | Passed | Plan 2 accepted API/UI evidence. |
| Checkout works | Passed - user provided UI | Plan 3 API evidence passed and the user reported the repaired checkout UI flow PASS. |
| Order history works | Passed - user provided UI | Plan 3 API evidence passed and the user reported order-history/detail UI PASS. |
| Admin product management works | Passed | Plan 2 accepted API/UI evidence. |
| Admin order management works | Passed - user provided UI | Plan 3 API evidence passed and the user reported admin order UI PASS. |
| Report page works | Passed - user provided UI | Accepted 03D API evidence and accepted 04D manual UI evidence. |
| Documentation includes MVC explanation | Passed | Accepted 05B README review. |
| ERD diagram is complete | Passed | Accepted 05C schema-to-ERD review. |
| Presentation slides are ready | Pending | Team must create and review the actual slides; no slide deck is claimed by task 05D. |
| Demo script is ready | Passed - documented | The customer and admin flows above cover the master-plan minimum viable demo. |
| Each member understands their MVC responsibility | BLOCKED_BY_USER_ACTION | Assign names, rehearse, and confirm ownership using the presentation notes below. |

## Final Freeze and Handoff Notes

- No new nice-to-have runtime features were added after final verification started.
- No schema changes were made during Batch06; database/report verification remains tied to the accepted Prisma schema and seeded demo data evidence.
- Online payment, shipping provider integration, email, realtime behavior, AI, recommendations, mobile app, multi-store, warehouse/accounting systems, image upload, and dashboard charts remain out of scope.
- Planned or placeholder work is not counted as runtime-complete in this checklist. Supabase dashboard visuals, slide readiness, rehearsal, and member understanding remain pending user/team actions until explicitly confirmed.

## Presentation Responsibility Notes - Master Plan Section 27

Replace `Member 1` through `Member 5` with real names before submission:

- Member 1: project overview, MVC architecture, Model layer, database design, and ERD.
- Member 2: customer View layer, product browsing, search, and filters.
- Member 3: cart and checkout Views, admin Views, and report View.
- Member 4: core Controller layer, authentication, product, and category controllers.
- Member 5: business Controller layer, cart, order, payment, and report controllers.

Before presenting, each member must confirm their slides, live-demo handoff,
fallback screenshots, speaking time, and the MVC boundary they will explain.
These team-specific confirmations remain `BLOCKED_BY_USER_ACTION` until supplied.

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
