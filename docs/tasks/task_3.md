# Electronics E-Commerce Plan 3 Execution Tasks

## Purpose

Convert Plan 3 into a detailed, batch-based execution task file for implementing checkout, persisted orders, COD payment records, customer order views, and admin order status management.

This file is for future execution agents. It does not implement runtime code.

## Project Context Notes

- README status: read successfully.
- Project purpose: course-project MVC web application for an electronics e-commerce store.
- Current stack: React, Vite, and Astryx for the View layer; Express.js JSON REST APIs for the Controller layer; Prisma ORM with Supabase PostgreSQL for the Model/database layer; JWT and bcrypt for authentication.
- Existing validation commands documented by README: `cd backend && npx prisma validate`, `cd backend && npx prisma migrate dev --name init`, `cd backend && npx prisma db seed`, `cd backend && npm run dev`, `cd frontend && npm run dev`.
- Current implementation state documented by README: Plan 1 auth/user/foundation and Plan 2 product/category/cart/customer/admin catalog work are implemented, verified, and available as handoff artifacts.
- Current file audit note: `backend/src/models/order.model.js`, `backend/src/models/orderDetail.model.js`, and `backend/src/models/payment.model.js` already exist as minimal placeholders and must be reused or safely expanded instead of duplicated.
- README conflicts: none found. README Phase 3 handoff aligns with Plan 3: stock reduction belongs to order creation, frontend totals are display-only, existing product/cart/auth/admin/API/layout artifacts must be reused, and credential-dependent live checks must be marked `BLOCKED_BY_USER_ACTION`.

## Authoritative Source

- Primary phase source: `docs/plans/Plan_3.md`
- Supporting architecture source referenced by Plan 3: `docs/plans/Master_Plan.md`
- Supporting UI source referenced by Plan 3: `docs/design/design.md`
- Project context only: `README.md`
- Scope resolution: `docs/plans/Plan_3.md` is the approved Phase 3 slice. Where the master plan or design document includes broader review, report, upload, shipping, online payment, or dashboard work, follow the narrower Plan 3 scope unless the user explicitly changes the plan.
- Source note: Plan 3 references some master-plan sections by old numbering labels. Use the current heading names listed in the Source Section Index when grounding implementation work.

## Source Section Index

- `docs/plans/Plan_3.md` > `## 1. Objective` -> checkout, persisted order, COD payment, stock reduction, customer order, and admin order-management goal.
- `docs/plans/Plan_3.md` > `## 2. Source of Truth` -> master plan and design sections that support Phase 3.
- `docs/plans/Plan_3.md` > `## 3. Prerequisites from Prior Phases` -> required Phase 1 and Phase 2 backend, frontend, auth, cart, admin, route, layout, and seed artifacts.
- `docs/plans/Plan_3.md` > `## 4. Scope` -> required order APIs, COD payment API, checkout transaction, customer views, admin order view, validation, and COD-only payment limit.
- `docs/plans/Plan_3.md` > `## 5. Out of Scope` -> online payments, shipping provider integration, email, refunds, reviews, reports, dashboard charts, and schema redesign exclusions.
- `docs/plans/Plan_3.md` > `## 6. Target Directory Structure` -> expected backend and frontend modules.
- `docs/plans/Plan_3.md` > `## 7. Technical Specifications` -> order creation, order reads, status updates, payment endpoint, and frontend UI contracts.
- `docs/plans/Plan_3.md` > `### 7.1 Order Creation API` -> checkout request, transaction rules, response shape, COD payment creation, stock reduction, and cart clearing.
- `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs` -> customer order history, customer/admin order detail access, and admin list behavior.
- `docs/plans/Plan_3.md` > `### 7.3 Order Status API` -> admin status values, validation, completed payment update, and simple cancellation rule.
- `docs/plans/Plan_3.md` > `### 7.4 Payment API` -> optional explicit COD endpoint behavior and no duplicate payment rule.
- `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract` -> checkout, customer order, admin order view behavior, Astryx usage, and backend-total source-of-truth constraint.
- `docs/plans/Plan_3.md` > `## 8. Implementation Steps` -> ordered implementation checklist.
- `docs/plans/Plan_3.md` > `## 9. Verification & Testing Plan` -> backend/frontend commands, API smoke tests, expected evidence, and manual checks.
- `docs/plans/Plan_3.md` > `## 10. Handoff Notes for Phase 4` -> Phase 4 report/review dependencies and hard rules.
- `docs/plans/Master_Plan.md` > `## 6. Project Scope` -> customer checkout/order and admin order features in scope, broad online/shipping features out of scope.
- `docs/plans/Master_Plan.md` > `## 7. Team Member Responsibility Plan` > `### Member 3 - Cart, Order, Admin View Layer` -> checkout/order/admin-order view responsibilities.
- `docs/plans/Master_Plan.md` > `## 7. Team Member Responsibility Plan` > `### Member 5 - Business Controller Layer` -> order/payment controller and checkout business flow responsibilities.
- `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.6 OrderController` -> order API actions, stock check, total calculation, order details, stock reduction, customer reads, admin list, and status update.
- `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.7 PaymentController` -> COD payment record and payment status update behavior.
- `docs/plans/Master_Plan.md` > `## 14. View Design` -> customer/admin view names and no direct database access from views.
- `docs/plans/Master_Plan.md` > `## 15. API Design Summary` -> order and payment endpoint families.
- `docs/plans/Master_Plan.md` > `## 16. Development Timeline` > `### Week 3 - Order, Payment, Admin` -> Phase 3 output expectations.
- `docs/design/design.md` > `# 11. Checkout Components` -> checkout form, order summary, success dialog, COD-only method, and Astryx references.
- `docs/design/design.md` > `# 12. Order Components` -> order history table, order detail panel, order status badge, and payment status badge.
- `docs/design/design.md` > `# 17. Admin Order Components` -> admin order table, order status selector, and admin order detail dialog.
- `docs/design/design.md` > `# 20. Common Form Components` -> reusable form primitive guidance.
- `docs/design/design.md` > `# 21. Common Feedback Components` -> toast, banner, loading, empty, and confirm feedback guidance.
- `docs/design/design.md` > `# 22. Common Utility Components` -> page header, toolbar, pagination, price, date, and utility guidance.
- `docs/design/design.md` > `# 23. Status Components` -> order and payment status meanings.
- `docs/design/design.md` > `# 24. Page-to-Component Map` -> checkout, order history, order detail, and admin orders page composition.
- `docs/design/design.md` > `# 25. UI States` -> initial, loading, success, empty, validation error, API error, permission denied, checkout, and admin table state requirements.
- `docs/design/design.md` > `# 26. Responsive Design` -> desktop, tablet, and mobile responsiveness.
- `docs/design/design.md` > `# 29. Astryx Component Mapping Summary` -> Astryx references for checkout, order detail, admin tables, status labels, messages, loading, and empty states.

## Approved Architecture Summary

- Continue the existing MVC architecture: Prisma model modules own data access and transactions, Express controllers own HTTP/request behavior, and React views own presentation.
- Supabase remains hosted PostgreSQL only. Do not use Supabase Auth, Supabase client-side database access, Edge Functions, direct React database access, or a second ORM.
- Reuse the existing Prisma schema and enum values: `OrderStatus` values are `pending`, `confirmed`, `shipping`, `completed`, and `cancelled`; `PaymentMethod` is `COD`; `PaymentStatus` values are `unpaid`, `paid`, and `failed`.
- Reuse `backend/src/config/database.js`, existing model/controller/route patterns, `backend/src/utils/response.js`, `auth.middleware.js`, `admin.middleware.js`, and `validation.middleware.js`.
- Expand existing `order.model.js`, `orderDetail.model.js`, and `payment.model.js` placeholders instead of creating duplicate order/payment data-access modules.
- Checkout is one Prisma transaction: load the authenticated user's cart, validate non-empty cart and stock, calculate backend total from captured cart item prices, create order/details/payment, reduce stock, and clear cart items only after all work succeeds.
- Product stock is not reduced during cart add/update/remove; stock reduction belongs only to successful order creation.
- COD payment creation should happen inside `POST /api/orders`. The explicit `POST /api/payments/cod` endpoint may exist for demo/API completeness but must not create a duplicate payment.
- Customer order reads must be scoped to the authenticated user; admin order list/status updates must require admin middleware.
- React may display backend totals but must not become the source of truth for order totals, payment amounts, or stock mutation.
- Frontend work must reuse the existing API client pattern, `CartContext`, auth state, customer/admin layouts, route guards, and Astryx setup.
- UI must follow `docs/design/design.md` and the root Astryx instructions before introducing or changing checkout/order/admin-order components.

## Global Implementation Rules

