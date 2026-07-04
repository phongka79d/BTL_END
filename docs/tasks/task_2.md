# Electronics E-Commerce Plan 2 Execution Tasks

## Purpose

Convert Plan 2 into a detailed, batch-based execution task file for implementing the product/category/catalog vertical slice, persisted cart behavior, customer browsing UI, and basic admin product/category management.

This file is for future execution agents. It does not implement runtime code.

## Project Context Notes

- README status: read successfully.
- Project purpose: course-project MVC web application for an electronics e-commerce store.
- Current stack: React, Vite, Astryx for the View layer; Express.js JSON REST APIs for the Controller layer; Prisma ORM with Supabase PostgreSQL for the Model/database layer; JWT and bcrypt for authentication.
- Existing validation commands documented by README: `cd backend && npx prisma validate`, `cd backend && npx prisma migrate dev --name init`, `cd backend && npx prisma db seed`, `cd backend && npm run dev`, `cd frontend && npm run dev`.
- Current foundation: Plan 1 auth/user APIs, Prisma schema, seed flow, backend helpers, frontend auth context, and Astryx setup are already documented as available handoff artifacts.
- README conflicts: none found. README Phase 2 handoff aligns with Plan 2 and says Phase 2 must reuse the existing Prisma client, schema, response helper, auth/admin middleware, frontend API helper pattern, `AuthContext`, and Astryx setup.

## Authoritative Source

- Primary phase source: `docs/plans/Plan_2.md`
- Supporting architecture source referenced by Plan 2: `docs/plans/Master_Plan.md`
- Supporting UI source referenced by Plan 2: `docs/design/design.md`
- Project context only: `README.md`
- Scope resolution: `docs/plans/Plan_2.md` is the approved Phase 2 slice. Where the master plan or design document includes broader checkout, order, review, report, image upload, or advanced dashboard work, follow the narrower Plan 2 scope unless the user explicitly changes the plan.

## Source Section Index

- `docs/plans/Plan_2.md` > `## 1. Objective` -> product/category/catalog and persisted cart phase goal.
- `docs/plans/Plan_2.md` > `## 2. Source of Truth` -> master plan and design sections that support Phase 2.
- `docs/plans/Plan_2.md` > `## 3. Prerequisites from Prior Phases` -> required Phase 1 backend, frontend, schema, auth, middleware, API helper, and Astryx artifacts.
- `docs/plans/Plan_2.md` > `## 4. Scope` -> required public/admin category APIs, public/admin product APIs, product filters, cart APIs, customer views, cart UI, admin views, and Astryx alignment.
- `docs/plans/Plan_2.md` > `## 5. Out of Scope` -> checkout, orders, payments, reviews, reports, uploads, advanced inventory, shipping, and schema redesign exclusions.
- `docs/plans/Plan_2.md` > `## 6. Target Directory Structure` -> expected backend and frontend modules.
- `docs/plans/Plan_2.md` > `## 7. Technical Specifications` -> product, category, cart, and frontend UI contracts.
- `docs/plans/Plan_2.md` > `### 7.1 Product API` -> product query parameters, response shape, filters, and admin validation rules.
- `docs/plans/Plan_2.md` > `### 7.2 Category API` -> category response shape, unique-name rule, and delete guard.
- `docs/plans/Plan_2.md` > `### 7.3 Cart API` -> cart response shape, add/update/delete payloads, auth, subtotal, stock, and unit-price rules.
- `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract` -> customer/admin view behavior and Astryx constraints.
- `docs/plans/Plan_2.md` > `## 8. Implementation Steps` -> ordered implementation checklist.
- `docs/plans/Plan_2.md` > `## 9. Verification & Testing Plan` -> backend/frontend commands, API smoke tests, expected evidence, and manual checks.
- `docs/plans/Plan_2.md` > `## 10. Handoff Notes for Phase 3` -> artifacts and hard rules Phase 3 must consume.
- `docs/plans/Master_Plan.md` > `## 7. Team Member Responsibility Plan` -> customer view, cart/admin view, product/category controller, and cart controller responsibilities.
- `docs/plans/Master_Plan.md` > `## 9. Front-end MVC View Structure` -> view-layer folder responsibilities and no direct database access.
- `docs/plans/Master_Plan.md` > `## 13. Controller Design` -> ProductController, CategoryController, and CartController behavior.
- `docs/plans/Master_Plan.md` > `## 15. API Design Summary` -> product, category, and cart endpoint families.
- `docs/plans/Master_Plan.md` > `## 16. Development Timeline` > `### Week 2 - Product, Category, Cart` -> Phase 2 demo output.
- `docs/design/design.md` > `## 4. Page Inventory` -> customer/admin pages in scope.
- `docs/design/design.md` > `## 5. Main Layouts` -> customer and admin layouts used by Phase 2 pages.
- `docs/design/design.md` > `# 7. Customer Product Components` -> product card/grid/detail component references.
- `docs/design/design.md` > `# 8. Product Search and Filter Components` -> search, filter, sort, and active filter component references.
- `docs/design/design.md` > `# 10. Cart Components` -> cart item/list/summary/empty-state component references.
- `docs/design/design.md` > `# 14. Admin Product Components` -> admin product table/form/delete/stock component references.
- `docs/design/design.md` > `# 15. Admin Category Components` -> admin category table/form/delete component references.
- `docs/design/design.md` > `# 20. Common Form Components` -> reusable form primitive guidance.
- `docs/design/design.md` > `# 21. Common Feedback Components` -> toast, banner, loading, empty, and confirm feedback guidance.
- `docs/design/design.md` > `# 22. Common Utility Components` -> page header, toolbar, pagination, and formatting helper guidance.
- `docs/design/design.md` > `# 24. Page-to-Component Mapping` -> page-level component composition.
- `docs/design/design.md` > `# 25. Page State Requirements` -> loading, empty, error, success, and admin table states.
- `docs/design/design.md` > `# 26. Responsive Rules` -> product grid and filter responsiveness.
- `docs/design/design.md` > `# 28. Implementation Priority` -> required demo UI priority ordering.

## Approved Architecture Summary

- Continue the existing MVC architecture: Prisma model modules own data access, Express controllers own HTTP/request behavior, and React views own presentation.
- Supabase remains hosted PostgreSQL only. Do not use Supabase Auth, Supabase client-side database access, Edge Functions, or direct React database connections.
- Reuse the Phase 1 Prisma schema and model names. Do not rename database fields, enum values, or relationships without an explicit migration section approved by the user.
- Reuse `backend/src/config/database.js` as the single Prisma client export.
- Reuse `backend/src/utils/response.js` for JSON responses and existing auth/admin/error middleware for route protection and failures.
- Public product/category APIs must be available under `/api`; admin product/category APIs must be protected by admin middleware; cart APIs must be protected by auth middleware.
- Product search/filter belongs in backend query behavior, with the frontend passing query parameters through API helpers.
- Cart subtotal and stock validation are backend source-of-truth behavior. Frontend may display returned totals but must not become the source of truth.
- Cart updates do not reduce product stock. Stock changes belong to Phase 3 checkout/order creation.
- Customer UI uses Astryx components/tokens and design document mappings for product browsing, detail, and cart views.
- Admin UI is basic and demoable for product/category management only. Orders, reports, reviews, uploads, and advanced inventory are out of Phase 2.

## Global Implementation Rules

- Read root `AGENTS.md` or the current AGENTS instructions before implementation and follow search-before-write, reuse, SRP, YAGNI, and root-cause rules.
- Search existing code before adding functions, helpers, utilities, configs, API clients, contexts, components, or business logic. Reuse or safely refactor existing patterns instead of duplicating them.
- Keep files focused. If a source file approaches broad mixed responsibilities or the local 300-line guidance, split by model/controller/component responsibility.
- Use the existing Prisma schema as the contract. Do not redesign tables for Phase 2.
- Use exactly one Prisma client export, one response helper family, one JWT/auth middleware path, and one frontend API client pattern.
- Keep real `.env` values, Supabase credentials, JWT secrets, and database URLs out of committed files, logs, docs, UI, and execution reports.
- Treat missing real database/JWT credentials or unavailable local servers as `BLOCKED_BY_USER_ACTION` for live validation, not as completed work.
- Keep frontend code free of Prisma imports, Supabase database credentials, backend-only config names, SQL, and database logic.
- Use Astryx workflow before writing UI: run `npx astryx build "<idea>"`, inspect relevant templates with `npx astryx template <name>`, and inspect component props with `npx astryx component <Name>` for components used.
- Follow Astryx project rules: use components for layout/spacing, prefer component props, use tokens for custom styling, avoid raw hex/px values, and do not introduce utility-class or Tailwind-style styling.
- Do not implement checkout, order creation, payments, order history, order detail pages, reviews, reports, product image upload, shipping provider integration, or advanced inventory behavior in Phase 2.
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
| Batch01 | Backend Catalog APIs | Product and category model/controller/route behavior is implemented and mounted under `/api`. |
| Batch02 | Backend Cart APIs | Authenticated cart retrieval, add, update, remove, subtotal, and stock validation behavior is implemented. |
| Batch03 | Frontend API, Cart State, and Routing | Product/category/cart API helpers, `CartContext`, and Phase 2 route entries are wired to existing auth state and layouts. |
| Batch04 | Customer Catalog and Cart UI | Home, product list, product detail, and cart customer experiences are implemented with Astryx and design-document states. |
| Batch05 | Admin Product and Category UI | Basic admin product/category tables, forms, and delete confirmation flows are demoable. |
| Batch06 | Verification, Security Audit, and Phase 3 Handoff | Backend, frontend, API, UI, security, MVC, and handoff checks are completed or honestly blocked. |

## Mandatory Batch01 - Backend Catalog APIs

### Goal

Implement the public and admin product/category API surface on top of the existing Prisma schema, helpers, middleware, and MVC folder patterns.

### Why this batch exists

Product and category behavior is the foundation for customer browsing, admin management, and cart item validation. Cart and UI work should consume stable catalog APIs instead of duplicating catalog queries.

### Inputs / Dependencies

- Plan 1 backend foundation and Prisma schema.
- `backend/src/config/database.js`
- `backend/src/utils/response.js`
- `backend/src/middlewares/auth.middleware.js`
- `backend/src/middlewares/admin.middleware.js`
- Existing backend model, controller, route, and error-handling patterns.

### Tasks

- [x] (01A): Inspect Phase 1 backend patterns and catalog model placeholders
  - Source of Truth: `docs/plans/Plan_2.md` > `## 3. Prerequisites from Prior Phases`; `docs/plans/Plan_2.md` > `## 8. Implementation Steps`
  - Source Requirements:
    - Phase 2 must reuse existing API client, response helper, middleware, and model patterns.
    - Backend, Prisma schema, auth middleware, admin middleware, shared response helper, and error middleware must already exist.
  - Details: Establish the existing backend conventions before writing catalog code.
  - Dependencies: None
  - User Action: None
  - Agent Work: Read current backend structure, search for existing product/category/cart logic, and identify reusable helper/controller/model patterns.
  - Specific Steps:
    1. Read the current AGENTS instructions.
    2. Search backend source for existing product, category, cart, response, validation, auth, admin, route, and Prisma helper code.
    3. Inspect `backend/prisma/schema.prisma` for exact model field names, relations, Decimal fields, and mapped column names.
    4. Inspect `backend/src/config/database.js`, `backend/src/utils/response.js`, middleware, and existing auth/user controller/model patterns.
    5. Record any existing placeholders that should be updated instead of replaced.
  - Output: Catalog implementation approach aligned with existing backend patterns.
  - Acceptance: Execution notes identify reusable files and no duplicate backend helper path is planned.
  - Validation: `rg "Product|Category|Cart|response|admin|auth|prisma" backend/src backend/prisma`
  - Blocked Condition: None
  - Files: No required code changes unless stale placeholders must be aligned before implementation.

- [x] (01B): Implement product model functions for list, detail, create, update, and delete
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.1 Product API`; `docs/plans/Plan_2.md` > `## 6. Target Directory Structure`
  - Source Requirements:
    - Public product APIs require list and detail behavior.
    - Admin product APIs require create, update, and delete behavior.
    - Product list supports `keyword`, `categoryId`, `minPrice`, `maxPrice`, and optional simple `page`/`limit`.
    - Admin create/update must validate required fields and non-negative price/quantity.
  - Details: Add or update focused product data-access functions using Prisma and exact schema field names.
  - Dependencies: (01A)
  - User Action: None
  - Agent Work: Implement product model functions without HTTP response handling inside the model.
  - Specific Steps:
    1. Reuse or update `backend/src/models/product.model.js` if it already exists.
    2. Implement list query construction for keyword search across product name and brand.
    3. Implement category, min price, and max price filters using Prisma-supported conditions.
    4. Implement simple pagination only if it does not delay must-have work.
    5. Include category data in list/detail query results.
    6. Implement create/update/delete helpers for admin controller use.
    7. Keep product status/hidden/deleted behavior out because Plan 2 does not define a product status field.
  - Output: Product model functions for public and admin catalog behavior.
  - Acceptance: Product model exposes reusable functions for controller actions and does not duplicate Prisma client setup or response helper logic.
  - Validation: `cd backend && npx prisma validate`; targeted model/controller smoke through Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live database validation needs missing real `backend/.env` values.
  - Files: `backend/src/models/product.model.js`

- [x] (01C): Implement category model functions for list, create, update, delete, and product checks
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.2 Category API`; `docs/plans/Plan_2.md` > `## 6. Target Directory Structure`
  - Source Requirements:
    - Public category API returns category `id`, `name`, and `description`.
    - Admin category APIs create, update, and delete categories.
    - Category names must be unique.
    - Category deletion should be blocked with a clear error when products still reference the category.
  - Details: Add or update focused category data-access functions and relationship checks.
  - Dependencies: (01A)
  - User Action: None
  - Agent Work: Implement category model functions that support public listing and admin mutation without schema redesign.
  - Specific Steps:
    1. Reuse or update `backend/src/models/category.model.js` if it already exists.
    2. Implement category listing using exact schema fields.
    3. Implement unique-name checks for create/update.
    4. Implement create/update helpers for admin actions.
    5. Implement a `hasProducts` or equivalent relationship check before delete.
    6. Implement delete behavior that blocks deletion when products exist unless the existing schema already has a safe, explicit alternative.
  - Output: Category model functions for public and admin category behavior.
  - Acceptance: Category model supports public list and safe admin CRUD with duplicate-name and delete-guard behavior.
  - Validation: `cd backend && npx prisma validate`; targeted category API smoke through Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live database validation needs missing real `backend/.env` values.
  - Files: `backend/src/models/category.model.js`

- [x] (01D): Implement product/category controllers, routes, admin protection, and API mounting
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.1 Product API`; `docs/plans/Plan_2.md` > `### 7.2 Category API`; `docs/plans/Plan_2.md` > `## 8. Implementation Steps`
  - Source Requirements:
    - Implement `GET /api/categories`.
    - Implement `POST /api/admin/categories`, `PUT /api/admin/categories/:id`, and `DELETE /api/admin/categories/:id`.
    - Implement `GET /api/products` and `GET /api/products/:id`.
    - Implement `POST /api/admin/products`, `PUT /api/admin/products/:id`, and `DELETE /api/admin/products/:id`.
    - Add admin middleware to admin product/category routes.
  - Details: Expose catalog model functions through Express controllers and routes using existing response/error conventions.
  - Dependencies: (01B), (01C)
  - User Action: None
  - Agent Work: Implement catalog controllers, route files, and route mounting under the existing `/api` setup.
  - Specific Steps:
    1. Reuse existing controller, route, validation, and error handling patterns.
    2. Implement `backend/src/controllers/product.controller.js` and `backend/src/controllers/category.controller.js`.
    3. Implement `backend/src/routes/product.routes.js` and `backend/src/routes/category.routes.js`.
    4. Mount public product/category routes under `/api`.
    5. Mount admin product/category routes under `/api/admin` or equivalent existing route composition while preserving exact final endpoint paths.
    6. Apply admin middleware to all admin product/category mutations.
    7. Return consistent 400, 401, 403, 404, and success responses through existing helpers.
  - Output: Mounted product/category REST APIs.
  - Acceptance: Endpoint paths match Plan 2 and admin-only mutations reject anonymous/customer users.
  - Validation: Batch06 API smoke tests for all product/category endpoints.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live API smoke tests need missing database/JWT setup.
  - Files: `backend/src/controllers/product.controller.js`, `backend/src/controllers/category.controller.js`, `backend/src/routes/product.routes.js`, `backend/src/routes/category.routes.js`, `backend/src/routes/index.js`, `backend/src/app.js`