- Read root `AGENTS.md` or the current AGENTS instructions before implementation and follow search-before-write, reuse, SRP, YAGNI, and root-cause rules.
- Search existing code before adding functions, helpers, utilities, configs, API clients, contexts, components, or business logic. Use `rg`/grep-equivalent searches and record what was reused.
- Reuse or safely refactor existing product, cart, response, auth, admin, API client, cart context, route, layout, and placeholder order/payment code. Do not duplicate core logic.
- Keep files focused. If a source file approaches broad mixed responsibilities or the local 300-line guidance, split by model/controller/component responsibility.
- Use exactly one Prisma client export, one response helper family, one auth/admin middleware path, one validation middleware path, one frontend API client pattern, and one cart state owner.
- Keep real `.env` values, Supabase credentials, JWT secrets, user passwords, payment data, and database URLs out of committed files, logs, docs, UI, and execution reports.
- Treat missing real database/JWT credentials, seeded users/products, local `.env` values, or unavailable local servers as `BLOCKED_BY_USER_ACTION` for live validation, not as completed work.
- Keep frontend code free of Prisma imports, Supabase database credentials, backend-only config names, SQL, and database logic.
- Use Astryx workflow before writing UI: run `npx astryx build "checkout order admin orders"`, inspect relevant templates with `npx astryx template <name>`, and inspect component props with `npx astryx component <Name>` for components used.
- Follow Astryx project rules: use components for layout/spacing, prefer component props, use tokens for custom styling, avoid raw hex/px values, and do not introduce utility-class or Tailwind-style styling.
- Do not implement online payment, shipping provider integration, email confirmation, refunds, returns, invoices, coupons, promotions, review UI/controller, report APIs, best-selling reports, advanced dashboard charts, schema redesign, or Phase 4 behavior in Plan 3.
- If a simplification is intentional, mark it with a `ponytail:` comment naming its ceiling and upgrade path.

## Execution Agent Coding Style Requirements

- Write clean, idiomatic, readable code that follows the approved stack.
- Use descriptive names for modules, functions, variables, components, settings, and tests.
- Keep functions, components, and modules focused on one clear responsibility.
- Prefer simple, explicit control flow over clever abstractions.
- Use clear typing where the stack supports it.
- Avoid `any`, broad exception handling, hidden global state, and hardcoded configuration unless explicitly required by the source.
- Add comments only for non-obvious decisions or behavior.
- Keep frontend code free of backend-only secrets and backend-only configuration names.
- Do not add formatters, linters, frameworks, or architecture changes outside the source plan unless they already exist in the project or the user explicitly requests them.

## Batch Map

| Batch | Name | Outcome |
|---|---|---|
| Batch01 | Backend Checkout Transaction Models | Order/payment model helpers implement the checkout transaction, customer/admin reads, status updates, stock reduction, and cart clearing. |
| Batch02 | Backend Order and Payment APIs | Order/payment controllers and routes expose the required customer, admin, and COD endpoint behavior under `/api`. |
| Batch03 | Frontend API, Routing, and Cart Refresh | Order/payment API helpers, protected routes, navigation entries, and post-checkout cart refresh behavior are wired to existing frontend state. |
| Batch04 | Customer Checkout and Order UI | Checkout, order history, and order detail customer views are implemented with Astryx and design-document states. |
| Batch05 | Admin Order Management UI | Admin orders table, status selector, detail dialog, and admin route behavior are demoable. |
| Batch06 | Verification, Security Audit, and Phase 4 Handoff | Backend, frontend, API, UI, security, MVC, scope, progress, and handoff checks are completed or honestly blocked. |

## Mandatory Batch01 - Backend Checkout Transaction Models

### Goal

Implement the data-access and transaction behavior needed for checkout, order reads, COD payment records, stock reduction, status updates, and cart clearing on top of the existing Prisma schema and model placeholders.

### Why this batch exists

Checkout correctness depends on one backend transaction and backend-owned totals. Controllers and frontend views should consume stable model behavior instead of duplicating cart, stock, payment, or total logic.

### Inputs / Dependencies

- Plan 1 Prisma schema, Prisma client, response helper, auth middleware, admin middleware, and validation middleware.
- Plan 2 product model, cart model, cart item model, and backend subtotal/stock-validation behavior.
- Existing placeholder files: `backend/src/models/order.model.js`, `backend/src/models/orderDetail.model.js`, and `backend/src/models/payment.model.js`.
- Seeded customer, admin, categories, products, and at least one cart with items for live validation.

### Tasks

- [x] (01A): Inspect prior backend patterns and checkout prerequisites
  - Source of Truth: `docs/plans/Plan_3.md` > `## 3. Prerequisites from Prior Phases`; `docs/plans/Plan_3.md` > `## 8. Implementation Steps`; `README.md` > `## Phase 3 Handoff Contract`
  - Source Requirements:
    - Phase 3 must reuse Phase 1 and Phase 2 backend, auth, admin, response, product, and cart artifacts.
    - Phase 3 must review Phase 2 cart and product model functions before adding checkout logic.
    - Existing checkout/order placeholders must be reused or safely expanded.
  - Details: Establish the existing backend conventions before writing order/payment data-access code.
  - Dependencies: None
  - User Action: None
  - Agent Work: Read current backend model/controller/route patterns, search for existing order/payment/cart/product logic, and identify reusable helper boundaries.
  - Specific Steps:
    1. Read the current AGENTS instructions.
    2. Search backend source for existing order, order detail, payment, cart, cart item, product, response, auth, admin, validation, route, and Prisma helper code.
    3. Inspect `backend/prisma/schema.prisma` for exact order, order detail, payment, cart item, product, Decimal, enum, and relationship names.
    4. Inspect existing cart/product model behavior so checkout can reuse cart ownership, captured `unitPrice`, and stock reads.
    5. Record which placeholders will be expanded instead of replaced.
  - Output: Checkout implementation approach aligned with existing backend patterns.
  - Acceptance: Execution notes identify reusable files and no duplicate backend helper path is planned.
  - Validation: `rg "Order|OrderDetail|Payment|Cart|CartItem|Product|response|admin|auth|prisma" backend/src backend/prisma`
  - Blocked Condition: None
  - Files: No required code changes unless stale placeholders must be aligned before implementation.

- [x] (01B): Implement order checkout transaction helper
  - Source of Truth: `docs/plans/Plan_3.md` > `## 4. Scope`; `docs/plans/Plan_3.md` > `### 7.1 Order Creation API`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.6 OrderController`
  - Source Requirements:
    - `POST /api/orders` uses the authenticated user's cart.
    - Checkout rejects an empty cart and quantities above current stock.
    - Checkout calculates `totalAmount` on the backend from cart items and captured prices.
    - Checkout creates an order with status `pending`, one order detail per cart item, one COD payment record, reduces product stock, and clears cart items after success.
    - All checkout steps must run inside one Prisma transaction.
  - Details: Add or update focused order model functions that perform atomic checkout behavior without HTTP response handling.
  - Dependencies: (01A)
  - User Action: None
  - Agent Work: Implement a transaction helper in the existing order model path that consumes authenticated user id and validated shipping address.
  - Specific Steps:
    1. Expand `backend/src/models/order.model.js` instead of creating a second order data-access module.
    2. Load the user's cart with items and product data inside the transaction or in a transaction-safe flow.
    3. Reject missing/empty carts before creating any order rows.
    4. Validate every cart item quantity against current product quantity.
    5. Calculate total from cart item `unitPrice` times quantity using Decimal-safe Prisma values.
    6. Create the `Order` with `status: "pending"` and the provided `shippingAddress`.
    7. Create matching `OrderDetail` records using cart item product ids, quantities, and captured unit prices.
    8. Decrement each product's `quantity` only after validation passes.
    9. Create one `Payment` with `paymentMethod: "COD"`, `paymentStatus: "unpaid"`, `amount` equal to the order total, and `paymentDate: null`.
    10. Delete cart items only after order/detail/payment/stock writes are ready to commit.
    11. Return an order shape that can include details, product summaries, and payment data for the controller response.
  - Output: Atomic checkout transaction helper.
  - Acceptance: The helper is reusable from the order controller, does not duplicate Prisma client setup, and does not mix HTTP response logic into the model.
  - Validation: `cd backend && npx prisma validate`; targeted API smoke through Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live transaction validation needs missing real `backend/.env`, seeded data, or credentials.
  - Files: `backend/src/models/order.model.js`, optionally `backend/src/models/orderDetail.model.js`, `backend/src/models/payment.model.js`

- [x] (01C): Implement order read and access-filter helpers
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.6 OrderController`
  - Source Requirements:
    - `GET /api/orders/my-orders` returns only orders for the authenticated customer and sorts newest first.
    - `GET /api/orders/:id` lets a customer access only their own order and lets an admin access any order.
    - Order detail responses include details, product summary, and payment.
    - `GET /api/admin/orders` requires admin, supports a simple optional `status` filter, and sorts newest first.
  - Details: Add reusable model helpers for customer lists, scoped detail reads, and admin lists.
  - Dependencies: (01A)
  - User Action: None
  - Agent Work: Implement focused order read helpers that enforce access filters at the query/helper level where practical.
  - Specific Steps:
    1. Expand `backend/src/models/order.model.js` with `listByUser`, `findOwnedOrAdminVisible`, and `listForAdmin` or equivalent local naming.
    2. Include order details with product name/brand summary and payment data.
    3. Sort customer and admin lists by newest first.
    4. Add a simple admin status filter only for valid status values.
    5. Avoid returning unrelated user secrets or password hashes in included customer data.
  - Output: Order read helpers for customer and admin controller actions.
  - Acceptance: Customer reads cannot leak another customer's order and admin reads can access all orders through admin-only controllers.
  - Validation: Batch06 API smoke tests for own-order, other-customer-denied, and admin-read behavior.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live validation needs missing test users/orders/admin credentials.
  - Files: `backend/src/models/order.model.js`