### Files or Modules Likely Created or Updated

- `backend/src/models/product.model.js`
- `backend/src/models/category.model.js`
- `backend/src/controllers/product.controller.js`
- `backend/src/controllers/category.controller.js`
- `backend/src/routes/product.routes.js`
- `backend/src/routes/category.routes.js`
- `backend/src/routes/index.js`
- `backend/src/app.js`
- Existing backend validation/error helper files only if refactoring is required to reuse them cleanly

### Required Outputs / Artifacts

- Public category API.
- Admin category mutation APIs.
- Public product list/detail APIs.
- Admin product mutation APIs.
- Backend route mounting under `/api`.

### Acceptance Criteria

- Product list returns seeded products with category data.
- Product detail returns one product or consistent 404 response.
- Product search/filter narrows results correctly.
- Admin can create, update, and delete products/categories.
- Customer and anonymous users cannot call admin product/category mutation routes.
- Category delete is blocked when products still reference the category.
- No duplicate Prisma client, response helper, auth middleware, or model logic is introduced.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- API smoke checks for product/category endpoints listed in Plan 2.
- Admin/customer/anonymous authorization checks for admin routes.
- Search for duplicate helpers or forbidden duplicate database clients.

### Explicit Non-Goals

- Product image upload.
- Product status/hidden/deleted workflow.
- Checkout, orders, payments, reviews, reports, shipping, or advanced inventory.
- Database schema redesign.

## Mandatory Batch02 - Backend Cart APIs

### Goal

Implement authenticated cart APIs that create or load a user cart, add items, update quantities, remove items, validate stock, preserve captured unit price, and return backend-calculated subtotal.

### Why this batch exists

Cart behavior depends on stable catalog data but must be implemented before customer UI can reliably display and update cart state.

### Inputs / Dependencies

- Batch01 catalog model helpers and product stock lookup behavior.
- Existing auth middleware and current-user identity.
- Existing Prisma `Cart` and `CartItem` schema from Phase 1.

### Tasks

- [x] (02A): Implement cart model functions for get/create, add, update, remove, and subtotal
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.3 Cart API`; `docs/plans/Plan_2.md` > `## 6. Target Directory Structure`
  - Source Requirements:
    - `GET /api/cart` returns the authenticated user's cart with items and subtotal.
    - Add-to-cart creates the user's cart if it does not exist.
    - Adding the same product increments the existing item quantity.
    - `unitPrice` is captured from current product price when first added.
    - Cart subtotal matches item quantity times captured `unitPrice`.
  - Details: Add or update cart data-access behavior using Prisma transactions where needed for consistency.
  - Dependencies: Batch01
  - User Action: None
  - Agent Work: Implement focused cart model functions without HTTP request/response logic inside the model.
  - Specific Steps:
    1. Reuse or update `backend/src/models/cart.model.js` and `backend/src/models/cartItem.model.js` if they already exist.
    2. Implement a helper to fetch or create the authenticated user's cart.
    3. Implement add-item behavior that either creates a new cart item or increments the existing one.
    4. Capture `unitPrice` from product price only when a product is first added to the cart.
    5. Implement update quantity behavior by cart item ID scoped to the user's cart.
    6. Implement remove item behavior scoped to the user's cart.
    7. Calculate subtotal from cart items and captured unit prices on the backend.
  - Output: Cart model functions for authenticated cart behavior.
  - Acceptance: Cart model functions are user-scoped, reusable, and do not duplicate catalog product queries where an existing helper can be reused safely.
  - Validation: Cart API smoke tests through Batch06.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live database validation needs missing real `backend/.env` values.
  - Files: `backend/src/models/cart.model.js`, `backend/src/models/cartItem.model.js`, `backend/src/models/product.model.js`

- [x] (02B): Enforce cart quantity and stock validation at the backend source of truth
  - Source of Truth: `docs/plans/Plan_2.md` > `### 7.3 Cart API`; `docs/plans/Plan_2.md` > `## 10. Handoff Notes for Phase 3`
  - Source Requirements:
    - Quantity must be at least `1`.
    - Quantity may not exceed product stock.
    - Cart changes do not reduce product stock.
    - Stock changes only during Phase 3 checkout.
  - Details: Centralize quantity and stock checks in backend cart behavior so frontend cannot bypass rules.
  - Dependencies: (02A), Batch01
  - User Action: None
  - Agent Work: Add validation for cart add/update paths and verify stock remains unchanged after cart operations.
  - Specific Steps:
    1. Validate `productId` and `quantity` payloads before mutation.
    2. Load the product record needed for price and stock checks.
    3. Reject missing products with a consistent 404 response.
    4. Reject quantity below `1` with a clear validation error.
    5. Reject total cart quantity above product stock.
    6. Verify add/update/remove operations do not decrement or mutate product stock.
  - Output: Backend-enforced cart validation behavior.
  - Acceptance: Invalid quantities and above-stock requests fail consistently, and stock remains unchanged after cart operations.
  - Validation: API smoke checks for below-one quantity, above-stock quantity, and stock unchanged after cart operations.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live database/API checks need missing setup.
  - Files: `backend/src/models/cart.model.js`, `backend/src/models/cartItem.model.js`, `backend/src/controllers/cart.controller.js`

- [x] (02C): Implement cart controller, authenticated routes, and route mounting
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.3 Cart API`; `docs/plans/Plan_2.md` > `## 8. Implementation Steps`
  - Source Requirements:
    - Implement `GET /api/cart`.
    - Implement `POST /api/cart/items`.
    - Implement `PUT /api/cart/items/:id`.
    - Implement `DELETE /api/cart/items/:id`.
    - Cart routes require authentication.
  - Details: Expose cart model behavior through Express controllers and routes using existing auth and response conventions.
  - Dependencies: (02A), (02B)
  - User Action: None
  - Agent Work: Implement cart controller actions, cart route file, auth middleware use, and mounting under `/api`.
  - Specific Steps:
    1. Reuse existing controller and route patterns from auth/user/catalog code.
    2. Implement `backend/src/controllers/cart.controller.js`.
    3. Implement `backend/src/routes/cart.routes.js`.
    4. Apply auth middleware to every cart route.
    5. Ensure each controller scopes cart access to `req.user` or the existing current-user shape.
    6. Return response shape matching existing backend helpers.
    7. Wire cart routes through the existing route index/app mounting.
  - Output: Mounted authenticated cart REST APIs.
  - Acceptance: Cart endpoint paths match Plan 2 and reject anonymous requests.
  - Validation: Batch06 cart API smoke tests.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live API smoke tests need missing database/JWT setup.
  - Files: `backend/src/controllers/cart.controller.js`, `backend/src/routes/cart.routes.js`, `backend/src/routes/index.js`, `backend/src/app.js`

### Files or Modules Likely Created or Updated

- `backend/src/models/cart.model.js`
- `backend/src/models/cartItem.model.js`
- `backend/src/models/product.model.js`
- `backend/src/controllers/cart.controller.js`
- `backend/src/routes/cart.routes.js`
- `backend/src/routes/index.js`
- `backend/src/app.js`

### Required Outputs / Artifacts

- Authenticated cart retrieval API.
- Authenticated cart add/update/remove APIs.
- Backend subtotal calculation.
- Stock-safe cart validation.

### Acceptance Criteria

- Authenticated customer can add, update, and remove cart items.
- Anonymous users cannot call cart routes.
- Adding a duplicate product increments the existing cart item quantity.
- Cart subtotal uses captured `unitPrice`.
- Add/update rejects quantities greater than stock.
- Product stock is unchanged after cart operations.
- No frontend or controller duplicates cart subtotal source-of-truth logic.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- API smoke checks for all cart endpoints listed in Plan 2.
- Auth rejection check for anonymous cart access.
- Stock unchanged check before and after cart add/update/remove.

### Explicit Non-Goals

- Checkout and order creation.
- Payment records.
- Stock decrement behavior.
- Cart-to-order conversion.
- Frontend cart UI.

## Mandatory Batch03 - Frontend API, Cart State, and Routing

### Goal

Add frontend API helpers, cart state management, and route entries that consume the Phase 2 backend APIs through the existing Vite API base URL and auth state.

### Why this batch exists

Customer and admin views need stable API wrappers, route entries, and cart state before UI components are wired to live data.

### Inputs / Dependencies

- Batch01 and Batch02 endpoint contracts.
- Existing `frontend/src/api/apiClient.js`, `authApi.js`, and `userApi.js`.
- Existing `frontend/src/contexts/AuthContext.jsx`.
- Existing `frontend/src/routes/AppRoutes.jsx` and layouts.

### Tasks

- [x] (03A): Add product, category, and cart API helpers using the existing API client pattern
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_2.md` > `## 8. Implementation Steps`
  - Source Requirements:
    - Build `productApi.js`, `categoryApi.js`, and `cartApi.js` using the existing API helper pattern.
    - Frontend must call Express REST APIs and must not access the database directly.
    - Product APIs must support search/filter query parameters.
  - Details: Create focused API modules that wrap product, category, and cart endpoints without duplicating low-level client logic.
  - Dependencies: Batch01, Batch02
  - User Action: None
  - Agent Work: Add API helper modules that reuse the existing `apiClient` and `VITE_API_BASE_URL` flow.
  - Specific Steps:
    1. Inspect existing `frontend/src/api/apiClient.js`, `authApi.js`, and `userApi.js`.
    2. Search for any existing product/category/cart API helpers before adding files.
    3. Add or update `frontend/src/api/productApi.js` for list/detail/admin product operations.
    4. Add or update `frontend/src/api/categoryApi.js` for list/admin category operations.
    5. Add or update `frontend/src/api/cartApi.js` for get/add/update/remove cart operations.
    6. Keep auth token handling inside the existing API client pattern.
    7. Do not hardcode API base URLs outside existing config.
  - Output: Frontend API helper modules for Phase 2.
  - Acceptance: UI code can consume typed, focused helper functions and no second API client is created.
  - Validation: `rg "DATABASE_URL|DIRECT_URL|PrismaClient|@prisma|supabase" frontend/src`; frontend smoke through Batch06.
  - Blocked Condition: None for helper creation; `BLOCKED_BY_USER_ACTION` only for live backend-backed UI validation if backend setup is unavailable.
  - Files: `frontend/src/api/productApi.js`, `frontend/src/api/categoryApi.js`, `frontend/src/api/cartApi.js`, `frontend/src/api/apiClient.js`

- [x] (03B): Build `CartContext` using auth state and backend cart APIs
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_2.md` > `## 8. Implementation Steps`; `docs/plans/Plan_2.md` > `### 7.3 Cart API`
  - Source Requirements:
    - Build `CartContext.jsx`.
    - Ensure it uses auth state instead of storing user identity separately.
    - Cart subtotal and validation come from backend responses.
  - Details: Add cart state/actions for product detail, cart view, and navigation badge without duplicating user identity or business rules.
  - Dependencies: (03A), Batch02
  - User Action: None
  - Agent Work: Implement cart provider state, loading/error handling, refresh, add, update, remove, and clear-on-logout behavior.
  - Specific Steps:
    1. Inspect `AuthContext.jsx` for current user/auth loading/logout shape.
    2. Create or update `frontend/src/contexts/CartContext.jsx`.
    3. Load cart only for authenticated users.
    4. Clear cart state when the user logs out or is unauthenticated.
    5. Expose cart actions that call `cartApi.js`.
    6. Preserve backend returned subtotal and item data as the display source.
    7. Avoid localStorage user identity or client-only cart persistence unless already present and aligned with Plan 2.
  - Output: Cart context provider and hooks/actions for Phase 2 UI.
  - Acceptance: Cart state is user-scoped through auth and can refresh after add/update/remove actions.
  - Validation: Frontend smoke through Batch06; inspect for duplicated user identity storage.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live backend validation is unavailable.
  - Files: `frontend/src/contexts/CartContext.jsx`, `frontend/src/App.jsx`, `frontend/src/contexts/AuthContext.jsx`

- [x] (03C): Wire Phase 2 routes, navigation entries, and route guards
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`
  - Source Requirements:
    - Build customer product browsing views: `HomeView`, `ProductListView`, `ProductDetailView`.
    - Build `CartView`.
    - Build basic admin product and category management views.
    - Wire routes in `AppRoutes.jsx`.
  - Details: Register route paths and navigation placeholders before detailed UI implementation.
  - Dependencies: (03B)
  - User Action: None
  - Agent Work: Add route entries and guard requirements using existing layouts and auth/admin guard patterns.
  - Specific Steps:
    1. Inspect existing `AppRoutes.jsx`, `MainLayout.jsx`, and `AdminLayout.jsx`.
    2. Add customer routes for product list, product detail, and cart.
    3. Add admin routes for product and category management.
    4. Ensure cart route requires authenticated user if existing UX supports protected cart access.
    5. Ensure admin product/category routes require admin role.
    6. Update customer navigation for products and cart without exposing admin links to non-admin users.
    7. Update admin navigation to include products and categories.
  - Output: Phase 2 route and navigation wiring.
  - Acceptance: Routes can render Phase 2 views or safe placeholders and guard access correctly.
  - Validation: Browser/manual navigation smoke through Batch06.
  - Blocked Condition: None
  - Files: `frontend/src/routes/AppRoutes.jsx`, `frontend/src/App.jsx`, `frontend/src/layouts/MainLayout.jsx`, `frontend/src/layouts/AdminLayout.jsx`, Phase 2 view files as placeholders only if needed.

### Files or Modules Likely Created or Updated

- `frontend/src/api/productApi.js`
- `frontend/src/api/categoryApi.js`
- `frontend/src/api/cartApi.js`
- `frontend/src/contexts/CartContext.jsx`
- `frontend/src/App.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/layouts/MainLayout.jsx`
- `frontend/src/layouts/AdminLayout.jsx`
- Phase 2 view placeholders if needed for route compilation

### Required Outputs / Artifacts

- API helper modules for product, category, and cart.
- Cart context wired to auth state.
- Customer and admin route entries.
- Navigation entries for products, cart, products admin, and categories admin.

### Acceptance Criteria

- Frontend uses `VITE_API_BASE_URL` through existing client pattern.
- Frontend does not access Prisma, Supabase PostgreSQL, database URLs, or SQL.
- Cart context does not store user identity separately from `AuthContext`.
- Customer and admin route guards preserve role boundaries.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser/manual route navigation smoke test.
- `rg "DATABASE_URL|DIRECT_URL|PrismaClient|@prisma|supabase" frontend/src frontend/.env.example`

### Explicit Non-Goals

- Product UI polish before Batch04.
- Admin UI polish before Batch05.
- Checkout route implementation.
- Client-side database access.

## Mandatory Batch04 - Customer Catalog and Cart UI

### Goal

Build the customer-facing Home, Product List, Product Detail, and Cart experiences using Astryx components, design document mappings, and backend-backed API state.

### Why this batch exists

The Phase 2 demo needs customers to browse products, search/filter, view details, add to cart, adjust cart quantities, remove items, and see subtotal without implementing checkout.

### Inputs / Dependencies

- Batch01 product/category APIs.
- Batch02 cart APIs.
- Batch03 API helpers, cart context, routes, layouts, and navigation.
- `docs/design/design.md` customer product, search/filter, cart, common form/feedback, page state, and responsive sections.

### Tasks

- [x] (04A): Run Astryx discovery and establish reusable customer UI component choices
  - Source of Truth: `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `# 7. Customer Product Components`; `docs/design/design.md` > `# 8. Product Search and Filter Components`; `docs/design/design.md` > `# 10. Cart Components`; root `AGENTS.md` > `<!-- ASTRYX:START -->`
  - Source Requirements:
    - Use `docs/design/design.md` page-to-component map before building views.
    - Use Astryx components for shell, navigation, cards, forms, tables, badges, dialogs, loading, and empty/error states.
    - Follow root Astryx rules for component layout and tokens.
  - Details: Identify the Astryx templates/components to use before writing customer UI code.
  - Dependencies: Batch03
  - User Action: None
  - Agent Work: Run Astryx discovery commands and map customer UI components to existing or new files.
  - Specific Steps:
    1. Run `npx astryx build "customer product browsing and cart"`.
    2. Inspect relevant templates named by Astryx with `npx astryx template <name>` or `--skeleton`.
    3. Inspect props/examples for Astryx components that will be used with `npx astryx component <Name>`.
    4. Search existing frontend components before creating new product/cart/common components.
    5. Decide which design document components are in Phase 2 and which are out of scope because of reviews/checkout.
  - Output: Customer UI implementation notes and chosen component set.
  - Acceptance: UI work proceeds from discovered Astryx components/templates and does not duplicate existing common components.
  - Validation: Astryx command outputs summarized in execution report.
  - Blocked Condition: None unless `@astryxdesign/core` or the Astryx CLI is unavailable, in which case record the tooling failure and continue only with existing installed component evidence.
  - Files: Execution report; no required source changes unless component placeholders are adjusted.