- [x] (01D): Implement order status and payment update helpers
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.3 Order Status API`; `docs/plans/Plan_3.md` > `### 7.4 Payment API`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.7 PaymentController`
  - Source Requirements:
    - Admin status updates accept only `pending`, `confirmed`, `shipping`, `completed`, and `cancelled`.
    - When status becomes `completed`, the COD payment status must become `paid` and `paymentDate` must be set.
    - When status becomes `cancelled`, stock must not be automatically restored unless a documented and tested rule is added; for this project, cancellation stays simple and visible.
    - `POST /api/payments/cod` must not create a second payment for an order that already has one.
  - Details: Add model helpers for status transitions, completed-payment side effects, and idempotent COD payment lookup/creation behavior.
  - Dependencies: (01B), (01C)
  - User Action: None
  - Agent Work: Implement backend-owned status and payment helpers without introducing online payment behavior.
  - Specific Steps:
    1. Keep allowed order status values in one small local constant or reuse an existing validator if one exists.
    2. Add an order status update helper that rejects unknown statuses before writing.
    3. Update order status and payment side effects in a transaction when the target status is `completed`.
    4. Keep cancellation simple: update status without implicit stock restoration.
    5. Expand `backend/src/models/payment.model.js` with a COD helper that returns an existing payment or creates one only when no payment exists and the order is valid for COD.
    6. Do not add gateway tokens, card fields, online payment simulation, or external provider calls.
  - Output: Order status update and COD payment model helpers.
  - Acceptance: Status logic is centralized, COD payment side effects are deterministic, and duplicate payment records are prevented.
  - Validation: Batch06 API smoke tests for valid/invalid status update, completed payment update, and idempotent COD endpoint behavior.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live validation needs missing orders/admin credentials.
  - Files: `backend/src/models/order.model.js`, `backend/src/models/payment.model.js`

### Files or Modules Likely Created or Updated

- `backend/src/models/order.model.js`
- `backend/src/models/orderDetail.model.js`
- `backend/src/models/payment.model.js`
- `backend/src/models/cart.model.js` only if existing cart helpers need a safe, shared query extraction
- `backend/src/models/product.model.js` only if an existing product helper needs a safe, shared stock-read extraction

### Required Outputs / Artifacts

- Atomic checkout transaction helper.
- Customer/admin order read helpers.
- Admin order status update helper.
- COD payment helper that prevents duplicate payment records.
- Reuse notes identifying existing backend patterns and placeholders.

### Acceptance Criteria

- Checkout data-access behavior is transaction-safe.
- Total amount and payment amount are calculated by the backend.
- Product stock decreases only after successful order creation.
- Cart items clear only after successful order creation.
- Customer order reads are scoped.
- Admin order reads and status updates have reusable helpers.
- COD payment creation is single-record/idempotent where applicable.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- Batch06 API smoke tests for checkout, empty cart, insufficient stock, own order read, another customer denied, admin list, admin status update, completed payment update, and COD endpoint.

### Explicit Non-Goals

- Backend route/controller implementation beyond what is needed to call model helpers.
- Online payment gateway behavior.
- Stock restoration on cancellation.
- Schema redesign or enum renaming.

## Mandatory Batch02 - Backend Order and Payment APIs

### Goal

Expose the Phase 3 order and payment behavior through Express controllers and routes using the existing MVC, auth, admin, validation, response, and error-handling conventions.

### Why this batch exists

Frontend checkout and admin order UI need a stable REST contract before view work begins. Backend APIs must enforce authentication, authorization, validation, and route mounting consistently.

### Inputs / Dependencies

- Batch01 model helpers.
- Existing Express app and route mounting.
- Existing `auth.middleware.js`, `admin.middleware.js`, `validation.middleware.js`, `error.middleware.js`, and `response.js`.

### Tasks

- [x] (02A): Implement order controller request handling
  - Source of Truth: `docs/plans/Plan_3.md` > `## 4. Scope`; `docs/plans/Plan_3.md` > `### 7.1 Order Creation API`; `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.6 OrderController`
  - Source Requirements:
    - Implement `POST /api/orders`.
    - Implement `GET /api/orders/my-orders`.
    - Implement `GET /api/orders/:id`.
    - Validate shipping address for checkout.
    - Return consistent success/error responses.
  - Details: Add `order.controller.js` methods that delegate business/data behavior to Batch01 helpers.
  - Dependencies: Batch01
  - User Action: None
  - Agent Work: Implement controller actions for customer checkout and customer/admin order reads.
  - Specific Steps:
    1. Search current controllers for async error-handling and response helper patterns.
    2. Create or update `backend/src/controllers/order.controller.js`.
    3. Validate `shippingAddress` as required for checkout and keep optional note/full name/phone behavior out unless already supported by schema and source.
    4. Use authenticated user id from existing auth middleware.
    5. Return 400 for empty cart, insufficient stock, invalid payload, or invalid status where applicable.
    6. Return 401/403/404 through existing conventions for auth/access/not-found behavior.
    7. Avoid printing request bodies, JWTs, credentials, or sensitive user fields.
  - Output: Order controller actions.
  - Acceptance: Controller methods are thin HTTP orchestration layers and do not duplicate transaction logic.
  - Validation: Batch06 order API smoke tests.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live API validation needs missing backend `.env`, seeded data, or credentials.
  - Files: `backend/src/controllers/order.controller.js`, optionally `backend/src/controllers/index.js`

- [x] (02B): Implement admin order status controller behavior
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Plan_3.md` > `### 7.3 Order Status API`
  - Source Requirements:
    - Implement `GET /api/admin/orders`.
    - Implement `PUT /api/admin/orders/:id/status`.
    - Admin order routes require admin middleware.
    - Unknown statuses are rejected.
    - Completed orders mark COD payment as `paid` and set `paymentDate`.
  - Details: Add admin controller actions for list and status update while keeping authorization in route middleware.
  - Dependencies: (02A), (01C), (01D)
  - User Action: None
  - Agent Work: Implement admin list and status controller methods that call Batch01 helpers.
  - Specific Steps:
    1. Add admin list action with optional simple status query support.
    2. Add status update action using the shared allowed-status helper or model validation.
    3. Ensure the completed status path returns updated payment data when available.
    4. Keep cancellation simple and visible without implicit stock restoration.
    5. Return clear errors for invalid status, not-found order, and unauthorized access.
  - Output: Admin order list and status controller actions.
  - Acceptance: Admin order APIs expose required behavior and reject invalid status values.
  - Validation: Batch06 admin order API smoke tests.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live admin validation needs missing credentials or orders.
  - Files: `backend/src/controllers/order.controller.js`