- [x] (04B): Build Home and product list search/filter experience
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.1 Product API`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `## 24.1 Home Page`; `docs/design/design.md` > `## 24.2 Product List Page`; `docs/design/design.md` > `## 25.1 Product List Page States`; `docs/design/design.md` > `# 26. Responsive Rules`
  - Source Requirements:
    - `HomeView` shows featured products and links to product listing.
    - `ProductListView` supports search, category filter, price filters, product grid, loading, empty, and error states.
    - Product query filters include `keyword`, `categoryId`, `minPrice`, `maxPrice`, and optional simple pagination.
  - Details: Build backend-backed home/product list UI with reusable product/search/filter components.
  - Dependencies: (04A), Batch03
  - User Action: None
  - Agent Work: Implement or update `HomeView`, `ProductListView`, and supporting product/search/filter components using existing API helpers.
  - Specific Steps:
    1. Reuse existing `HomeView.jsx` and update it to fetch/display featured products using the product API.
    2. Create or update product components such as `ProductCard`, `ProductList` or grid, `ProductFilter`, and `SearchBar`.
    3. Create or reuse common loading, empty, error, and pagination components only when needed.
    4. Wire keyword, category, min price, and max price filters to backend query params.
    5. Use category API data for category filter options.
    6. Implement responsive product grid behavior using Astryx/tokens and design rules.
    7. Keep sort behavior optional unless it already exists or is simple; do not delay required search/filter work.
  - Output: Customer home and product listing UI.
  - Acceptance: Product list displays backend products, applies search/filter requests, and handles loading/empty/error states.
  - Validation: `cd frontend && npm run dev`; browser/manual product list search/filter smoke test when backend is available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live backend/database setup is unavailable for API-backed UI validation.
  - Files: `frontend/src/views/HomeView.jsx`, `frontend/src/views/ProductListView.jsx`, `frontend/src/components/product/ProductCard.jsx`, `frontend/src/components/product/ProductList.jsx`, `frontend/src/components/product/ProductFilter.jsx`, `frontend/src/components/product/SearchBar.jsx`, `frontend/src/components/common/Loading.jsx`, `frontend/src/components/common/Alert.jsx`, `frontend/src/components/common/Pagination.jsx`

- [x] (04C): Build product detail and add-to-cart flow
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.1 Product API`; `docs/plans/Plan_2.md` > `### 7.3 Cart API`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `## 24.3 Product Detail Page`; `docs/design/design.md` > `## 23.1 Stock Status`
  - Source Requirements:
    - `ProductDetailView` shows product image, info, stock status, and add-to-cart action.
    - Add-to-cart uses backend cart API and must respect backend stock validation.
    - Product reviews and review forms are out of Phase 2 despite broader design references.
  - Details: Build product detail UI that consumes product detail data and cart context without duplicating stock validation as source of truth.
  - Dependencies: (04A), (04B), Batch03
  - User Action: None
  - Agent Work: Implement `ProductDetailView` and any focused detail components needed for image/info/add-to-cart behavior.
  - Specific Steps:
    1. Fetch product detail by route parameter using `productApi.js`.
    2. Show product image URL, name, brand, category, price, description, quantity, and stock status.
    3. Add a quantity selector constrained for UX, while leaving final validation to the backend.
    4. Call `CartContext` add action and show success/error/loading feedback.
    5. Handle product not found and API error states.
    6. Omit or placeholder review UI because reviews are explicitly out of Phase 2.
  - Output: Product detail page with add-to-cart action.
  - Acceptance: Customer can open a product detail page and add valid quantities to cart when authenticated.
  - Validation: Browser/manual product detail and add-to-cart smoke test when backend/auth are available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live backend/auth setup is unavailable.
  - Files: `frontend/src/views/ProductDetailView.jsx`, `frontend/src/components/product/`, `frontend/src/contexts/CartContext.jsx`

- [x] (04D): Build cart view, item controls, removal, subtotal, and checkout placeholder
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.3 Cart API`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `# 10. Cart Components`; `docs/design/design.md` > `## 24.6 Cart Page`; `docs/design/design.md` > `## 25.2 Cart Page States`
  - Source Requirements:
    - `CartView` shows cart items, quantity controls, removal action, subtotal, and checkout navigation placeholder.
    - Cart API returns backend-calculated subtotal.
    - Checkout and order creation are out of scope.
  - Details: Build cart UI that uses `CartContext` and backend responses for item state and totals.
  - Dependencies: (04A), (04C), Batch03
  - User Action: None
  - Agent Work: Implement cart view and cart components with loading, empty, error, success, and updating states.
  - Specific Steps:
    1. Create or update `CartView.jsx`.
    2. Create or update `CartItem`, `CartItemList`, and `CartSummary` components.
    3. Load cart from `CartContext`.
    4. Wire quantity update controls to backend cart update behavior.
    5. Wire remove action to backend cart delete behavior.
    6. Display backend returned subtotal.
    7. Add a checkout navigation placeholder that does not implement checkout/order behavior.
    8. Handle empty cart and authenticated-access states.
  - Output: Customer cart page and reusable cart components.
  - Acceptance: Customer can view, update, and remove cart items; subtotal updates from backend responses; checkout remains a placeholder.
  - Validation: Browser/manual cart add/update/remove/subtotal smoke test when backend/auth are available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live backend/auth setup is unavailable.
  - Files: `frontend/src/views/CartView.jsx`, `frontend/src/components/cart/CartItem.jsx`, `frontend/src/components/cart/CartItemList.jsx`, `frontend/src/components/cart/CartSummary.jsx`, `frontend/src/contexts/CartContext.jsx`

### Files or Modules Likely Created or Updated

- `frontend/src/views/HomeView.jsx`
- `frontend/src/views/ProductListView.jsx`
- `frontend/src/views/ProductDetailView.jsx`
- `frontend/src/views/CartView.jsx`
- `frontend/src/components/product/ProductCard.jsx`
- `frontend/src/components/product/ProductFilter.jsx`
- `frontend/src/components/product/ProductList.jsx`
- `frontend/src/components/product/SearchBar.jsx`
- `frontend/src/components/cart/CartItem.jsx`
- `frontend/src/components/cart/CartItemList.jsx`
- `frontend/src/components/cart/CartSummary.jsx`
- `frontend/src/components/common/Alert.jsx`
- `frontend/src/components/common/Loading.jsx`
- `frontend/src/components/common/Pagination.jsx`
- `frontend/src/contexts/CartContext.jsx`

### Required Outputs / Artifacts

- Customer home with featured products.
- Product listing with search/filter states.
- Product detail with add-to-cart.
- Cart page with quantity controls, removal, subtotal, and checkout placeholder.
- Astryx-based loading, empty, and error states.

### Acceptance Criteria

- Customer product pages show loading, empty, success, and error states.
- Product list/search/filter pages call backend APIs.
- Product detail can add valid quantities to cart.
- Cart view can update/remove items and display backend subtotal.
- UI uses Astryx components and tokens instead of raw layout/styling.
- Reviews, checkout, orders, payments, and image upload are not implemented.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser/manual checks for homepage, product list, product detail, and cart.
- Backend-backed product search/filter and cart smoke checks when backend is available.
- Search frontend for forbidden backend/database imports.

### Explicit Non-Goals

- Checkout implementation.
- Product review list/form behavior.
- Related products unless trivial and already supported by the API.
- Product image upload.
- Advanced animations or non-Astryx design system work.

## Mandatory Batch05 - Admin Product and Category UI

### Goal

Build basic admin product and category management views that are demoable through existing admin layout, route guards, admin APIs, Astryx table/form/dialog primitives, and safe confirmation flows.

### Why this batch exists

Phase 2 requires products and categories to be manageable by admins, not just browsable by customers.

### Inputs / Dependencies

- Batch01 admin product/category APIs.
- Batch03 frontend API helpers, routes, and admin navigation.
- Existing admin layout and admin route guard from Phase 1.
- `docs/design/design.md` admin product/category, common form, feedback, utility, and state sections.

### Tasks

- [x] (05A): Run Astryx discovery and establish admin table/form/dialog component choices
  - Source of Truth: `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `# 14. Admin Product Components`; `docs/design/design.md` > `# 15. Admin Category Components`; `docs/design/design.md` > `# 20. Common Form Components`; `docs/design/design.md` > `# 21. Common Feedback Components`; root `AGENTS.md` > `<!-- ASTRYX:START -->`
  - Source Requirements:
    - Admin pages use Astryx tables/forms/dialogs and no direct database calls.
    - Admin product/category views support tables, forms, and delete confirmations.
  - Details: Identify admin UI building blocks before writing management views.
  - Dependencies: Batch03
  - User Action: None
  - Agent Work: Run Astryx discovery commands and map admin UI components to existing or new files.
  - Specific Steps:
    1. Run `npx astryx build "admin product and category management"`.
    2. Inspect relevant templates named by Astryx with `npx astryx template <name>` or `--skeleton`.
    3. Inspect props/examples for table, form, dialog, badge, toolbar, loading, empty, and confirmation components with `npx astryx component <Name>`.
    4. Search existing admin/common components before creating shared admin table or form helpers.
    5. Keep admin UI scope limited to products and categories.
  - Output: Admin UI implementation notes and chosen component set.
  - Acceptance: Admin UI work proceeds from discovered Astryx components/templates and does not duplicate existing common components.
  - Validation: Astryx command outputs summarized in execution report.
  - Blocked Condition: None unless Astryx tooling is unavailable, in which case record the tooling failure and continue only with installed component evidence.
  - Files: Execution report; no required source changes unless component placeholders are adjusted.

- [x] (05B): Build admin product management table, form dialog, and delete confirmation
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.1 Product API`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `## 24.12 Admin Products Page`; `docs/design/design.md` > `# 14. Admin Product Components`; `docs/design/design.md` > `## 25.4 Admin Table States`
  - Source Requirements:
    - `AdminProductView` supports table, simple search if feasible, create/edit form dialog, and delete confirmation.
    - Admin product create/update validates required fields and non-negative price/quantity on the backend.
    - Product image upload is out of scope; use `imageUrl` text values.
  - Details: Build an admin product management view that uses admin product APIs and handles loading/error/empty/success states.
  - Dependencies: (05A), Batch01, Batch03
  - User Action: None
  - Agent Work: Implement product table, create/edit dialog, delete confirmation, and API-backed state refresh.
  - Specific Steps:
    1. Create or update `frontend/src/views/admin/AdminProductView.jsx`.
    2. Create or update `ProductForm.jsx` and reusable admin table components only as needed.
    3. List products through `productApi.js`.
    4. Wire create/update/delete actions to admin product endpoints.
    5. Use category API data for product category selection.
    6. Validate required form fields on the client for UX while preserving backend validation as source of truth.
    7. Use `imageUrl` text input only; do not implement upload.
    8. Show loading, empty, error, success, and delete confirmation states.
  - Output: Admin product management view.
  - Acceptance: Admin can create, edit, and delete products through the UI; customer/anonymous users cannot access the route.
  - Validation: Browser/manual admin product CRUD smoke test when backend/admin auth are available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live backend/admin credentials are unavailable.
  - Files: `frontend/src/views/admin/AdminProductView.jsx`, `frontend/src/components/admin/ProductForm.jsx`, `frontend/src/components/admin/AdminTable.jsx`, `frontend/src/api/productApi.js`, `frontend/src/api/categoryApi.js`

- [x] (05C): Build admin category management table, form dialog, and delete confirmation
  - Source of Truth: `docs/plans/Plan_2.md` > `## 4. Scope`; `docs/plans/Plan_2.md` > `### 7.2 Category API`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `## 24.13 Admin Categories Page`; `docs/design/design.md` > `# 15. Admin Category Components`; `docs/design/design.md` > `## 25.4 Admin Table States`
  - Source Requirements:
    - `AdminCategoryView` supports table, create/edit form dialog, and delete confirmation.
    - Category names must be unique.
    - Deleting a category with products should be blocked with a clear backend error.
  - Details: Build an admin category management view that uses admin category APIs and handles backend uniqueness/delete-guard errors clearly.
  - Dependencies: (05A), Batch01, Batch03
  - User Action: None
  - Agent Work: Implement category table, create/edit dialog, delete confirmation, and API-backed state refresh.
  - Specific Steps:
    1. Create or update `frontend/src/views/admin/AdminCategoryView.jsx`.
    2. Create or update `CategoryForm.jsx`.
    3. List categories through `categoryApi.js`.
    4. Wire create/update/delete actions to admin category endpoints.
    5. Show backend duplicate-name and delete-blocked errors without masking them.
    6. Include product count only if an existing API response supports it without expanding scope; otherwise omit it.
    7. Show loading, empty, error, success, and delete confirmation states.
  - Output: Admin category management view.
  - Acceptance: Admin can create, edit, and delete categories when allowed; categories with products cannot be deleted without a clear error.
  - Validation: Browser/manual admin category CRUD smoke test when backend/admin auth are available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live backend/admin credentials are unavailable.
  - Files: `frontend/src/views/admin/AdminCategoryView.jsx`, `frontend/src/components/admin/CategoryForm.jsx`, `frontend/src/components/admin/AdminTable.jsx`, `frontend/src/api/categoryApi.js`