- [x] (02C): Implement explicit COD payment controller behavior
  - Source of Truth: `docs/plans/Plan_3.md` > `## 4. Scope`; `docs/plans/Plan_3.md` > `### 7.4 Payment API`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.7 PaymentController`
  - Source Requirements:
    - Implement `POST /api/payments/cod`.
    - Prefer creating COD payment inside `POST /api/orders`.
    - The explicit endpoint may return the existing payment for an order.
    - The endpoint must not create a second payment for an order that already has one.
  - Details: Add `payment.controller.js` only for the explicit COD endpoint and keep it scoped to COD/demo completeness.
  - Dependencies: (01D)
  - User Action: None
  - Agent Work: Implement the controller method using the payment model helper.
  - Specific Steps:
    1. Create or update `backend/src/controllers/payment.controller.js`.
    2. Validate required `orderId`.
    3. Verify the order exists and is accessible under the route policy selected by the implementation.
    4. Return existing COD payment if one exists.
    5. Create a payment only if the order has no payment and the helper confirms COD is valid.
    6. Do not add any online payment provider integration.
  - Output: Explicit COD payment controller action.
  - Acceptance: `POST /api/payments/cod` is safe, idempotent for existing payments, and limited to COD.
  - Validation: Batch06 payment endpoint smoke test.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live validation needs missing order data or credentials.
  - Files: `backend/src/controllers/payment.controller.js`, optionally `backend/src/controllers/index.js`

- [x] (02D): Add order/payment routes and mount them under `/api`
  - Source of Truth: `docs/plans/Plan_3.md` > `## 4. Scope`; `docs/plans/Plan_3.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_3.md` > `## 8. Implementation Steps`; `docs/plans/Master_Plan.md` > `## 15. API Design Summary`
  - Source Requirements:
    - Add order and payment routes.
    - Mount `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/:id`, `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status`, and `POST /api/payments/cod`.
    - Customer order routes require auth middleware.
    - Admin order routes require admin middleware.
  - Details: Wire Express route files and route indexes without changing unrelated endpoint paths.
  - Dependencies: (02A), (02B), (02C)
  - User Action: None
  - Agent Work: Add route files and mount them through the existing backend route/app structure.
  - Specific Steps:
    1. Search existing route files for route composition and admin path patterns.
    2. Create `backend/src/routes/order.routes.js` and `backend/src/routes/payment.routes.js`.
    3. Apply auth middleware to customer checkout/order read/payment routes.
    4. Apply admin middleware to admin list/status routes.
    5. Mount route files in the existing route index or app mounting path so final URLs match Plan 3.
    6. Run route searches to confirm no duplicate paths are registered.
  - Output: Mounted order and payment REST APIs.
  - Acceptance: Endpoint paths match Plan 3 and use the correct auth/admin protections.
  - Validation: Batch06 API smoke tests for all order/payment endpoints.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live route smoke tests need missing env/server/data/credentials.
  - Files: `backend/src/routes/order.routes.js`, `backend/src/routes/payment.routes.js`, `backend/src/routes/index.js`, `backend/src/app.js` if that is the existing mounting location

### Files or Modules Likely Created or Updated

- `backend/src/controllers/order.controller.js`
- `backend/src/controllers/payment.controller.js`
- `backend/src/controllers/index.js`
- `backend/src/routes/order.routes.js`
- `backend/src/routes/payment.routes.js`
- `backend/src/routes/index.js`
- `backend/src/app.js` only if the existing mounting pattern requires it
- `backend/src/middlewares/validation.middleware.js` only if a shared validation helper already exists and needs extension

### Required Outputs / Artifacts

- Order controller.
- Payment controller.
- Mounted order routes.
- Mounted payment routes.
- Auth/admin-protected API surface matching Plan 3.

### Acceptance Criteria

- Customer checkout and order read endpoints require authentication.
- Admin list and status update endpoints require admin authorization.
- Endpoint paths match Plan 3 exactly.
- Invalid payloads and statuses fail cleanly.
- Controller code delegates data/transaction behavior to models.
- No online payment behavior is added.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- `cd backend && npm run dev`
- HTTP smoke tests for all order/payment endpoints in Batch06.
- Authorization smoke tests for anonymous, customer, and admin users.

### Explicit Non-Goals

- Frontend API helpers or views.
- Report/review/shipping/email/online-payment routes.
- Schema redesign.

## Mandatory Batch03 - Frontend API, Routing, and Cart Refresh

### Goal

Add the frontend API, route, navigation, and cart-refresh plumbing needed for customer checkout/order pages and admin order pages while reusing existing frontend state and API patterns.

### Why this batch exists

Views should be built on stable API helpers and routes. This batch prevents customer/admin UI work from inventing its own fetch logic, auth handling, cart state, or route guards.

### Inputs / Dependencies

- Batch02 API endpoints.
- Existing `frontend/src/api/apiClient.js`, `frontend/src/api/cartApi.js`, `frontend/src/contexts/CartContext.jsx`, `frontend/src/contexts/AuthContext.jsx`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/layouts/MainLayout.jsx`, and `frontend/src/layouts/AdminLayout.jsx`.

### Tasks

- [ ] (03A): Add order and payment API helpers using the existing API client pattern
  - Source of Truth: `docs/plans/Plan_3.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `README.md` > `## Phase 3 Handoff Contract`
  - Source Requirements:
    - Add `orderApi.js` and `paymentApi.js`.
    - Use existing REST helper pattern and `VITE_API_BASE_URL` behavior.
    - Frontend must call backend APIs and must not access the database directly.
  - Details: Provide focused frontend helper functions for checkout, customer order reads, admin order reads/status updates, and optional COD payment endpoint.
  - Dependencies: Batch02
  - User Action: None
  - Agent Work: Implement frontend API helper modules without duplicating base fetch/token logic.
  - Specific Steps:
    1. Search existing API helper modules for naming, token, error, and response conventions.
    2. Create `frontend/src/api/orderApi.js` with functions for create order, list my orders, get order detail, list admin orders, and update admin order status.
    3. Create `frontend/src/api/paymentApi.js` only for `POST /api/payments/cod` if the backend endpoint is implemented.
    4. Use the existing `apiClient.js` for all HTTP calls.
    5. Keep API helpers free of UI state and database logic.
  - Output: Order/payment frontend API helper modules.
  - Acceptance: API helpers follow existing local patterns and contain no duplicate fetch client or direct database access.
  - Validation: `rg "DATABASE_URL|DIRECT_URL|prisma|supabase|from\\(|select\\(" frontend/src`; Batch06 frontend smoke tests.
  - Blocked Condition: None for helper creation; live API validation can be blocked later by missing backend setup.
  - Files: `frontend/src/api/orderApi.js`, `frontend/src/api/paymentApi.js`, `frontend/src/api/apiClient.js` only if a small existing-client extension is required

- [ ] (03B): Wire protected customer and admin order routes
  - Source of Truth: `docs/plans/Plan_3.md` > `## 4. Scope`; `docs/plans/Plan_3.md` > `## 6. Target Directory Structure`; `docs/design/design.md` > `# 24. Page-to-Component Map`
  - Source Requirements:
    - Build `CheckoutView`, `OrderHistoryView`, `OrderDetailView`, and `AdminOrderView`.
    - Wire route protection for checkout/order pages.
    - Admin order view uses existing admin layout/guard patterns.
  - Details: Add route entries and navigation hooks before full UI implementation, using placeholders only when needed until Batch04/Batch05 fills views.
  - Dependencies: (03A)
  - User Action: None
  - Agent Work: Update route configuration and navigation entries to expose Plan 3 pages through existing layouts and guards.
  - Specific Steps:
    1. Search `frontend/src/routes/AppRoutes.jsx` and layout files for route guard and navigation patterns.
    2. Add customer routes for `/checkout`, `/orders`, and `/orders/:id`.
    3. Add admin route for `/admin/orders`.
    4. Ensure customer routes require authenticated users and admin route requires admin users.
    5. Keep route paths compatible with existing cart checkout links and existing "My Orders" navigation entry.
    6. Add temporary imports only for actual view files created in Batch04/Batch05 or create minimal placeholders that those batches will replace.
  - Output: Protected frontend route entries and navigation alignment.
  - Acceptance: Route guards follow existing auth/admin patterns and do not expose admin orders to customers.
  - Validation: Browser/manual route guard checks in Batch06.
  - Blocked Condition: None
  - Files: `frontend/src/routes/AppRoutes.jsx`, `frontend/src/layouts/MainLayout.jsx`, `frontend/src/layouts/AdminLayout.jsx`, placeholder view files only if required by imports

- [ ] (03C): Define post-checkout cart refresh and order status constants
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.1 Order Creation API`; `docs/plans/Plan_3.md` > `### 7.3 Order Status API`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `README.md` > `## Phase 3 Handoff Contract`
  - Source Requirements:
    - Cart items are cleared after successful checkout.
    - Frontend cart state should refresh after checkout.
    - Status selector must use the same status values as the backend enum.
    - React must not calculate totals as source-of-truth.
  - Details: Add only the minimal shared frontend constants/utilities needed to avoid status duplication and stale cart badges.
  - Dependencies: (03A), (03B)
  - User Action: None
  - Agent Work: Reuse `CartContext` and add small status constants only if no equivalent exists.
  - Specific Steps:
    1. Search for existing status badge, status constant, cart refresh, and cart clear behavior.
    2. Expose or reuse a `refreshCart`/`loadCart` style action from `CartContext` after successful checkout.
    3. Add a minimal order status constant or local module only if status values are not already centralized.
    4. Ensure status constants exactly match backend enum values.
    5. Do not add frontend total calculation as business truth; display returned backend totals.
  - Output: Cart refresh path and status-value source for views.
  - Acceptance: Checkout success can refresh the cart badge/state and admin status controls use backend-compatible values.
  - Validation: Batch06 checkout UI smoke test and status update smoke test.
  - Blocked Condition: None
  - Files: `frontend/src/contexts/CartContext.jsx`, `frontend/src/components/order/`, `frontend/src/components/admin/`, or a small existing utility/constants file if local patterns support one

### Files or Modules Likely Created or Updated