- [x] (05D): Polish admin navigation, guard behavior, and admin table states
  - Source of Truth: `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/plans/Plan_2.md` > `## 9. Verification & Testing Plan`; `docs/design/design.md` > `## 5.2 AdminLayout`; `docs/design/design.md` > `## 6.2 AdminSidebar`; `docs/design/design.md` > `## 25.4 Admin Table States`
  - Source Requirements:
    - Admin product/category pages use Astryx tables/forms/dialogs and no direct database calls.
    - Customer navigation must not expose admin links to non-admin users.
    - Admin product/category pages must be manually verified.
  - Details: Confirm the admin UI is reachable only to admins and has consistent empty/loading/error behavior.
  - Dependencies: (05B), (05C), Batch03
  - User Action: None
  - Agent Work: Update admin navigation and shared table/feedback behavior as needed.
  - Specific Steps:
    1. Confirm admin sidebar includes Products and Categories.
    2. Confirm non-admin customer navigation does not expose admin links.
    3. Confirm route guards prevent non-admin access to admin product/category pages.
    4. Standardize admin table loading, empty, error, and success feedback using existing common/Astryx components.
    5. Search frontend source for direct database access or backend-only config names.
  - Output: Admin navigation and state polish.
  - Acceptance: Admin management flows are visible to admins, hidden/blocked for non-admin users, and consistent in state handling.
  - Validation: Browser/manual admin route guard and navigation smoke test.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only if live admin/customer auth validation is unavailable.
  - Files: `frontend/src/layouts/AdminLayout.jsx`, `frontend/src/layouts/MainLayout.jsx`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/components/admin/`, `frontend/src/components/common/`

### Files or Modules Likely Created or Updated

- `frontend/src/views/admin/AdminProductView.jsx`
- `frontend/src/views/admin/AdminCategoryView.jsx`
- `frontend/src/components/admin/ProductForm.jsx`
- `frontend/src/components/admin/CategoryForm.jsx`
- `frontend/src/components/admin/AdminTable.jsx`
- `frontend/src/layouts/AdminLayout.jsx`
- `frontend/src/layouts/MainLayout.jsx`
- `frontend/src/routes/AppRoutes.jsx`

### Required Outputs / Artifacts

- Admin product table/form/delete flow.
- Admin category table/form/delete flow.
- Admin route and navigation behavior.
- Loading, empty, error, success, and confirmation states.

### Acceptance Criteria

- Admin product/category pages are demoable.
- Admin product/category mutations call backend APIs only.
- Admin-only pages are not accessible to anonymous or customer users.
- Product image upload is not implemented.
- Category delete-blocked errors are visible and clear.
- UI uses Astryx components/tokens.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser/manual admin product create/edit/delete smoke test.
- Browser/manual admin category create/edit/delete smoke test.
- Admin/customer/anonymous route guard checks.
- Search frontend for forbidden database access.

### Explicit Non-Goals

- Admin order management.
- Admin review management.
- Admin reports/revenue dashboards.
- Product image upload.
- Advanced inventory or warehouse tools.

## Mandatory Batch06 - Verification, Security Audit, and Phase 3 Handoff

### Goal

Verify Phase 2 backend APIs, frontend flows, security boundaries, MVC separation, Astryx compliance, progress tracking, and Phase 3 handoff notes.

### Why this batch exists

Phase 3 checkout/order work depends on verified product lookup, cart behavior, auth identity, admin guards, frontend cart state, and unchanged stock behavior.

### Inputs / Dependencies

- Batch01 through Batch05 outputs.
- User-provided real backend `.env`, database setup, and admin/customer credentials for live API/UI validation.

### Tasks

- [ ] (06A): Run backend command checks and product/category/cart API smoke tests
  - Source of Truth: `docs/plans/Plan_2.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_2.md` > `### 7.1 Product API`; `docs/plans/Plan_2.md` > `### 7.2 Category API`; `docs/plans/Plan_2.md` > `### 7.3 Cart API`
  - Source Requirements:
    - Run backend validation/startup commands.
    - Smoke test product, category, and cart endpoints.
    - Product list returns seeded products with category data.
    - Product search/filter narrows results.
    - Admin can create/update/delete products/categories.
    - Customer cannot call admin product/category routes.
    - Authenticated customer can add/update/remove cart items.
    - Cart subtotal matches quantity times captured `unitPrice`.
    - Add-to-cart rejects quantities greater than stock.
    - Product stock is unchanged after cart operations.
  - Details: Prove the backend API contract and access-control behavior through local commands and HTTP checks.
  - Dependencies: Batch01, Batch02
  - User Action: User must provide real backend `.env`, running Supabase PostgreSQL, seeded data, and safe test admin/customer credentials for full live checks.
  - Agent Work: Run backend commands and API smoke checks, or mark blocked items honestly with safe reasons.
  - Specific Steps:
    1. Run `cd backend && npx prisma validate`.
    2. Start backend with `cd backend && npm run dev` long enough to confirm startup.
    3. Smoke test public category and product endpoints.
    4. Smoke test product filters with `keyword`, `categoryId`, `minPrice`, and `maxPrice`.
    5. Smoke test admin product/category create, update, and delete as admin.
    6. Verify admin product/category routes reject customer and anonymous requests.
    7. Smoke test cart get, add, update, and remove as customer.
    8. Verify subtotal, above-stock rejection, and stock unchanged after cart operations.
    9. Summarize results without printing JWTs, passwords, or database connection strings.
  - Output: Backend/API validation evidence.
  - Acceptance: Commands and smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output and HTTP smoke-test summary.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if real env values, live database, backend server, seeded data, or test credentials are unavailable.
  - Files: Execution report, optional `docs/demo-checklist.md`

- [ ] (06B): Run frontend command checks and customer/admin UI smoke tests
  - Source of Truth: `docs/plans/Plan_2.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; `docs/design/design.md` > `# 25. Page State Requirements`; `docs/design/design.md` > `# 26. Responsive Rules`
  - Source Requirements:
    - Run frontend dev command.
    - Open homepage, product list, product detail, cart, admin products, and admin categories.
    - Customer product pages show loading, empty, success, and error states.
    - Admin product/category pages use Astryx tables/forms/dialogs and no direct database calls.
    - Customer navigation does not expose admin links to non-admin users.
  - Details: Verify the Phase 2 UI flows from browser/manual checks and command output.
  - Dependencies: Batch03, Batch04, Batch05, (06A)
  - User Action: User must provide running backend/API data and admin/customer login credentials for full live UI checks.
  - Agent Work: Run frontend commands and perform browser/manual UI smoke checks, or record blocked live checks honestly.
  - Specific Steps:
    1. Run `cd frontend && npm run dev`.
    2. Open homepage and verify featured products or appropriate loading/error state.
    3. Open product list and verify search/filter, empty, loading, success, and error behavior where practical.
    4. Open product detail and verify add-to-cart success/error behavior.
    5. Open cart and verify quantity update, remove, subtotal, empty state, and checkout placeholder.
    6. Login as admin and verify admin product/category management routes.
    7. Verify non-admin customer navigation does not expose admin links.
    8. Verify responsive product grid/filter behavior at desktop, tablet, and mobile sizes when browser tooling is available.
  - Output: Frontend/UI validation evidence.
  - Acceptance: UI smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output, browser/manual smoke summary, and screenshot evidence if available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if backend, seeded data, login credentials, or browser tooling is unavailable.
  - Files: Execution report, optional `docs/demo-checklist.md`

- [ ] (06C): Audit security, MVC boundaries, anti-duplication, and Astryx compliance
  - Source of Truth: `docs/plans/Plan_2.md` > `## 3. Prerequisites from Prior Phases`; `docs/plans/Plan_2.md` > `## 5. Out of Scope`; `docs/plans/Plan_2.md` > `### 7.4 Frontend UI Contract`; root `AGENTS.md` > `# Custom Rules & Workflows`; README > `## Phase 2 Handoff Contract`
  - Source Requirements:
    - Phase 2 must reuse existing foundation artifacts.
    - UI must stay aligned with Astryx components and tokens.
    - Frontend must not connect directly to Supabase PostgreSQL.
    - No schema redesign, duplicate helpers, or out-of-scope feature implementation.
  - Details: Search and inspect the implementation for security leaks, duplicated core helpers, MVC boundary violations, and scope drift.
  - Dependencies: Batch01 through Batch05
  - User Action: None
  - Agent Work: Run focused searches and inspect files touched during Phase 2.
  - Specific Steps:
    1. Search for committed real `.env` files and credential-like strings.
    2. Search frontend source for `DATABASE_URL`, `DIRECT_URL`, Prisma imports, Supabase database URLs, SQL, and backend-only config names.
    3. Search backend for duplicate Prisma client exports, response helpers, JWT helpers, and API client-like logic in controllers/models.
    4. Inspect controllers/models to confirm HTTP logic stays in controllers and data access stays in models.
    5. Inspect UI files for direct database calls and raw styling that violates Astryx/token rules.
    6. Search for out-of-scope checkout, order creation, payment, review, report, upload, or shipping implementation added during Phase 2.
    7. Confirm files remain focused and split any broad mixed-responsibility file if needed.
  - Output: Security/MVC/duplication/scope audit result.
  - Acceptance: No secrets, direct frontend database access, duplicate core helpers, or out-of-scope behavior are present.
  - Validation: `rg`/grep search summaries and manual inspection notes.
  - Blocked Condition: None
  - Files: Execution report; changed source files only if fixes are needed.