- `frontend/src/api/orderApi.js`
- `frontend/src/api/paymentApi.js`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/layouts/MainLayout.jsx`
- `frontend/src/layouts/AdminLayout.jsx`
- `frontend/src/contexts/CartContext.jsx`
- `frontend/src/views/CheckoutView.jsx`
- `frontend/src/views/OrderHistoryView.jsx`
- `frontend/src/views/OrderDetailView.jsx`
- `frontend/src/views/admin/AdminOrderView.jsx`

### Required Outputs / Artifacts

- Order/payment frontend API helpers.
- Protected checkout/order/admin-order route entries.
- Cart refresh path after checkout.
- Shared or locally reusable order/payment status values.

### Acceptance Criteria

- Frontend API helpers use `apiClient.js`.
- Customer checkout/order pages require authentication.
- Admin order page requires admin authorization.
- Cart state can refresh after successful checkout.
- Status values match backend enums.
- Frontend does not import Prisma, Supabase database logic, SQL, or backend-only env names.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Route guard browser/manual checks.
- Search frontend source for forbidden database access.
- Batch06 customer checkout and admin status UI smoke tests.

### Explicit Non-Goals

- Full visual UI implementation; that belongs to Batch04 and Batch05.
- Frontend source-of-truth total calculation.
- New auth provider or second API client.

## Mandatory Batch04 - Customer Checkout and Order UI

### Goal

Build customer-facing checkout, order history, and order detail experiences with Astryx components, backend order APIs, existing auth/cart state, and design-document UI states.

### Why this batch exists

Customers need to complete the demo flow from cart to checkout success and then inspect their orders. This UI must consume backend totals, cart state, and order APIs rather than duplicating business behavior in React.

### Inputs / Dependencies

- Batch03 frontend API helpers, routes, and cart-refresh behavior.
- Existing `CartContext`, `AuthContext`, `MainLayout`, cart UI, product detail/cart flows, and route guards.
- `docs/design/design.md` checkout and order components.

### Tasks

- [ ] (04A): Run Astryx discovery and establish customer order component choices
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `# 11. Checkout Components`; `docs/design/design.md` > `# 12. Order Components`; `AGENTS.md` > `# ASTRYX`
  - Source Requirements:
    - Use `docs/design/design.md` checkout/order component maps.
    - Use Astryx forms, tables, dialogs, badges, cards, loading, empty, and error states.
    - Follow Astryx discovery workflow before writing UI.
  - Details: Choose concrete Astryx components/templates before building customer order views.
  - Dependencies: Batch03
  - User Action: None
  - Agent Work: Run Astryx discovery commands or record a tooling failure, then apply existing local UI patterns.
  - Specific Steps:
    1. Run `npx astryx build "checkout order history order detail"`.
    2. Inspect relevant templates returned by the build command using `npx astryx template <name>` or `--skeleton`.
    3. Inspect props for Astryx components used by checkout form, order summary, table/list, badges, dialog, loading, empty, and error states.
    4. Compare against existing product/cart/customer components for local style and state patterns.
    5. Record unavailable Astryx command/tooling as a safe implementation note if the CLI cannot run locally.
  - Output: Customer UI component approach for checkout and order pages.
  - Acceptance: Execution notes identify Astryx references and local patterns before UI files are built.
  - Validation: Command output or safe tooling-failure note plus code review against design sections.
  - Blocked Condition: None unless Astryx package is missing and cannot be installed without user action; then record `BLOCKED_BY_USER_ACTION` for live Astryx validation only.
  - Files: No required code changes unless the implementation records notes in the execution report.

- [ ] (04B): Build checkout form, order summary, and success flow
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.1 Order Creation API`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `# 11. Checkout Components`; `docs/design/design.md` > `## 24.7 Checkout Page`; `docs/design/design.md` > `## 25.3 Checkout Page States`
  - Source Requirements:
    - `CheckoutView` shows shipping address form, cart-derived order summary, COD-only payment method, submit button, loading state, validation error state, and success dialog.
    - Checkout uses backend order creation and backend totals.
    - Cart state refreshes after successful checkout.
  - Details: Implement the customer checkout experience using existing cart state and new order API helpers.
  - Dependencies: (04A), Batch03
  - User Action: Customer must have a live authenticated session and cart items for full manual validation.
  - Agent Work: Build checkout components/view and connect them to backend checkout API.
  - Specific Steps:
    1. Create or update `frontend/src/views/CheckoutView.jsx`.
    2. Create focused checkout components only if existing cart/common components cannot be reused cleanly.
    3. Show cart items, quantities, unit prices, subtotal/total returned by backend cart/order data.
    4. Validate required shipping address before submit.
    5. Display COD as the only payment method.
    6. Disable submit and show loading while checkout is in progress.
    7. Show backend validation/API errors clearly.
    8. On success, refresh cart state and show a success dialog with order id, view-order action, and continue-shopping action.
    9. Redirect or disable checkout when the cart is empty.
  - Output: Customer checkout view and supporting components.
  - Acceptance: Checkout UI can submit a valid order and handles loading, validation error, API error, empty cart, and success states.
  - Validation: `cd frontend && npm run dev`; Browser/manual checkout smoke test in Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live checkout validation needs missing backend server, database, seeded data, or authenticated customer credentials.
  - Files: `frontend/src/views/CheckoutView.jsx`, `frontend/src/components/checkout/CheckoutForm.jsx`, `frontend/src/components/checkout/CheckoutOrderSummary.jsx`, `frontend/src/components/checkout/CheckoutSuccessDialog.jsx`, reusable existing cart/common components if reused

- [ ] (04C): Build order history view
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `# 12. Order Components`; `docs/design/design.md` > `## 24.8 Order History Page`; `docs/design/design.md` > `# 23. Status Components`
  - Source Requirements:
    - `OrderHistoryView` shows order list/table with status badge, payment badge, total, created date, and detail link.
    - Customer order list uses authenticated customer order API.
    - Loading, empty, error, and success states must be visible.
  - Details: Implement a customer order list that consumes `GET /api/orders/my-orders`.
  - Dependencies: (04A), (03A), (03B)
  - User Action: Customer must have live orders for a complete non-empty validation path.
  - Agent Work: Build order history components/view with backend data and route links to order detail.
  - Specific Steps:
    1. Create `frontend/src/views/OrderHistoryView.jsx`.
    2. Create `OrderHistoryTable` or reuse an existing table/list pattern if suitable.
    3. Add `OrderStatusBadge` and `PaymentStatusBadge` or reuse existing badge helpers if they already exist.
    4. Fetch orders with the order API helper on authenticated page load.
    5. Display total, status, payment status, created date, and detail action.
    6. Handle loading, empty, API error, and permission denied states.
  - Output: Customer order history view and supporting order components.
  - Acceptance: Authenticated customers can see their own orders and navigate to detail pages without direct database access.
  - Validation: `cd frontend && npm run dev`; Browser/manual order history smoke test in Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live validation needs missing backend server, data, or customer credentials.
  - Files: `frontend/src/views/OrderHistoryView.jsx`, `frontend/src/components/order/OrderStatusBadge.jsx`, `frontend/src/components/order/PaymentStatusBadge.jsx`, `frontend/src/components/order/OrderItem.jsx` or equivalent table/list component

- [ ] (04D): Build order detail view
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `## 12.2 OrderDetailPanel`; `docs/design/design.md` > `## 24.9 Order Detail Page`
  - Source Requirements:
    - `OrderDetailView` shows shipping address, order items, order status, payment status, and total.
    - Customer can access only their own order detail.
    - View consumes backend order detail API and does not calculate business totals.
  - Details: Implement the customer order detail screen using backend order detail response data.
  - Dependencies: (04A), (04C)
  - User Action: Customer must have a live order id for complete validation.
  - Agent Work: Build order detail panel/view and handle access/API states.
  - Specific Steps:
    1. Create `frontend/src/views/OrderDetailView.jsx`.
    2. Create `OrderDetailPanel` or reuse an existing panel/table pattern.
    3. Fetch order detail by route param using `orderApi`.
    4. Display shipping address, order metadata, order items, product summary, quantities, prices, backend total, payment method/status, and order status.
    5. Handle loading, not found, permission denied, and API error states.
    6. Provide navigation back to order history or catalog using existing layout/navigation patterns.
  - Output: Customer order detail view and supporting components.
  - Acceptance: Customers can inspect an order returned by the backend and cannot see another customer's order through the UI/API flow.
  - Validation: `cd frontend && npm run dev`; Browser/manual order detail smoke test in Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live validation needs missing backend server, order data, or credentials.
  - Files: `frontend/src/views/OrderDetailView.jsx`, `frontend/src/components/order/OrderDetailPanel.jsx`, existing status badge components

### Files or Modules Likely Created or Updated

- `frontend/src/views/CheckoutView.jsx`
- `frontend/src/views/OrderHistoryView.jsx`
- `frontend/src/views/OrderDetailView.jsx`
- `frontend/src/components/checkout/CheckoutForm.jsx`
- `frontend/src/components/checkout/CheckoutOrderSummary.jsx`
- `frontend/src/components/checkout/CheckoutSuccessDialog.jsx`
- `frontend/src/components/order/OrderDetailPanel.jsx`
- `frontend/src/components/order/OrderItem.jsx`
- `frontend/src/components/order/OrderStatusBadge.jsx`
- `frontend/src/components/order/PaymentStatusBadge.jsx`
- `frontend/src/contexts/CartContext.jsx`
- `frontend/src/routes/AppRoutes.jsx`

### Required Outputs / Artifacts

- Checkout page.
- Customer order history page.
- Customer order detail page.
- Checkout/order components aligned with Astryx and design document.
- Loading, empty, validation error, API error, permission denied, and success states.

### Acceptance Criteria

- Customer can place a COD order from a non-empty cart.
- Customer sees checkout success and cart state refreshes.
- Customer can view order history and order detail.
- Customer UI displays backend order totals and payment/order statuses.
- Frontend does not become source of truth for totals or stock.
- Astryx components/tokens and design-document mappings are followed.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser/manual checkout success flow.
- Browser/manual checkout empty/error state checks.
- Browser/manual order history and detail checks.
- Search frontend source for forbidden database access and raw backend-only config exposure.

### Explicit Non-Goals

- Admin order management UI.
- Online payment flow.
- Shipping provider integration.
- Product reviews.
- Reports.

## Mandatory Batch05 - Admin Order Management UI

### Goal

Build the admin order management page with order listing, status filtering/updating, detail dialog, and status/payment badges using existing admin layout and backend admin order APIs.

### Why this batch exists

The Phase 3 admin demo requires admins to view orders and update order status. This UI should be a thin admin view over backend-owned order/payment behavior.

### Inputs / Dependencies

- Batch03 frontend API helpers and admin route.
- Batch04 shared order status/payment badge components if available.
- Existing `AdminLayout`, admin route guard, admin navigation, and admin table/form patterns.

### Tasks

- [ ] (05A): Run Astryx discovery and establish admin order component choices
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `# 17. Admin Order Components`; `docs/design/design.md` > `## 24.15 Admin Orders Page`; `AGENTS.md` > `# ASTRYX`
  - Source Requirements:
    - `AdminOrderView` shows order table with customer, status, total, created date, detail dialog, and status selector.
    - Use Astryx tables, dialogs, badges, loading, empty, and error states.
    - Status selector uses backend enum values.
  - Details: Choose concrete Astryx components/templates before building admin order UI.
  - Dependencies: Batch03
  - User Action: None
  - Agent Work: Run Astryx discovery commands or record a tooling failure, then follow existing admin UI patterns.
  - Specific Steps:
    1. Run `npx astryx build "admin orders table status selector order detail"`.
    2. Inspect relevant templates returned by the build command.
    3. Inspect props for table, selector, dialog, badge, toolbar, loading, empty, and error components used.
    4. Compare against existing `AdminProductView`, `AdminCategoryView`, and `AdminTable` patterns.
    5. Record unavailable Astryx command/tooling as a safe implementation note if the CLI cannot run locally.
  - Output: Admin order UI component approach.
  - Acceptance: Execution notes identify Astryx references and existing admin patterns before UI files are built.
  - Validation: Command output or safe tooling-failure note plus code review against design sections.
  - Blocked Condition: None unless Astryx package is missing and cannot be installed without user action; then record `BLOCKED_BY_USER_ACTION` for live Astryx validation only.
  - Files: No required code changes unless the implementation records notes in the execution report.

- [ ] (05B): Build admin order table and filters
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `## 17.1 AdminOrderTable`; `docs/design/design.md` > `## 24.15 Admin Orders Page`; `docs/design/design.md` > `## 25.4 Admin Table States`
  - Source Requirements:
    - `AdminOrderView` shows order table with customer, status, total, created date, and action controls.
    - Admin list API supports optional simple status filter if simple.
    - Loading, empty, error, and success states must be visible.
  - Details: Implement the admin order list view over `GET /api/admin/orders`.
  - Dependencies: (05A), (03A), (03B)
  - User Action: Admin credentials and seeded orders are required for complete live validation.
  - Agent Work: Build admin order table UI and optional status filter with backend data.
  - Specific Steps:
    1. Create `frontend/src/views/admin/AdminOrderView.jsx`.
    2. Reuse `AdminTable` or existing admin table primitives if they fit the order table.
    3. Fetch admin orders with the order API helper.
    4. Display customer summary, status, payment status, total, created date, and actions.
    5. Add a simple status filter only if the backend supports it cleanly.
    6. Handle loading, empty, API error, and permission denied states.
  - Output: Admin orders table/list view.
  - Acceptance: Admins can see orders through the backend admin API and non-admin users cannot access the page.
  - Validation: `cd frontend && npm run dev`; Browser/manual admin order list smoke test in Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live validation needs missing backend server, admin credentials, or order data.
  - Files: `frontend/src/views/admin/AdminOrderView.jsx`, `frontend/src/components/admin/AdminTable.jsx` only if safe extension is needed, `frontend/src/components/order/`

- [ ] (05C): Build admin order detail dialog
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `## 17.3 AdminOrderDetailDialog`
  - Source Requirements:
    - Admin order view includes a detail dialog.
    - Detail dialog shows customer information, shipping address, payment information, order items, and order status.
    - Admin can access any order detail through the backend.
  - Details: Add an admin detail dialog that reuses customer order detail components where sensible.
  - Dependencies: (05B), (04D)
  - User Action: Admin credentials and orders are required for complete live validation.
  - Agent Work: Build detail dialog behavior and consume order detail API data.
  - Specific Steps:
    1. Reuse `OrderDetailPanel` if it is not customer-specific.
    2. Create `AdminOrderDetailDialog` only for admin-specific dialog shell and customer metadata.
    3. Load order detail by id when the admin opens the action.
    4. Display order items, customer summary, shipping address, status, payment status, and totals.
    5. Handle dialog loading, error, and empty/not-found states.
  - Output: Admin order detail dialog.
  - Acceptance: Admins can inspect order details without duplicating customer detail rendering unnecessarily.
  - Validation: Browser/manual admin order detail smoke test in Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live validation needs missing backend server, admin credentials, or order data.
  - Files: `frontend/src/components/admin/AdminOrderDetailDialog.jsx`, `frontend/src/components/order/OrderDetailPanel.jsx`

- [ ] (05D): Build admin order status selector and refresh behavior
  - Source of Truth: `docs/plans/Plan_3.md` > `### 7.3 Order Status API`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `## 17.2 OrderStatusSelector`; `docs/design/design.md` > `# 23. Status Components`
  - Source Requirements:
    - Status selector uses `pending`, `confirmed`, `shipping`, `completed`, and `cancelled`.
    - Updating status to `completed` marks COD payment as `paid` in backend behavior.
    - Admin UI shows success/error feedback.
  - Details: Add status update controls that call `PUT /api/admin/orders/:id/status` and refresh order rows/detail state after success.
  - Dependencies: (05B), (05C), (03C)
  - User Action: Admin credentials and mutable orders are required for complete live validation.
  - Agent Work: Implement status selector, update call, optimistic or post-save refresh behavior, and user feedback.
  - Specific Steps:
    1. Reuse shared order status constants from Batch03.
    2. Create `OrderStatusSelect` or update the planned `OrderStatusSelector` component.
    3. Call the order API status update helper on change/submit.
    4. Disable row controls while status update is pending.
    5. Refresh the row/detail state after success.
    6. Show success/error feedback without exposing backend internals.
    7. Verify `completed` status displays payment as `paid` after backend response/refresh.
  - Output: Admin status selector and refresh behavior.
  - Acceptance: Admins can update order status and see refreshed status/payment state.
  - Validation: Browser/manual admin status update smoke test in Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live validation needs missing backend server, admin credentials, or mutable order data.
  - Files: `frontend/src/components/admin/OrderStatusSelect.jsx`, `frontend/src/views/admin/AdminOrderView.jsx`, shared status badge/constant files

### Files or Modules Likely Created or Updated

- `frontend/src/views/admin/AdminOrderView.jsx`
- `frontend/src/components/admin/AdminOrderDetailDialog.jsx`
- `frontend/src/components/admin/OrderStatusSelect.jsx`
- `frontend/src/components/admin/AdminTable.jsx` only if safe extension is needed
- `frontend/src/components/order/OrderStatusBadge.jsx`
- `frontend/src/components/order/PaymentStatusBadge.jsx`
- `frontend/src/components/order/OrderDetailPanel.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/layouts/AdminLayout.jsx`

### Required Outputs / Artifacts

- Admin order management page.
- Admin orders table with status/payment/customer/total/date/action columns.
- Admin order detail dialog.
- Admin order status selector.
- Loading, empty, error, success, pending-update, and permission-denied states.

### Acceptance Criteria

- Admin can list all orders.
- Admin can inspect order detail.
- Admin can update order status.
- Completed status reflects paid COD payment after backend response.
- Customer/anonymous users cannot access admin orders.
- UI uses Astryx components/tokens and existing admin patterns.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser/manual admin order list smoke test.
- Browser/manual admin order detail smoke test.
- Browser/manual admin status update smoke test.
- Admin/customer/anonymous route guard checks.