- [ ] (06D): Update demo checklist, execution report, and Phase 3 handoff notes
  - Source of Truth: `docs/plans/Plan_2.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_2.md` > `## 10. Handoff Notes for Phase 3`; `docs/plans/Master_Plan.md` > `## 26. Final Submission Checklist`
  - Source Requirements:
    - Phase 3 must consume product lookup/stock behavior, cart behavior and item shape, auth middleware/current-user identity, admin middleware, `CartContext`, `cartApi.js`, `productApi.js`, and route/layout patterns.
    - Phase 3 must not reduce stock during cart updates.
    - Phase 3 must not duplicate cart subtotal logic in the frontend as source of truth.
    - Phase 3 must not create separate checkout-only product queries if existing product model helpers can be reused.
    - Phase 3 must not alter Phase 1 schema without explicit migration section and verification.
  - Details: Preserve validation evidence and handoff constraints for the next execution phase.
  - Dependencies: (06A), (06B), (06C)
  - User Action: User may need to confirm manual checks that cannot be performed by the agent, such as local browser observations or unavailable credentials.
  - Agent Work: Update docs and reports with verified results, blocked items, and Phase 3 handoff artifacts.
  - Specific Steps:
    1. Update `docs/demo-checklist.md` with actual Phase 2 backend/API/frontend/admin/cart check statuses.
    2. Write or update execution report entries for completed batches and blocked validations.
    3. Add Phase 3 handoff notes to README or an appropriate docs file without claiming unimplemented Phase 3 features.
    4. Name the product/cart/frontend artifacts Phase 3 must reuse.
    5. Record blocked checks as `BLOCKED_BY_USER_ACTION` instead of completed.
    6. Synchronize this task file progress tracker if the execution workflow requires checklist updates.
  - Output: Updated demo checklist, execution report, and Phase 3 handoff notes.
  - Acceptance: Future Phase 3 agents can start checkout/order work from verified Phase 2 artifacts and constraints.
  - Validation: Manual doc review against Plan 2 verification and handoff sections.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only for user-side manual checks or credential-dependent live validation.
  - Files: `docs/demo-checklist.md`, `README.md`, `docs/reports/report_2_execute_agent.md`, `docs/tasks/task_2.md`

### Files or Modules Likely Created or Updated

- `docs/demo-checklist.md`
- `README.md`
- `docs/reports/report_2_execute_agent.md`
- `docs/tasks/task_2.md`
- Runtime files only if validation finds defects requiring repair

### Required Outputs / Artifacts

- Backend command validation summary.
- Product/category/cart API smoke-test summary.
- Frontend command/UI smoke-test summary.
- Security/MVC/duplication/Astryx audit summary.
- Phase 3 handoff notes.

### Acceptance Criteria

- Backend and frontend commands pass or are explicitly blocked by user setup.
- Product/category/cart APIs satisfy Plan 2 behavior.
- Customer and admin UI flows are demoable or honestly blocked by missing setup.
- No secrets are exposed.
- MVC boundaries remain clear.
- Phase 3 handoff artifacts and rules are documented.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- `cd backend && npm run dev`
- Product/category/cart API smoke tests listed in Plan 2.
- `cd frontend && npm run dev`
- Browser/manual checks for homepage, product list, product detail, cart, admin products, and admin categories.
- Admin/customer/anonymous authorization checks.
- Security and forbidden-import searches.

### Explicit Non-Goals

- Implementing Phase 3 checkout/order/payment behavior.
- Claiming completion for credential-dependent checks that were not run.
- Adding new architecture beyond Plan 2.

## Optional Future Tracks

These tracks are not part of the mandatory Plan 2 batch chain.

- Checkout, order creation, COD payment records, customer order history/detail, and admin order status management belong to Phase 3.
- Product reviews and review forms are out of Phase 2 even if the design document contains product review component references.
- Revenue reports, best-selling reports, admin report pages, and advanced dashboard metrics are out of Phase 2.
- Product image upload is out of Phase 2. Use `imageUrl` text values from seed/admin forms only.
- Advanced inventory, warehouse behavior, shipping provider integration, online payment, chatbot, recommendations, email flows, mobile app, Supabase Auth, and Supabase Edge Functions are not needed for this phase.
- Optional product pagination and sorting may be added only if simple and not delaying required search/filter/product/cart/admin work.

## Dependency Chain

- Batch01 -> Batch02
- Batch02 -> Batch03
- Batch03 -> Batch04
- Batch04 -> Batch05
- Batch05 -> Batch06

Batch04 customer UI and Batch05 admin UI can be implemented in parallel after Batch03 only if they do not edit the same shared components/routes at the same time. Batch06 depends on all mandatory implementation batches.

## Global Verification Checklist

- [ ] Current AGENTS instructions were read and followed.
- [ ] Repository was searched before adding new helpers, utilities, configs, API clients, contexts, components, or business logic.
- [ ] No duplicated Prisma client, response helper, JWT helper, auth/admin middleware, API client, cart subtotal source, or validation helper was added.
- [ ] Product/category/cart backend code uses existing MVC boundaries.
- [ ] Frontend does not import Prisma, use SQL, expose Supabase PostgreSQL credentials, or access the database directly.
- [ ] Real `.env` files and secrets are not committed, printed, logged, or documented.
- [ ] Product APIs support required list/detail/admin behavior and query filters.
- [ ] Category APIs support list/admin behavior, unique names, and blocked delete when products exist.
- [ ] Cart APIs require auth, create carts as needed, increment duplicate products, enforce stock, preserve captured unit price, and return backend subtotal.
- [ ] Cart operations do not reduce product stock.
- [ ] Customer Home, Product List, Product Detail, and Cart views are implemented with loading, empty, error, and success states.
- [ ] Admin Product and Category views are implemented with table, form dialog, delete confirmation, and guard behavior.
- [ ] Astryx discovery was run before UI implementation or tooling failure was recorded.
- [ ] UI uses Astryx components/tokens and avoids unsupported raw layout/styling.
- [ ] Product image upload, checkout, orders, payments, reviews, reports, shipping, and advanced inventory remain out of scope.
- [ ] Backend validations and API smoke tests passed or were marked blocked with safe reasons.
- [ ] Frontend command and browser/manual smoke tests passed or were marked blocked with safe reasons.
- [ ] Progress tracker matches all task IDs exactly.
- [ ] Phase 3 handoff notes identify reusable product, cart, auth, admin, API, context, and route/layout artifacts.

## Progress Tracker

### Batches

- [x] Batch01 - Backend Catalog APIs
- [x] Batch02 - Backend Cart APIs
- [x] Batch03 - Frontend API, Cart State, and Routing
- [ ] Batch04 - Customer Catalog and Cart UI
- [ ] Batch05 - Admin Product and Category UI
- [ ] Batch06 - Verification, Security Audit, and Phase 3 Handoff

### Task IDs

#### Batch01
- [x] (01A): Inspect Phase 1 backend patterns and catalog model placeholders
- [x] (01B): Implement product model functions for list, detail, create, update, and delete
- [x] (01C): Implement category model functions for list, create, update, delete, and product checks
- [x] (01D): Implement product/category controllers, routes, admin protection, and API mounting

#### Batch02
- [x] (02A): Implement cart model functions for get/create, add, update, remove, and subtotal
- [x] (02B): Enforce cart quantity and stock validation at the backend source of truth
- [x] (02C): Implement cart controller, authenticated routes, and route mounting

#### Batch03
- [x] (03A): Add product, category, and cart API helpers using the existing API client pattern
- [x] (03B): Build `CartContext` using auth state and backend cart APIs
- [x] (03C): Wire Phase 2 routes, navigation entries, and route guards

#### Batch04
- [x] (04A): Run Astryx discovery and establish reusable customer UI component choices
- [x] (04B): Build Home and product list search/filter experience
- [x] (04C): Build product detail and add-to-cart flow
- [x] (04D): Build cart view, item controls, removal, subtotal, and checkout placeholder

#### Batch05
- [x] (05A): Run Astryx discovery and establish admin table/form/dialog component choices
- [x] (05B): Build admin product management table, form dialog, and delete confirmation
- [x] (05C): Build admin category management table, form dialog, and delete confirmation
- [x] (05D): Polish admin navigation, guard behavior, and admin table states

#### Batch06
- [ ] (06A): Run backend command checks and product/category/cart API smoke tests
- [ ] (06B): Run frontend command checks and customer/admin UI smoke tests
- [ ] (06C): Audit security, MVC boundaries, anti-duplication, and Astryx compliance
- [ ] (06D): Update demo checklist, execution report, and Phase 3 handoff notes

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