### Explicit Non-Goals

- Reports, charts, review moderation, refunds, shipping integrations, or online payments.
- Frontend-only status mutation without backend persistence.
- New admin layout or auth provider.

## Mandatory Batch06 - Verification, Security Audit, and Phase 4 Handoff

### Goal

Verify Phase 3 backend APIs, frontend flows, security boundaries, MVC separation, Astryx compliance, progress tracking, and Phase 4 handoff notes.

### Why this batch exists

Phase 4 reviews/reports/testing/documentation depend on verified order/payment records, stable order status/payment status values, and a completed checkout/admin-order flow.

### Inputs / Dependencies

- Batch01 through Batch05 outputs.
- User-provided real backend `.env`, database setup, seeded data, and admin/customer credentials for live API/UI validation.

### Tasks

- [ ] (06A): Run backend command checks and order/payment API smoke tests
  - Source of Truth: `docs/plans/Plan_3.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_3.md` > `### 7.1 Order Creation API`; `docs/plans/Plan_3.md` > `### 7.2 Order Read APIs`; `docs/plans/Plan_3.md` > `### 7.3 Order Status API`; `docs/plans/Plan_3.md` > `### 7.4 Payment API`
  - Source Requirements:
    - Run backend validation/startup commands.
    - Smoke test all order and payment endpoints.
    - Checkout creates an order, order details, and COD payment.
    - Product stock decreases after successful checkout.
    - Cart items clear after successful checkout.
    - Empty cart and insufficient stock fail cleanly.
    - Customer can view own orders and cannot view another customer's order.
    - Admin can list all orders and update status.
    - Completed status marks COD payment as `paid`.
  - Details: Prove the backend API contract and access-control behavior through local commands and HTTP checks.
  - Dependencies: Batch01, Batch02
  - User Action: User must provide real backend `.env`, running Supabase PostgreSQL, seeded products/carts/orders, and safe test admin/customer credentials for full live checks.
  - Agent Work: Run backend commands and API smoke checks, or mark blocked items honestly with safe reasons.
  - Specific Steps:
    1. Run `cd backend && npx prisma validate`.
    2. Start backend with `cd backend && npm run dev` long enough to confirm startup.
    3. Login or otherwise obtain customer/admin auth through safe local test flow without printing tokens.
    4. Smoke test `POST /api/orders` with a non-empty cart.
    5. Verify created order details, COD payment, stock decrease, and cart clear behavior.
    6. Smoke test empty-cart checkout failure.
    7. Smoke test insufficient-stock checkout failure.
    8. Smoke test `GET /api/orders/my-orders`.
    9. Smoke test `GET /api/orders/:id` for own order, another customer's order denial, and admin detail access.
    10. Smoke test `GET /api/admin/orders` and optional status filter.
    11. Smoke test `PUT /api/admin/orders/:id/status`, including invalid status and `completed`.
    12. Smoke test `POST /api/payments/cod` idempotent/existing-payment behavior if the route is implemented.
    13. Summarize results without printing JWTs, passwords, or database connection strings.
  - Output: Backend/API validation evidence.
  - Acceptance: Commands and smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output and HTTP smoke-test summary.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if real env values, live database, backend server, seeded data, or test credentials are unavailable.
  - Files: Execution report, optional `docs/demo-checklist.md`

- [ ] (06B): Run frontend command checks and customer/admin UI smoke tests
  - Source of Truth: `docs/plans/Plan_3.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `docs/design/design.md` > `# 25. UI States`; `docs/design/design.md` > `# 26. Responsive Design`
  - Source Requirements:
    - Run frontend dev command.
    - Manually verify the customer demo flow from product detail to checkout success.
    - Customer order pages show loading, success, empty, and error states.
    - Admin order view can update status.
    - Admin order view uses the same status values as the backend.
  - Details: Verify the Phase 3 UI flows from browser/manual checks and command output.
  - Dependencies: Batch03, Batch04, Batch05, (06A)
  - User Action: User must provide running backend/API data and admin/customer login credentials for full live UI checks.
  - Agent Work: Run frontend commands and perform browser/manual UI smoke checks, or record blocked live checks honestly.
  - Specific Steps:
    1. Run `cd frontend && npm run dev`.
    2. Open product detail/cart and verify the route into checkout.
    3. Verify checkout form validation, COD-only payment display, backend total display, submit loading, error state, and success dialog.
    4. Verify cart badge/state refreshes after checkout.
    5. Open order history and verify loading, non-empty or empty, status badge, payment badge, total, date, and detail link.
    6. Open order detail and verify shipping, items, status, payment, and total display.
    7. Login as admin and verify admin orders list, detail dialog, status selector, and status update feedback.
    8. Verify admin/customer/anonymous route guard behavior for customer order and admin order routes.
    9. Verify desktop, tablet, and mobile usability where browser tooling is available.
  - Output: Frontend/UI validation evidence.
  - Acceptance: UI smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output, browser/manual smoke summary, and screenshot evidence if available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if backend, seeded data, login credentials, or browser tooling is unavailable.
  - Files: Execution report, optional `docs/demo-checklist.md`

- [ ] (06C): Audit security, MVC boundaries, anti-duplication, and Astryx compliance
  - Source of Truth: `docs/plans/Plan_3.md` > `## 3. Prerequisites from Prior Phases`; `docs/plans/Plan_3.md` > `## 5. Out of Scope`; `docs/plans/Plan_3.md` > `### 7.5 Frontend UI Contract`; `AGENTS.md` > `# Custom Rules & Workflows`; `README.md` > `## Phase 3 Handoff Contract`
  - Source Requirements:
    - Phase 3 must reuse existing foundation and Phase 2 artifacts.
    - UI must stay aligned with Astryx components and tokens.
    - Frontend must not connect directly to Supabase PostgreSQL.
    - No schema redesign, duplicate helpers, or out-of-scope feature implementation.
  - Details: Search and inspect the implementation for security leaks, duplicated core helpers, MVC boundary violations, and scope drift.
  - Dependencies: Batch01 through Batch05
  - User Action: None
  - Agent Work: Run focused searches and inspect files touched during Phase 3.
  - Specific Steps:
    1. Search for committed real `.env` files and credential-like strings.
    2. Search frontend source for `DATABASE_URL`, `DIRECT_URL`, Prisma imports, Supabase database URLs, SQL, and backend-only config names.
    3. Search backend for duplicate Prisma client exports, response helpers, JWT helpers, order/payment helper paths, and API client-like logic in controllers/models.
    4. Inspect controllers/models to confirm HTTP logic stays in controllers and data access/transactions stay in models.
    5. Inspect UI files for direct database calls and raw styling that violates Astryx/token rules.
    6. Search for out-of-scope online payment, shipping, email, refund, review, report, upload, or schema-redesign implementation added during Phase 3.
    7. Confirm files remain focused and split any broad mixed-responsibility file if needed.
  - Output: Security/MVC/duplication/scope audit result.
  - Acceptance: No secrets, direct frontend database access, duplicate core helpers, or out-of-scope behavior are present.
  - Validation: `rg`/grep search summaries and manual inspection notes.
  - Blocked Condition: None
  - Files: Execution report; changed source files only if fixes are needed.

- [ ] (06D): Update demo checklist, execution report, and Phase 4 handoff notes
  - Source of Truth: `docs/plans/Plan_3.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_3.md` > `## 10. Handoff Notes for Phase 4`; `docs/plans/Master_Plan.md` > `## 26. Final Submission Checklist`
  - Source Requirements:
    - Phase 4 must consume completed order and payment records, product/order relationships, auth/admin middleware, order/payment status enums, customer product detail view, and admin layout/table/dialog patterns.
    - Phase 4 must not recalculate revenue from frontend state.
    - Phase 4 must not create duplicate order/payment models or reporting-only schema copies.
    - Phase 4 must not add online payment behavior.
    - Phase 4 must not change checkout transaction behavior unless tests cover the full customer/admin order flow.
  - Details: Preserve validation evidence and handoff constraints for the next execution phase.
  - Dependencies: (06A), (06B), (06C)
  - User Action: User may need to confirm manual checks that cannot be performed by the agent, such as local browser observations, Supabase row checks, or unavailable credentials.
  - Agent Work: Update docs and reports with verified results, blocked items, and Phase 4 handoff artifacts.
  - Specific Steps:
    1. Update `docs/demo-checklist.md` with actual Phase 3 backend/API/frontend/admin/order check statuses.
    2. Write or update execution report entries for completed batches and blocked validations.
    3. Add Phase 4 handoff notes to README or an appropriate docs file without claiming unimplemented Phase 4 features.
    4. Name the order/payment/product/auth/admin/UI artifacts Phase 4 must reuse.
    5. Record blocked checks as `BLOCKED_BY_USER_ACTION` instead of completed.
    6. Synchronize this task file progress tracker if the execution workflow requires checklist updates.
  - Output: Updated demo checklist, execution report, and Phase 4 handoff notes.
  - Acceptance: Future Phase 4 agents can start review/report/testing work from verified Phase 3 artifacts and constraints.
  - Validation: Manual doc review against Plan 3 verification and handoff sections.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only for user-side manual checks or credential-dependent live validation.
  - Files: `docs/demo-checklist.md`, `README.md`, `docs/reports/report_3_execute_agent.md`, `docs/tasks/task_3.md`

### Files or Modules Likely Created or Updated

- `docs/demo-checklist.md`
- `README.md`
- `docs/reports/report_3_execute_agent.md`
- `docs/tasks/task_3.md`
- Runtime files only if validation finds defects requiring repair

### Required Outputs / Artifacts

- Backend command validation summary.
- Order/payment API smoke-test summary.
- Frontend command/UI smoke-test summary.
- Security/MVC/duplication/Astryx audit summary.
- Phase 4 handoff notes.

### Acceptance Criteria

- Backend and frontend commands pass or are explicitly blocked by user setup.
- Order/payment APIs satisfy Plan 3 behavior.
- Customer checkout/order UI and admin order UI are demoable or honestly blocked by missing setup.
- No secrets are exposed.
- MVC boundaries remain clear.
- Phase 4 handoff artifacts and rules are documented.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- `cd backend && npm run dev`
- Order/payment API smoke tests listed in Plan 3.
- `cd frontend && npm run dev`
- Browser/manual checks for checkout, order history, order detail, admin orders, and admin status update.
- Customer/admin/anonymous authorization checks.
- Security and forbidden-import searches.

### Explicit Non-Goals

- Implementing Phase 4 review/report/testing/documentation behavior.
- Claiming completion for credential-dependent checks that were not run.
- Adding new architecture beyond Plan 3.

## Optional Future Tracks

These tracks are not part of the mandatory Plan 3 batch chain.

- Product reviews, review forms, and admin review moderation belong to Phase 4.
- Revenue reports, best-selling reports, order-summary reports, and full report UI belong to Phase 4.
- Final demo documentation, presentation readiness, and broad responsive polish belong to Phase 4 unless a small fix is needed to validate Phase 3.
- Shipping provider integration, online payment gateway or simulation, email confirmation, refunds, returns, invoices, coupons, promotions, advanced dashboard charts, advanced inventory, warehouse behavior, chatbot, recommendations, mobile app, Supabase Auth, and Supabase Edge Functions are not needed for this phase.
- Stock restoration after cancellation remains out of the mandatory chain unless the user explicitly approves and tests a stock-restoration rule.

## Dependency Chain

- Batch01 -> Batch02
- Batch02 -> Batch03
- Batch03 -> Batch04
- Batch04 -> Batch05
- Batch05 -> Batch06

Batch04 customer UI and Batch05 admin UI can be implemented in parallel after Batch03 only if they do not edit the same shared components/routes/status helpers at the same time. Batch06 depends on all mandatory implementation batches.

## Global Verification Checklist

- [ ] Current AGENTS instructions were read and followed.
- [ ] Repository was searched before adding new helpers, utilities, configs, API clients, contexts, components, or business logic.
- [ ] Existing order/payment placeholders were reused or safely expanded instead of duplicated.
- [ ] No duplicated Prisma client, response helper, JWT helper, auth/admin middleware, API client, cart subtotal source, order/payment helper path, or validation helper was added.
- [ ] Checkout uses one backend Prisma transaction.
- [ ] Checkout rejects empty carts.
- [ ] Checkout rejects insufficient stock.
- [ ] Checkout calculates total amount on the backend from captured cart item unit prices.
- [ ] Checkout creates order, order details, and COD payment records.
- [ ] Checkout reduces product stock only after successful validation.
- [ ] Checkout clears cart items only after successful order creation.
- [ ] COD payment is created once and duplicate payment records are prevented.
- [ ] Customer order history returns only authenticated customer orders.
- [ ] Customer order detail blocks access to another customer's order.
- [ ] Admin can list all orders through admin middleware.
- [ ] Admin can update order status with only allowed backend enum values.
- [ ] Updating status to `completed` marks COD payment as `paid` and sets `paymentDate`.
- [ ] Cancellation stays simple and does not silently restore stock.
- [ ] Frontend API helpers use existing `apiClient.js`.
- [ ] Checkout, order history, order detail, and admin orders routes are protected correctly.
- [ ] Cart state refreshes after successful checkout.
- [ ] Frontend does not import Prisma, use SQL, expose Supabase PostgreSQL credentials, or access the database directly.
- [ ] React displays backend totals and does not become the source of truth for totals or stock.
- [ ] Checkout UI shows form, cart/order summary, COD-only method, validation errors, loading state, API errors, and success dialog.
- [ ] Order history UI shows status badge, payment badge, total, created date, detail link, and empty/loading/error states.
- [ ] Order detail UI shows shipping address, items, order status, payment status, and backend total.
- [ ] Admin order UI shows table, customer, status selector, total, created date, detail dialog, and loading/empty/error states.
- [ ] Astryx discovery was run before UI implementation or tooling failure was recorded.
- [ ] UI uses Astryx components/tokens and avoids unsupported raw layout/styling.
- [ ] Online payment, shipping, email, refunds, returns, invoices, coupons, reviews, reports, dashboard charts, schema redesign, and Phase 4 behavior remain out of scope.
- [ ] Backend validations and API smoke tests passed or were marked blocked with safe reasons.
- [ ] Frontend command and browser/manual smoke tests passed or were marked blocked with safe reasons.
- [ ] Real `.env` files and secrets are not committed, printed, logged, or documented.
- [ ] Progress tracker matches all task IDs exactly.
- [ ] Phase 4 handoff notes identify reusable order, payment, product/order relationship, auth/admin, status enum, customer product detail, and admin layout/table/dialog artifacts.

## Progress Tracker

### Batches

- [x] Batch01 - Backend Checkout Transaction Models
- [x] Batch02 - Backend Order and Payment APIs
- [ ] Batch03 - Frontend API, Routing, and Cart Refresh
- [ ] Batch04 - Customer Checkout and Order UI
- [ ] Batch05 - Admin Order Management UI
- [ ] Batch06 - Verification, Security Audit, and Phase 4 Handoff

### Task IDs

#### Batch01
- [x] (01A): Inspect prior backend patterns and checkout prerequisites
- [x] (01B): Implement order checkout transaction helper
- [x] (01C): Implement order read and access-filter helpers
- [x] (01D): Implement order status and payment update helpers

#### Batch02
- [x] (02A): Implement order controller request handling
- [x] (02B): Implement admin order status controller behavior
- [x] (02C): Implement explicit COD payment controller behavior
- [x] (02D): Add order/payment routes and mount them under `/api`

#### Batch03
- [ ] (03A): Add order and payment API helpers using the existing API client pattern
- [ ] (03B): Wire protected customer and admin order routes
- [ ] (03C): Define post-checkout cart refresh and order status constants

#### Batch04
- [ ] (04A): Run Astryx discovery and establish customer order component choices
- [ ] (04B): Build checkout form, order summary, and success flow
- [ ] (04C): Build order history view
- [ ] (04D): Build order detail view

#### Batch05
- [ ] (05A): Run Astryx discovery and establish admin order component choices
- [ ] (05B): Build admin order table and filters
- [ ] (05C): Build admin order detail dialog
- [ ] (05D): Build admin order status selector and refresh behavior

#### Batch06
- [ ] (06A): Run backend command checks and order/payment API smoke tests
- [ ] (06B): Run frontend command checks and customer/admin UI smoke tests
- [ ] (06C): Audit security, MVC boundaries, anti-duplication, and Astryx compliance
- [ ] (06D): Update demo checklist, execution report, and Phase 4 handoff notes

## Completion Reporting Rules for Future Execution Agents

### BatchXX Execution Result

#### Completed Task IDs
- (XXA): complete / partial / blocked

#### Files Created or Modified
- path

#### Tests or Validations Run
- command: result

#### User Actions Required
- action: completed / pending / not required
- details: safe summary only, never include secrets

#### Blocked-by-User Status
- status: none / BLOCKED_BY_USER_ACTION
- reason: missing API key, missing provider project, missing manual setup, or other safe summary

#### Validation Responsibility
- user-provided setup confirmed: yes / no / not required
- agent validation run after setup: yes / no
- validation command: result

#### Acceptance Criteria Check
- criterion: satisfied / not satisfied / blocked

#### Artifacts Produced
- artifact

#### Progress Tracker Update
- task IDs updated

#### Key Implementation Decisions
- decision

#### Risks or Open Issues
- issue

#### Notes for Next Batch
- handoff notes

Future execution agents must not claim completion unless task validations and acceptance criteria are satisfied.
