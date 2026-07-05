# Electronics E-Commerce Plan 4 Execution Tasks

## Purpose

Convert Plan 4 into a detailed, batch-based execution task file for implementing product reviews, simple admin reports, final UI polish, documentation, full MVC validation, and demo/submission readiness.

This file is for future execution agents. It does not implement runtime code.

## Project Context Notes

- README status: read successfully.
- Project purpose: course-project MVC web application for an electronics e-commerce store.
- Current stack: React, Vite, and Astryx for the View layer; Express.js JSON REST APIs for the Controller layer; Prisma ORM with Supabase PostgreSQL for the Model/database layer; JWT and bcrypt for authentication.
- Existing validation commands documented by README: `cd backend && npx prisma validate`, `cd backend && npx prisma migrate dev --name init`, `cd backend && npx prisma db seed`, `cd backend && npm run dev`, `cd frontend && npm run dev`.
- Current implementation state documented by README: Plan 1 auth/user/foundation, Plan 2 product/category/cart/customer/admin catalog work, and Plan 3 order/payment/customer-order/admin-order work are implemented or tracked as handoff artifacts for Phase 4.
- Current file audit note: `backend/src/models/review.model.js` already exists as a minimal `findById` placeholder and must be expanded or refactored instead of duplicated.
- Current schema note: `ReviewStatus` already supports `visible` and `hidden`; `Review` has no user/product uniqueness constraint, so multiple reviews per user/product should remain allowed unless the user explicitly approves a schema migration.
- README conflicts: none found. README Phase 4 handoff aligns with Plan 4: reports must use backend/database order and payment data, review/report work must reuse existing auth/admin/order/payment/product artifacts, and credential-dependent live checks must be marked `BLOCKED_BY_USER_ACTION`.

## Authoritative Source

- Primary phase source: `docs/plans/Plan_4.md`
- Supporting architecture source referenced by Plan 4: `docs/plans/Master_Plan.md`
- Supporting UI source referenced by Plan 4: `docs/design/design.md`
- Project context only: `README.md`
- Local agent rules: `AGENTS.md`
- Scope resolution: `docs/plans/Plan_4.md` is the approved Phase 4 slice. Where the master plan or design document includes broader dashboard charts, upload, real shipping, online payment, chatbot, recommendation, or mobile behavior, follow the narrower Plan 4 scope unless the user explicitly changes the plan.
- Source note: Plan 4 references some master-plan sections by old numbering labels. Use the current heading names listed in the Source Section Index when grounding implementation work.
- Conditional scope note: Plan 4 makes the admin review moderation UI conditional on time and must-have completion. The backend admin review moderation endpoint is mandatory; the full admin review moderation view is listed under Optional Future Tracks.

## Source Section Index

- `docs/plans/Plan_4.md` > `## 1. Objective` -> Phase 4 goal: reviews, admin reports, UI polish, full MVC testing, documentation, demo, and presentation readiness.
- `docs/plans/Plan_4.md` > `## 2. Source of Truth` -> master plan and design sections that support Phase 4.
- `docs/plans/Plan_4.md` > `## 3. Prerequisites from Prior Phases` -> required Phase 1, Phase 2, and Phase 3 backend, frontend, auth, product, cart, order, payment, admin, and demo-data artifacts.
- `docs/plans/Plan_4.md` > `## 4. Scope` -> required review APIs, customer review UI, report APIs, admin dashboard/report views, responsive polish, final testing, documentation, demo checklist, and presentation support.
- `docs/plans/Plan_4.md` > `## 5. Out of Scope` -> online payment, shipping provider, email, realtime, AI, recommendations, mobile app, advanced systems, image upload, and dashboard chart exclusions.
- `docs/plans/Plan_4.md` > `## 6. Target Directory Structure` -> expected review/report backend, frontend, and docs modules.
- `docs/plans/Plan_4.md` > `## 7. Technical Specifications` -> review API, report API, admin dashboard UI, and documentation contracts.
- `docs/plans/Plan_4.md` > `### 7.1 Review API` -> public visible review list, authenticated review creation, rating validation, comment trimming, visible default, and admin hide/delete behavior.
- `docs/plans/Plan_4.md` > `### 7.2 Report API` -> admin-only revenue, best-selling products, and order-summary contracts.
- `docs/plans/Plan_4.md` > `### 7.3 Admin Dashboard UI Contract` -> report endpoints, loading/empty/error/success states, Astryx cards/tables, and no direct Supabase queries from React.
- `docs/plans/Plan_4.md` > `### 7.4 Documentation Contract` -> README, database design, demo checklist, optional API testing, and ERD requirements.
- `docs/plans/Plan_4.md` > `## 8. Implementation Steps` -> ordered implementation checklist.
- `docs/plans/Plan_4.md` > `## 9. Verification & Testing Plan` -> backend/frontend commands, API smoke tests, demo flow, expected evidence, and manual quality checks.
- `docs/plans/Plan_4.md` > `## 10. Handoff Notes for Final Submission` -> final deliverable, hard final rules, and demo readiness.
- `docs/plans/Master_Plan.md` > `## 6. Project Scope` -> product review, admin dashboard, revenue report, and best-selling products are in scope; real online payment, shipping, email, realtime, AI, recommendation, mobile, multi-store, warehouse, and accounting systems are out of scope.
- `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.8 ReviewController` -> product review endpoints and admin inappropriate-review deletion behavior.
- `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.9 ReportController` -> revenue, best-selling products, and order-status report actions.
- `docs/plans/Master_Plan.md` > `## 14. View Design` -> React views display data, collect user input, call APIs, show states, and never access databases or contain SQL/model definitions.
- `docs/plans/Master_Plan.md` > `## 15. API Design Summary` > `### Review APIs` -> review endpoint family.
- `docs/plans/Master_Plan.md` > `## 15. API Design Summary` > `### Report APIs` -> report endpoint family.
- `docs/plans/Master_Plan.md` > `## 16. Development Timeline` > `### Week 4 - Review, Report, Testing, Documentation` -> Week 4 outputs: product review works, revenue report works, best-selling report works, demo/docs/presentation ready.
- `docs/plans/Master_Plan.md` > `## 21. Minimum Viable Demo Flow` -> customer flow through review and admin flow through reports.
- `docs/plans/Master_Plan.md` > `## 22. MVC Acceptance Criteria` -> model, view, and controller acceptance expectations.
- `docs/plans/Master_Plan.md` > `## 23. Testing Plan` -> Postman/API, view, model, and database test coverage.
- `docs/plans/Master_Plan.md` > `## 24. Risk Management` -> strict MVC folders, scope control, integration testing, and secret handling.
- `docs/plans/Master_Plan.md` > `## 25. Priority List` -> must-have and should-have prioritization; review and basic revenue report are should-have.
- `docs/plans/Master_Plan.md` > `## 26. Final Submission Checklist` -> final run, database, report, documentation, ERD, presentation, and demo-script checks.
- `docs/plans/Master_Plan.md` > `## 27. Suggested Presentation Division` -> member presentation responsibilities.
- `docs/design/design.md` > `## 7.6 ProductReviewList` -> review list content and Astryx references.
- `docs/design/design.md` > `## 7.7 ProductReviewForm` -> review form fields and Astryx references.
- `docs/design/design.md` > `# 13. Admin Dashboard Components` -> dashboard metric cards, metric grid, recent orders, low stock, and quick actions.
- `docs/design/design.md` > `# 18. Admin Review Components` -> optional admin review table, status badge, and action menu design.
- `docs/design/design.md` > `# 19. Report Components` -> revenue summary, best-selling products table, and order summary cards.
- `docs/design/design.md` > `# 20. Common Form Components` -> reusable form primitive guidance.
- `docs/design/design.md` > `# 21. Common Feedback Components` -> toast, banner, loading, empty, and confirm feedback guidance.
- `docs/design/design.md` > `# 22. Common Utility Components` -> page header, toolbar, pagination, price/date/rating utility guidance.
- `docs/design/design.md` > `# 23. Status Components` -> review status and existing order/payment status display meanings.
- `docs/design/design.md` > `# 24. Page-to-Component Map` -> product detail, admin dashboard, admin reviews, and admin reports page composition.
- `docs/design/design.md` > `# 25. UI States` -> initial, loading, success, empty, validation error, API error, and permission denied states.
- `docs/design/design.md` > `# 26. Responsive Design` -> desktop, tablet, and mobile layout expectations.
- `docs/design/design.md` > `# 27. Accessibility Checklist` -> labels, focus states, keyboard dialogs, table headers, and readable feedback.
- `docs/design/design.md` > `# 28. Component Priority` -> required and complete UI component priorities.
- `docs/design/design.md` > `# 29. Astryx Component Mapping Summary` -> Astryx references for app layout, tables, cards, forms, status labels, messages, loading, empty states, dashboard metrics, and toolbar.
- `docs/design/design.md` > `# 30. Final UI Checklist` -> customer/admin UI and component-quality completion checks.

## Approved Architecture Summary

- Continue the existing MVC architecture: Prisma model modules own data access and aggregation, Express controllers own HTTP/request behavior, and React views own presentation.
- Supabase remains hosted PostgreSQL only. Do not use Supabase Auth, Supabase client-side database access, Edge Functions, direct React database access, or a second ORM.
- Reuse `backend/src/config/database.js`, existing model/controller/route patterns, `backend/src/utils/response.js`, `auth.middleware.js`, `admin.middleware.js`, and frontend `apiClient.js`.
- Expand the existing `backend/src/models/review.model.js` placeholder instead of creating a duplicate review data-access module.
- Review creation requires authentication; public review list returns only `status: "visible"` reviews sorted newest first.
- Review ratings must be integers from 1 to 5. Comments are optional but must be trimmed before persistence.
- New reviews default to visible. Because the current schema has no unique user/product review constraint, allow multiple reviews and keep the UI clear instead of adding a schema migration.
- Admin review moderation API should prefer setting `status: "hidden"` over physical deletion because the schema already includes `ReviewStatus`.
- Report APIs are admin-only and must compute from backend/database order, order detail, product, and payment data, not from frontend state.
- Phase 4 revenue definition is completed orders with paid COD payment. Use this definition consistently for revenue and best-selling product reports.
- Best-selling products aggregate `OrderDetail.quantity` by product and should be limited to a simple top 5 or top 10.
- Frontend work must reuse existing layouts, route guards, API helper patterns, status components, and Astryx setup.
- UI must follow `docs/design/design.md` and the root Astryx instructions before introducing or changing review/report/dashboard components.
- Documentation updates must describe implemented runtime behavior honestly. Do not present planned or placeholder UI as completed runtime behavior.
- Final verification must freeze scope after must-have and should-have items are verified.

## Global Implementation Rules

- Read root `AGENTS.md` or the current AGENTS instructions before implementation and follow search-before-write, reuse, SRP, YAGNI, and root-cause rules.
- Search existing code before adding functions, helpers, utilities, configs, API clients, contexts, components, or business logic. Use grep or an `rg` grep-equivalent search and record what was reused.
- Reuse or safely refactor existing review, product, order, payment, response, auth, admin, API client, route, layout, and status-component code. Do not duplicate core logic.
- Keep files focused. If a source file approaches broad mixed responsibilities or the local 300-line guidance, split by model/controller/component responsibility.
- Use exactly one Prisma client export, one response helper family, one auth/admin middleware path, one frontend API client pattern, and one route-guard pattern.
- Keep real `.env` values, Supabase credentials, JWT secrets, user passwords, database URLs, and API tokens out of committed files, logs, docs, UI, and execution reports.
- Treat missing real database/JWT credentials, seeded users/products/orders/reviews, local `.env` values, or unavailable local servers as `BLOCKED_BY_USER_ACTION` for live validation, not as completed work.
- Keep frontend code free of Prisma imports, Supabase database credentials, backend-only config names, SQL, and database logic.
- Use Astryx workflow before writing UI: run `npx astryx build "product reviews admin reports dashboard"`, inspect relevant templates with `npx astryx template <name>`, and inspect component props with `npx astryx component <Name>` for components used.
- Follow Astryx project rules: use components for layout/spacing, prefer component props, use tokens for custom styling, avoid raw hex/px values, and do not introduce utility-class or Tailwind-style styling.
- Do not implement online payment, shipping provider integration, email verification, forgot password, realtime notifications, AI chatbot, recommendations, mobile app, multi-store, advanced warehouse, accounting, product image upload, or dashboard charts unless the user explicitly expands scope after mandatory work is verified.
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
| Batch01 | Backend Review APIs | Review model helpers, controllers, routes, auth/admin behavior, visible listing, creation, and hide/delete moderation API are implemented. |
| Batch02 | Customer Review UI | Product detail review list/form, review API helper, states, auth handling, and refresh behavior are implemented with Astryx. |
| Batch03 | Backend Report APIs | Admin-only revenue, best-selling products, and order-summary report model/controller/route behavior is implemented from database data. |
| Batch04 | Admin Dashboard and Report UI | Report API helper, admin report page, dashboard metrics, and simple report components consume backend report APIs. |
| Batch05 | Polish, Documentation, and Demo Artifacts | Responsive polish and README/database/demo/API/presentation documentation are updated to match implemented behavior. |
| Batch06 | Final Verification, Audit, and Submission Readiness | Full backend/API/frontend/UI/security/MVC/scope checks are completed or honestly blocked with final evidence. |

## Mandatory Batch01 - Backend Review APIs

### Goal

Implement the backend review data-access, controller, and route behavior required for customer product reviews and admin review moderation.

### Why this batch exists

Customer review UI and final demo checks require a stable backend API that lists only visible reviews, validates authenticated review creation, and lets admins hide or delete inappropriate reviews without duplicating model or response logic.

### Inputs / Dependencies

- Phase 1 Prisma client, auth middleware, admin middleware, response helper, and route mounting patterns.
- Phase 2 product APIs and product detail behavior.
- Phase 3 auth/admin route conventions.
- Existing `Review` Prisma model and `ReviewStatus` enum.
- Existing `backend/src/models/review.model.js` placeholder.

### Tasks

- [x] (01A): Inspect review schema and backend conventions
  - Source of Truth: `docs/plans/Plan_4.md` > `## 3. Prerequisites from Prior Phases`; `docs/plans/Plan_4.md` > `## 8. Implementation Steps`; `backend/prisma/schema.prisma` > `model Review`; `README.md` > `## Phase 4 Handoff Notes`
  - Source Requirements:
    - Phase 4 must reuse prior auth, admin, product, order, payment, and route artifacts.
    - Review work must use the existing `Review` schema and `visible`/`hidden` status values.
    - Existing review placeholder code must be reused or safely expanded.
  - Details: Establish exact backend conventions before writing review logic.
  - Dependencies: None
  - User Action: None
  - Agent Work: Read AGENTS instructions, inspect schema/model/controller/route/response patterns, and identify reusable helper boundaries.
  - Specific Steps:
    1. Read current root `AGENTS.md` or equivalent instructions.
    2. Search backend source for existing review, product, response, auth, admin, validation, route, and Prisma helper code.
    3. Inspect `backend/prisma/schema.prisma` for exact `Review`, `ReviewStatus`, `User`, and `Product` field names and relations.
    4. Inspect existing product detail/product model behavior so review code can verify product existence without duplicate product logic.
    5. Record that `backend/src/models/review.model.js` will be expanded instead of replaced by another review data-access file.
  - Output: Review backend implementation approach aligned with existing patterns.
  - Acceptance: Execution notes identify reusable files and no duplicate backend helper path is planned.
  - Validation: `rg "Review|review|ReviewStatus|visible|hidden|response|admin|auth|prisma" backend/src backend/prisma`
  - Blocked Condition: None
  - Files: No required code changes unless stale placeholders must be aligned before implementation.

- [x] (01B): Implement review model helpers
  - Source of Truth: `docs/plans/Plan_4.md` > `### 7.1 Review API`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.8 ReviewController`
  - Source Requirements:
    - Public list returns only visible reviews sorted newest first.
    - Authenticated customers can create reviews with rating and optional comment.
    - New reviews default to visible.
    - Admin moderation should hide reviews by status when possible.
  - Details: Add focused Prisma helpers for review list, creation, lookup, and hide/delete behavior.
  - Dependencies: (01A)
  - User Action: None
  - Agent Work: Expand the existing review model module with reusable data-access functions and no HTTP response logic.
  - Specific Steps:
    1. Add a visible-review list helper scoped by product id, sorted newest first, including safe user display fields.
    2. Add a create helper that accepts authenticated user id, product id, rating, and trimmed optional comment.
    3. Preserve or adapt `findById` for admin moderation needs.
    4. Add a hide helper that sets `status: "hidden"` and returns the updated review.
    5. Add physical delete only if needed by existing route conventions, with hide preferred by default.
    6. Keep model helpers free of Express `req`, `res`, and response-helper calls.
  - Output: Review model helpers for visible list, create, find, and hide/delete.
  - Acceptance: Helpers use the existing Prisma client, preserve MVC separation, and do not add schema changes.
  - Validation: `cd backend && npx prisma validate`
  - Blocked Condition: None
  - Files: `backend/src/models/review.model.js`

- [x] (01C): Implement review controller and routes
  - Source of Truth: `docs/plans/Plan_4.md` > `## 4. Scope`; `docs/plans/Plan_4.md` > `### 7.1 Review API`; `docs/plans/Master_Plan.md` > `## 15. API Design Summary` > `### Review APIs`
  - Source Requirements:
    - Implement `GET /api/products/:id/reviews`.
    - Implement `POST /api/products/:id/reviews`.
    - Implement `DELETE /api/admin/reviews/:id`.
    - Creation requires authentication.
    - Admin delete/hide requires admin authorization.
    - Rating must be an integer from 1 to 5 and comment should be trimmed.
  - Details: Expose review model behavior through Express controllers and routes under the existing `/api` router structure.
  - Dependencies: (01B)
  - User Action: None
  - Agent Work: Add or update review controller and routes with validation, auth/admin middleware, consistent success/error responses, and route mounting.
  - Specific Steps:
    1. Search current route mounting patterns before adding review routes.
    2. Implement public visible-review list controller.
    3. Implement authenticated create-review controller with product id, rating, comment trimming, and validation errors.
    4. Implement admin hide/delete controller that hides by status unless a physical-delete convention is explicitly chosen and documented.
    5. Create or update `review.routes.js` and mount it under the existing `/api` route index.
    6. Ensure route paths exactly match Plan 4.
  - Output: Review HTTP endpoints mounted under `/api`.
  - Acceptance: Review endpoints return consistent JSON responses, enforce auth/admin boundaries, and expose no database details to frontend code.
  - Validation: `cd backend && npx prisma validate`; API smoke in (01D)
  - Blocked Condition: None
  - Files: `backend/src/controllers/review.controller.js`, `backend/src/routes/review.routes.js`, `backend/src/routes/index.js`, optionally validation middleware files if existing patterns require them.

- [x] (01D): Validate backend review API behavior
  - Source of Truth: `docs/plans/Plan_4.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_4.md` > `### 7.1 Review API`
  - Source Requirements:
    - Smoke test review list, creation, and admin hide/delete behavior.
    - Hidden/deleted reviews must no longer appear in public product detail review results.
    - Auth and admin restrictions must hold.
  - Details: Prove the backend review contract through local commands and HTTP checks.
  - Dependencies: (01C)
  - User Action: User must provide working `backend/.env`, Supabase database access, seeded product/customer/admin data, and safe test credentials for full live checks.
  - Agent Work: Run backend commands and review API smoke checks, or mark credential/database-dependent steps blocked with safe reasons.
  - Specific Steps:
    1. Run `cd backend && npx prisma validate`.
    2. Start backend with `cd backend && npm run dev` long enough to confirm startup.
    3. Obtain customer/admin auth through a safe local test flow without printing tokens.
    4. Smoke test `GET /api/products/:id/reviews` for a product with no reviews and with visible reviews.
    5. Smoke test `POST /api/products/:id/reviews` for valid and invalid ratings.
    6. Smoke test unauthenticated review creation rejection.
    7. Smoke test `DELETE /api/admin/reviews/:id` or hide behavior as admin.
    8. Confirm hidden/deleted reviews are absent from public listing.
  - Output: Backend review API validation evidence.
  - Acceptance: Commands and smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output and HTTP smoke-test summary.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if real env values, live database, backend server, seeded data, or safe test credentials are unavailable.
  - Files: Execution report, optional `docs/demo-checklist.md`

### Files or Modules Likely Created or Updated

- `backend/src/models/review.model.js`
- `backend/src/controllers/review.controller.js`
- `backend/src/routes/review.routes.js`
- `backend/src/routes/index.js`
- Existing backend validation middleware files only if reused by local pattern

### Required Outputs / Artifacts

- Review model helpers.
- Review controller and mounted routes.
- Backend review API smoke-test evidence.

### Acceptance Criteria

- Public review list returns visible reviews newest first.
- Authenticated users can create valid reviews.
- Invalid rating and unauthenticated creation fail cleanly.
- Admin hide/delete is protected by admin middleware.
- Hidden/deleted reviews no longer appear publicly.
- No duplicate Prisma client, response helper, or review data-access module is added.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- `cd backend && npm run dev`
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews`
- `DELETE /api/admin/reviews/:id`
- Authenticated, unauthenticated, and admin/non-admin access checks.

### Explicit Non-Goals

- Review upvotes, threaded replies, average rating denormalization, moderation queues, spam detection, schema redesign, or product image upload.
- Direct frontend database access.

## Mandatory Batch02 - Customer Review UI

### Goal

Add customer-facing product review list and review form behavior to product detail using the backend review APIs and Astryx-aligned UI states.

### Why this batch exists

The minimum demo flow requires a customer to open product detail and add a product review. The UI must consume backend APIs instead of local placeholders or direct database access.

### Inputs / Dependencies

- Batch01 review API endpoints.
- Existing `ProductDetailView`.
- Existing auth state and API client pattern.
- Astryx setup in the app entry.
- Design sections for `ProductReviewList`, `ProductReviewForm`, feedback, utility, status, and product detail page mapping.

### Tasks

- [ ] (02A): Add review API helper using existing API client pattern
  - Source of Truth: `docs/plans/Plan_4.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_4.md` > `### 7.1 Review API`; `README.md` > `## Phase 4 Handoff Notes`
  - Source Requirements:
    - Frontend must call Express REST APIs through the existing API helper pattern.
    - Frontend must not query Supabase directly.
    - Review endpoints must match Plan 4 paths.
  - Details: Provide a small frontend API module for product review list/create calls and, only if needed by shared admin code, admin hide/delete.
  - Dependencies: Batch01
  - User Action: None
  - Agent Work: Search existing API helpers and add review helper functions that reuse `apiClient.js`.
  - Specific Steps:
    1. Inspect `frontend/src/api/apiClient.js` and existing product/order/payment API helpers.
    2. Add `getProductReviews(productId)`.
    3. Add `createProductReview(productId, payload)`.
    4. Add `hideOrDeleteReview(reviewId)` only if frontend admin moderation work consumes it in this phase or optional track.
    5. Keep response shape handling consistent with existing helpers.
  - Output: Review frontend API helper.
  - Acceptance: Helper uses existing API client and does not expose backend-only config or database details.
  - Validation: Frontend smoke in (02D)
  - Blocked Condition: None
  - Files: `frontend/src/api/reviewApi.js`

- [ ] (02B): Build customer review list and form components
  - Source of Truth: `docs/plans/Plan_4.md` > `## 4. Scope`; `docs/design/design.md` > `## 7.6 ProductReviewList`; `docs/design/design.md` > `## 7.7 ProductReviewForm`; `docs/design/design.md` > `# 21. Common Feedback Components`
  - Source Requirements:
    - Product detail must show review list and review form.
    - Review list shows customer name, rating, comment, and review date.
    - Review form captures rating and optional comment.
    - UI must handle empty, loading, error, and success states.
  - Details: Create focused review components that can be embedded in product detail without bloating the page component.
  - Dependencies: (02A)
  - User Action: None
  - Agent Work: Run Astryx discovery, inspect component props, and build review components with existing project styling conventions.
  - Specific Steps:
    1. Run `npx astryx build "product reviews review form"` and inspect referenced templates/components.
    2. Inspect existing product/order component style for local conventions.
    3. Build `ProductReviewList` with visible state handling and clear empty text.
    4. Build `ProductReviewForm` with rating validation, optional comment, submit loading, and error display.
    5. Use Astryx components/tokens and avoid raw layout/styling outside local patterns.
  - Output: Customer review list and form components.
  - Acceptance: Components are focused, reusable, Astryx-aligned, accessible, and do not contain API base URL or database logic.
  - Validation: Frontend route smoke in (02D)
  - Blocked Condition: None
  - Files: `frontend/src/components/product/ProductReviewList.jsx`, `frontend/src/components/product/ProductReviewForm.jsx`

- [ ] (02C): Integrate review UI into product detail
  - Source of Truth: `docs/plans/Plan_4.md` > `## 4. Scope`; `docs/design/design.md` > `# 24. Page-to-Component Map` > `## 24.3 Product Detail Page`; `docs/plans/Master_Plan.md` > `## 21. Minimum Viable Demo Flow` > `### 21.1 Customer Demo Flow`
  - Source Requirements:
    - Customer can open product detail and add product review.
    - Product detail page includes review list and review form.
    - Successful review creation must refresh the visible review list.
  - Details: Wire review API calls and components into the existing product detail view while preserving product detail and cart behavior.
  - Dependencies: (02A), (02B)
  - User Action: User must provide a logged-in customer account for live submit checks.
  - Agent Work: Integrate review state, loading/error handling, auth-aware form behavior, and list refresh into `ProductDetailView`.
  - Specific Steps:
    1. Search `ProductDetailView` for existing product fetch, loading, cart, auth, and feedback logic.
    2. Load reviews after product id is available.
    3. Render review list near the product detail content according to the design page map.
    4. Render review form for authenticated customers or a clear login prompt for anonymous users, following existing auth UI patterns.
    5. Refresh the list after successful review creation.
    6. Preserve existing add-to-cart and product detail behavior.
  - Output: Product detail route with live review list/form behavior.
  - Acceptance: Product detail can display existing visible reviews and create a new review without breaking product or cart interactions.
  - Validation: Browser/manual product detail review smoke in (02D)
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live submit validation needs missing customer credentials, seeded product, backend server, or database access.
  - Files: `frontend/src/views/ProductDetailView.jsx`

- [ ] (02D): Validate customer review UI states and access behavior
  - Source of Truth: `docs/plans/Plan_4.md` > `## 9. Verification & Testing Plan`; `docs/design/design.md` > `# 25. UI States`; `docs/design/design.md` > `# 26. Responsive Design`
  - Source Requirements:
    - Final UI has loading, success, empty, and error states for key pages.
    - Customer can add a product review.
    - Hidden/deleted reviews no longer appear in public product detail.
  - Details: Verify the customer-facing review flow through frontend command and browser/manual checks.
  - Dependencies: (02C), (01D)
  - User Action: User must provide running backend/API data and safe customer login credentials for full live UI checks.
  - Agent Work: Run frontend dev command, exercise product detail review states, and record blocked live checks honestly.
  - Specific Steps:
    1. Run `cd frontend && npm run dev`.
    2. Open a product detail page with no reviews and verify empty state.
    3. Create a review as an authenticated customer and verify success feedback and refreshed list.
    4. Try invalid rating/comment states and verify field or API error feedback.
    5. Check anonymous user behavior.
    6. After admin hide/delete API smoke, verify hidden/deleted reviews disappear from product detail.
    7. Check desktop, tablet, and mobile layout where browser tooling is available.
  - Output: Customer review UI validation evidence.
  - Acceptance: UI smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: `cd frontend && npm run dev`; browser/manual product detail review smoke.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if backend, seeded data, login credentials, or browser tooling is unavailable.
  - Files: Execution report, optional `docs/demo-checklist.md`

### Files or Modules Likely Created or Updated

- `frontend/src/api/reviewApi.js`
- `frontend/src/components/product/ProductReviewList.jsx`
- `frontend/src/components/product/ProductReviewForm.jsx`
- `frontend/src/views/ProductDetailView.jsx`

### Required Outputs / Artifacts

- Customer review API helper.
- Product review UI components.
- Product detail integration.
- UI state and access validation evidence.

### Acceptance Criteria

- Product detail loads visible reviews from the backend.
- Authenticated customers can submit valid reviews.
- Invalid and anonymous states are handled cleanly.
- Review list refreshes after successful creation.
- Review UI uses Astryx components/tokens and existing layout conventions.
- React does not import Prisma, SQL, Supabase credentials, or backend-only config.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser/manual product detail review list smoke.
- Browser/manual review creation smoke.
- Browser/manual loading, empty, validation error, API error, and success states.
- Responsive desktop/tablet/mobile check where available.

### Explicit Non-Goals

- Full admin review moderation page, review editing, review likes, threaded replies, average rating cache, or spam moderation.
- Frontend-only mock review persistence.

## Mandatory Batch03 - Backend Report APIs

### Goal

Implement admin-only report model/controller/route behavior for revenue, best-selling products, and order-summary reports from backend/database data.

### Why this batch exists

Admin report UI and final submission checks depend on trustworthy backend report endpoints that reuse existing order/payment/product data instead of recalculating from frontend state.

### Inputs / Dependencies

- Phase 3 order/payment models, controllers, and enum behavior.
- Existing `Order`, `OrderDetail`, `Payment`, and `Product` Prisma models.
- Admin middleware and route patterns.
- Seeded completed orders and paid COD payments for live validation.

### Tasks

- [ ] (03A): Inspect order, payment, and report prerequisites
  - Source of Truth: `docs/plans/Plan_4.md` > `## 3. Prerequisites from Prior Phases`; `docs/plans/Plan_4.md` > `## 8. Implementation Steps`; `README.md` > `## Phase 4 Handoff Notes`
  - Source Requirements:
    - Reports must use completed order/payment data from Phase 3.
    - Reports must not recalculate revenue from frontend state.
    - Reports must not create duplicate order/payment models or reporting-only schema copies.
  - Details: Establish the exact order/payment field names, paid/completed semantics, and existing model helper boundaries before adding report aggregation.
  - Dependencies: None
  - User Action: None
  - Agent Work: Search existing order/payment/product model/controller code and inspect Prisma schema relationships.
  - Specific Steps:
    1. Search for existing report helpers or routes before adding new files.
    2. Inspect `order.model.js`, `orderDetail.model.js`, `payment.model.js`, and product model helpers.
    3. Inspect `OrderStatus`, `PaymentStatus`, and `PaymentMethod` enum values in the Prisma schema.
    4. Confirm completed orders with paid COD payment is the single revenue definition for this phase.
    5. Identify whether a focused `report.model.js` is needed or whether existing model helpers can be reused cleanly.
  - Output: Report backend implementation approach aligned with existing order/payment data.
  - Acceptance: Execution notes identify reusable files and the aggregation owner without duplicating order/payment data-access logic.
  - Validation: `rg "OrderStatus|PaymentStatus|completed|paid|OrderDetail|Payment|report|revenue" backend/src backend/prisma`
  - Blocked Condition: None
  - Files: No required code changes unless stale report placeholders exist.

- [ ] (03B): Implement report aggregation helpers
  - Source of Truth: `docs/plans/Plan_4.md` > `### 7.2 Report API`; `docs/plans/Master_Plan.md` > `## 13. Controller Design` > `### 12.9 ReportController`
  - Source Requirements:
    - Revenue report calculates revenue from completed orders with paid COD payment.
    - Best-selling report aggregates `OrderDetail.quantity` by product, preferably completed orders only.
    - Order summary counts orders by status.
    - Reports are simple and suitable for a course project.
  - Details: Add focused backend aggregation helpers for the three report endpoints.
  - Dependencies: (03A)
  - User Action: None
  - Agent Work: Implement report data-access helpers using Prisma aggregation/query APIs and existing Prisma client.
  - Specific Steps:
    1. Add or update a focused report model/helper module only if no existing helper already owns this responsibility.
    2. Implement revenue helper returning `totalRevenue` and `completedOrderCount`.
    3. Implement best-selling products helper grouped by product with sold quantity and revenue, limited to top 5 or top 10.
    4. Implement order-summary helper returning counts for `pending`, `confirmed`, `shipping`, `completed`, and `cancelled`.
    5. Convert Prisma Decimal values to API-safe strings consistently with existing order/payment responses.
    6. Keep aggregation helpers free of Express response logic.
  - Output: Report aggregation helpers.
  - Acceptance: Helpers compute from database order/order detail/product/payment records and do not add schema copies.
  - Validation: `cd backend && npx prisma validate`; API smoke in (03D)
  - Blocked Condition: None
  - Files: `backend/src/models/report.model.js` or a focused existing backend model/helper file if local conventions prefer reuse.

- [ ] (03C): Implement report controller and admin routes
  - Source of Truth: `docs/plans/Plan_4.md` > `## 4. Scope`; `docs/plans/Plan_4.md` > `### 7.2 Report API`; `docs/plans/Master_Plan.md` > `## 15. API Design Summary` > `### Report APIs`
  - Source Requirements:
    - Implement `GET /api/admin/reports/revenue`.
    - Implement `GET /api/admin/reports/best-selling-products`.
    - Implement `GET /api/admin/reports/order-summary`.
    - Report APIs require admin authorization.
  - Details: Expose report aggregation helpers through Express controllers and admin-protected routes.
  - Dependencies: (03B)
  - User Action: None
  - Agent Work: Add report controller/routes, reuse response helpers, and mount routes under the existing `/api` structure.
  - Specific Steps:
    1. Search existing admin route patterns before adding report routes.
    2. Implement revenue report controller.
    3. Implement best-selling products report controller.
    4. Implement order-summary report controller.
    5. Create or update `report.routes.js` with admin middleware.
    6. Mount report routes under `/api/admin/reports`.
  - Output: Admin report HTTP endpoints.
  - Acceptance: Report endpoints are admin-only, return Plan 4 response shapes, and handle empty datasets safely.
  - Validation: `cd backend && npx prisma validate`; API smoke in (03D)
  - Blocked Condition: None
  - Files: `backend/src/controllers/report.controller.js`, `backend/src/routes/report.routes.js`, `backend/src/routes/index.js`, `backend/src/models/report.model.js`

- [ ] (03D): Validate backend report API behavior
  - Source of Truth: `docs/plans/Plan_4.md` > `## 9. Verification & Testing Plan`; `docs/plans/Plan_4.md` > `### 7.2 Report API`
  - Source Requirements:
    - Smoke test revenue, best-selling products, and order-summary report endpoints.
    - Revenue must match completed paid orders in the database.
    - Best-selling report must aggregate order detail quantities correctly.
    - Order summary counts must match order statuses in the database.
  - Details: Prove the backend report contract and admin access boundary through local commands and HTTP checks.
  - Dependencies: (03C)
  - User Action: User must provide working `backend/.env`, Supabase database access, completed paid COD order data, and safe admin credentials for full live checks.
  - Agent Work: Run backend commands and report API smoke checks, or mark credential/database-dependent checks blocked with safe reasons.
  - Specific Steps:
    1. Run `cd backend && npx prisma validate`.
    2. Start backend with `cd backend && npm run dev` long enough to confirm startup.
    3. Login as admin through safe local flow without printing tokens.
    4. Smoke test `GET /api/admin/reports/revenue`.
    5. Smoke test `GET /api/admin/reports/best-selling-products`.
    6. Smoke test `GET /api/admin/reports/order-summary`.
    7. Smoke test anonymous/customer denial for admin report endpoints.
    8. Compare returned counts/totals against known seeded/demo database data where access is available.
  - Output: Backend report API validation evidence.
  - Acceptance: Commands and smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output and HTTP smoke-test summary.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if real env values, live database, backend server, completed paid order data, or safe admin credentials are unavailable.
  - Files: Execution report, optional `docs/demo-checklist.md`

### Files or Modules Likely Created or Updated

- `backend/src/models/report.model.js`
- `backend/src/controllers/report.controller.js`
- `backend/src/routes/report.routes.js`
- `backend/src/routes/index.js`

### Required Outputs / Artifacts

- Revenue report helper and endpoint.
- Best-selling products helper and endpoint.
- Order-summary helper and endpoint.
- Backend report API smoke-test evidence.

### Acceptance Criteria

- Report routes require admin middleware.
- Revenue uses completed orders with paid COD payment.
- Best-selling products aggregate order detail quantities by product.
- Order summary returns all order statuses.
- Empty datasets return safe zero/empty responses.
- No frontend state, duplicate order/payment models, or schema copies are used for report calculations.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- `cd backend && npm run dev`
- `GET /api/admin/reports/revenue`
- `GET /api/admin/reports/best-selling-products`
- `GET /api/admin/reports/order-summary`
- Admin, customer, and anonymous access checks.

### Explicit Non-Goals

- Advanced charts, accounting reports, date-range analytics, exports, warehouse reports, online payment analytics, or frontend-computed revenue.

## Mandatory Batch04 - Admin Dashboard and Report UI

### Goal

Build the admin-facing report helper, report page, and simple dashboard metric integration that consumes backend report APIs through existing frontend patterns.

### Why this batch exists

The admin demo flow requires opening the dashboard and viewing revenue and best-selling product reports. Report UI must use backend APIs, Astryx components, and loading/empty/error/success states.

### Inputs / Dependencies

- Batch03 report APIs.
- Existing admin layout and route guard.
- Existing `AdminDashboardView`.
- Design sections for dashboard/report components, page map, UI states, responsive behavior, and Astryx component mapping.

### Tasks

- [ ] (04A): Run Astryx discovery and map admin report components
  - Source of Truth: `docs/plans/Plan_4.md` > `### 7.3 Admin Dashboard UI Contract`; `docs/design/design.md` > `# 13. Admin Dashboard Components`; `docs/design/design.md` > `# 19. Report Components`; `AGENTS.md` > `# AGENTS`
  - Source Requirements:
    - Report cards/tables must use Astryx components and semantic status badges.
    - Dashboard metric cards may use report endpoints.
    - Before writing UI, discover Astryx components/templates instead of guessing.
  - Details: Establish concrete Astryx components and local UI patterns before adding admin report surfaces.
  - Dependencies: Batch03
  - User Action: None
  - Agent Work: Run Astryx discovery commands, inspect component props, and record selected components/templates.
  - Specific Steps:
    1. Run `npx astryx build "admin reports dashboard metrics table"`.
    2. Inspect relevant `npx astryx template <name> --skeleton` outputs if the build command names templates.
    3. Inspect `npx astryx component <Name>` for components used in cards, tables, badges, loading, empty, and banners.
    4. Inspect existing admin views/components for local table/dialog/card conventions.
    5. Record the selected Astryx mapping in the execution report before UI edits.
  - Output: Admin report UI component mapping.
  - Acceptance: Future UI edits are grounded in Astryx discovery and existing local admin patterns.
  - Validation: Command output or documented tooling failure.
  - Blocked Condition: None
  - Files: Execution report only unless a local UI mapping doc already exists.

- [ ] (04B): Add report API helper and admin route wiring
  - Source of Truth: `docs/plans/Plan_4.md` > `## 6. Target Directory Structure`; `docs/plans/Plan_4.md` > `### 7.2 Report API`; `docs/design/design.md` > `# 24. Page-to-Component Map` > `## 24.17 Admin Reports Page`
  - Source Requirements:
    - Frontend report views must consume backend report endpoints.
    - Admin report page must be routed inside the existing admin layout/guard.
    - React must not query Supabase directly.
  - Details: Provide a frontend report API helper and route surface for admin reports.
  - Dependencies: (04A), Batch03
  - User Action: None
  - Agent Work: Add report API helper functions and wire the admin report route/nav using existing route patterns.
  - Specific Steps:
    1. Inspect `frontend/src/api/apiClient.js` and existing admin API helpers.
    2. Add `getRevenueReport`, `getBestSellingProductsReport`, and `getOrderSummaryReport`.
    3. Create `ReportView` if it does not exist.
    4. Register `/admin/reports` with the existing admin guard/layout pattern.
    5. Ensure admin navigation links to reports without breaking existing admin sections.
  - Output: Report frontend API helper and route wiring.
  - Acceptance: Admin report route is protected and uses existing API client behavior.
  - Validation: Frontend smoke in (04D) and (06B)
  - Blocked Condition: None
  - Files: `frontend/src/api/reportApi.js`, `frontend/src/views/admin/ReportView.jsx`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/layouts/AdminLayout.jsx`

- [ ] (04C): Build report components and ReportView
  - Source of Truth: `docs/plans/Plan_4.md` > `### 7.3 Admin Dashboard UI Contract`; `docs/design/design.md` > `# 19. Report Components`; `docs/design/design.md` > `# 25. UI States`; `docs/design/design.md` > `# 27. Accessibility Checklist`
  - Source Requirements:
    - Reports display loading, empty, error, and success states.
    - Report cards/tables use Astryx components and semantic status badges.
    - Report page must show revenue summary, best-selling products, and order summary.
  - Details: Build focused report display components and compose them in the admin report page.
  - Dependencies: (04B), (03D)
  - User Action: User must provide admin credentials and live report data for full UI validation.
  - Agent Work: Implement report components with API loading, empty, error, and success states.
  - Specific Steps:
    1. Build `RevenueSummaryCard` for total revenue and completed order count.
    2. Build `BestSellingProductsTable` with product, brand/category if available, sold quantity, and revenue.
    3. Build `OrderSummaryCards` for pending, confirmed, shipping, completed, and cancelled counts.
    4. Compose the components in `ReportView` with a clear page header.
    5. Add retry/error feedback where existing patterns support it.
    6. Keep tables accessible with meaningful column headers.
  - Output: Admin report page and components.
  - Acceptance: Admin can view all three report surfaces through backend data with clear UI states.
  - Validation: Browser/manual admin report UI smoke in (04D) and (06B)
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if live validation needs missing admin credentials, backend server, report data, or browser tooling.
  - Files: `frontend/src/components/report/RevenueSummaryCard.jsx`, `frontend/src/components/report/BestSellingProductsTable.jsx`, `frontend/src/components/report/OrderSummaryCards.jsx`, `frontend/src/views/admin/ReportView.jsx`

- [ ] (04D): Update admin dashboard with simple report-backed metrics
  - Source of Truth: `docs/plans/Plan_4.md` > `## 4. Scope`; `docs/plans/Plan_4.md` > `### 7.3 Admin Dashboard UI Contract`; `docs/design/design.md` > `# 13. Admin Dashboard Components`; `docs/plans/Master_Plan.md` > `## 21. Minimum Viable Demo Flow` > `### 21.2 Admin Demo Flow`
  - Source Requirements:
    - Dashboard metric cards may use report endpoints.
    - Admin can open dashboard, view revenue report, and view best-selling products.
    - Dashboard charts are out of scope unless simple cards/tables are already complete.
  - Details: Replace or extend placeholder dashboard data with simple backend-backed metrics without broad dashboard redesign.
  - Dependencies: (04C)
  - User Action: User must provide admin credentials and backend report data for full live UI checks.
  - Agent Work: Reuse report helper calls in `AdminDashboardView` for simple metrics/recent/low-stock summaries only when supported by existing APIs.
  - Specific Steps:
    1. Inspect existing `AdminDashboardView` and avoid replacing unrelated working admin UI.
    2. Add revenue/order-summary metric cards from report APIs where simple.
    3. Add a link/action to the report page.
    4. Keep recent orders or low-stock summary only if existing APIs already support it simply.
    5. Do not add advanced charts or frontend-only accounting calculations.
    6. Verify loading/empty/error/success states and responsive behavior.
  - Output: Admin dashboard metrics aligned with Phase 4 reports.
  - Acceptance: Dashboard supports the admin demo flow without adding unsupported charts or duplicate frontend report calculations.
  - Validation: `cd frontend && npm run dev`; browser/manual admin dashboard and report UI smoke.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if backend, report data, admin credentials, or browser tooling is unavailable.
  - Files: `frontend/src/views/AdminDashboardView.jsx`, optionally shared admin/report components if reused.

### Files or Modules Likely Created or Updated

- `frontend/src/api/reportApi.js`
- `frontend/src/views/admin/ReportView.jsx`
- `frontend/src/views/AdminDashboardView.jsx`
- `frontend/src/routes/AppRoutes.jsx`
- `frontend/src/layouts/AdminLayout.jsx`
- `frontend/src/components/report/RevenueSummaryCard.jsx`
- `frontend/src/components/report/BestSellingProductsTable.jsx`
- `frontend/src/components/report/OrderSummaryCards.jsx`

### Required Outputs / Artifacts

- Astryx report/dashboard component mapping.
- Report frontend API helper.
- Protected admin report route.
- Admin report page and components.
- Dashboard metric integration.

### Acceptance Criteria

- Admin report UI consumes backend report APIs.
- Report and dashboard states cover loading, empty, error, and success.
- Admin report route is protected by existing admin guard.
- Report components use Astryx components/tokens and accessible table/card semantics.
- React does not compute revenue as source of truth or query Supabase directly.
- No advanced charts or broader dashboard redesign is added.

### Required Tests or Validations

- `cd frontend && npm run dev`
- Browser/manual admin dashboard smoke.
- Browser/manual admin reports smoke.
- Admin/customer/anonymous route guard checks.
- Responsive desktop/tablet/mobile checks where available.

### Explicit Non-Goals

- Dashboard charts, accounting dashboards, exports, date-range analytics, realtime refresh, or frontend-only report calculations.
- Full admin review moderation view unless explicitly executed as an optional track after mandatory report/demo readiness is safe.

## Mandatory Batch05 - Polish, Documentation, and Demo Artifacts

### Goal

Polish responsive behavior for final demo routes and update the project documentation, database docs, demo checklist, API testing notes, and presentation support to match implemented runtime behavior.

### Why this batch exists

The course-project submission requires accurate setup/docs, clear MVC explanation, demo flow evidence, and responsive customer/admin UI readiness without claiming unimplemented placeholders as complete.

### Inputs / Dependencies

- Batch01 through Batch04 outputs.
- Existing `README.md`, `docs/database-design.md`, and `docs/demo-checklist.md`.
- Optional docs paths from Plan 4: `docs/api-testing.md`, `docs/erd.md`.
- Final implemented route/API behavior.

### Tasks

- [ ] (05A): Polish responsive customer and admin demo routes
  - Source of Truth: `docs/plans/Plan_4.md` > `## 4. Scope`; `docs/design/design.md` > `# 26. Responsive Design`; `docs/design/design.md` > `# 30. Final UI Checklist`
  - Source Requirements:
    - Polish responsive UI using the design document.
    - Customer and admin pages must remain usable on desktop, tablet, and mobile.
    - Key pages must avoid broken loading, empty, and error states.
  - Details: Make narrow responsive fixes for final demo routes without broad redesign or unrelated visual churn.
  - Dependencies: Batch02, Batch04
  - User Action: User may need to provide browser/manual evidence if automation is unavailable.
  - Agent Work: Inspect key routes, identify concrete layout/state issues, and patch only the minimum needed for demo usability.
  - Specific Steps:
    1. Verify homepage, product list, product detail/reviews, cart, checkout, order history/detail, admin dashboard, admin orders, and admin reports.
    2. Check desktop, tablet, and mobile widths where tooling is available.
    3. Fix only concrete overlap, unreadable text, broken table scroll, unusable forms, or missing state issues.
    4. Use Astryx props/tokens and existing components for responsive fixes.
    5. Record any unavailable manual/browser checks as blocked or user-provided evidence.
  - Output: Focused responsive/UI polish changes and validation notes.
  - Acceptance: Demo routes are usable across practical viewport sizes without unsupported redesign.
  - Validation: Browser/manual responsive smoke checks; `cd frontend && npm run dev`
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if browser tooling, login credentials, backend data, or user-side visual checks are unavailable.
  - Files: Focused frontend files only where concrete issues are found.

- [ ] (05B): Update README with final setup and implemented behavior
  - Source of Truth: `docs/plans/Plan_4.md` > `### 7.4 Documentation Contract`; `docs/plans/Master_Plan.md` > `## 26. Final Submission Checklist`; `README.md`
  - Source Requirements:
    - README must include project name and MVC explanation.
    - README must include tech stack, backend/frontend setup, environment examples, Supabase PostgreSQL setup note, API groups, and seed demo accounts.
    - README must not claim unimplemented runtime behavior.
  - Details: Refresh README for final submission while preserving accurate current-state notes and secret safety.
  - Dependencies: Batch01 through Batch04
  - User Action: User must provide any real seed demo account names/passwords that should be documented; agents must not invent or reveal secrets.
  - Agent Work: Update README to document setup, commands, API groups, implemented features, known blocked user-side checks, and demo notes.
  - Specific Steps:
    1. Read current README and implemented route/API files before editing.
    2. Add or update MVC explanation, stack, setup commands, env variable examples, Supabase note, and API groups.
    3. Add Phase 4 review/report status only after implementation evidence exists.
    4. Document demo accounts only if they are safe seeded sample credentials already intended for demo docs.
    5. Keep real `.env` values out of README.
  - Output: Final-submission README update.
  - Acceptance: README setup and feature status match actual runtime behavior and do not leak credentials.
  - Validation: Manual README review against implemented routes, Plan 4 docs contract, and secret search.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if demo account details require user confirmation.
  - Files: `README.md`

- [ ] (05C): Update database design and ERD documentation
  - Source of Truth: `docs/plans/Plan_4.md` > `### 7.4 Documentation Contract`; `docs/plans/Master_Plan.md` > `## 26. Final Submission Checklist`; `backend/prisma/schema.prisma`
  - Source Requirements:
    - `docs/database-design.md` must include entity list, field summaries, relationship summary, and Supabase/Prisma migration notes.
    - ERD image or Mermaid ERD is optional but useful for final submission.
    - Documentation must match the actual Prisma schema.
  - Details: Align database docs and optional ERD with the current schema, including reviews, orders, order details, and payments.
  - Dependencies: Batch01, Batch03
  - User Action: None unless a visual ERD image must be manually generated outside available tooling.
  - Agent Work: Inspect Prisma schema and update database documentation/ERD without changing the runtime schema.
  - Specific Steps:
    1. Read `backend/prisma/schema.prisma`.
    2. Update entity list and field summaries for User, Category, Product, Cart, CartItem, Order, OrderDetail, Payment, and Review.
    3. Update relationship summary and enum notes.
    4. Add Supabase/Prisma migration notes and credential-safety notes.
    5. Add or update `docs/erd.md` with Mermaid ERD if no better existing ERD artifact exists.
  - Output: Database design and optional ERD docs.
  - Acceptance: Docs match the actual schema and do not describe planned-only fields or unimplemented schema changes.
  - Validation: Manual schema-to-doc comparison.
  - Blocked Condition: None for text docs; `BLOCKED_BY_USER_ACTION` only if a required image export needs unavailable tooling.
  - Files: `docs/database-design.md`, optional `docs/erd.md`

- [ ] (05D): Update demo checklist, API testing notes, and presentation support
  - Source of Truth: `docs/plans/Plan_4.md` > `### 7.4 Documentation Contract`; `docs/plans/Plan_4.md` > `## 10. Handoff Notes for Final Submission`; `docs/plans/Master_Plan.md` > `## 21. Minimum Viable Demo Flow`; `docs/plans/Master_Plan.md` > `## 27. Suggested Presentation Division`
  - Source Requirements:
    - Demo checklist must include customer demo flow from homepage through review.
    - Demo checklist must include admin demo flow from dashboard through reports.
    - Final submission checklist must map to the master plan.
    - Optional API testing doc should cover auth, products, cart, orders, reviews, and reports.
  - Details: Produce final demo and presentation support docs that future users can follow during the course submission.
  - Dependencies: Batch01 through Batch04, (05B), (05C)
  - User Action: User must provide manual Supabase dashboard confirmations or presentation-specific team notes if the agent cannot verify them.
  - Agent Work: Update demo checklist, add API testing sequence if useful, and record presentation division notes without inventing completed checks.
  - Specific Steps:
    1. Update `docs/demo-checklist.md` with customer and admin demo flows and actual validation statuses.
    2. Add final submission checklist items from the master plan with pass/blocked/pending evidence.
    3. Add `docs/api-testing.md` if it does not exist and the API smoke sequence is not already documented.
    4. Include review/report API checks alongside existing auth/product/cart/order checks.
    5. Record user-side Supabase Table Editor checks as `BLOCKED_BY_USER_ACTION` unless confirmed.
    6. Add concise presentation responsibility notes if no existing presentation doc owns them.
  - Output: Demo checklist, optional API testing doc, and presentation-support notes.
  - Acceptance: Docs are usable by the team and distinguish verified runtime behavior from pending/user-side checks.
  - Validation: Manual doc review against Plan 4 verification and master-plan final checklist.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` for user-side Supabase dashboard checks, team-specific presentation details, or inaccessible live credentials.
  - Files: `docs/demo-checklist.md`, optional `docs/api-testing.md`, optional presentation/demo docs.

### Files or Modules Likely Created or Updated

- `README.md`
- `docs/database-design.md`
- `docs/demo-checklist.md`
- Optional `docs/api-testing.md`
- Optional `docs/erd.md`
- Focused frontend files only for concrete responsive polish issues

### Required Outputs / Artifacts

- Responsive UI polish evidence.
- Updated README.
- Updated database design and optional ERD docs.
- Updated demo checklist.
- Optional API testing and presentation-support docs.

### Acceptance Criteria

- Documentation accurately describes implemented runtime behavior.
- Setup commands and env variable guidance are accurate.
- Review/report demo flows are documented.
- Database docs match the Prisma schema.
- Final checklist distinguishes passed, pending, and blocked checks.
- No real credentials or secrets are committed or documented.

### Required Tests or Validations

- Manual README/docs review against Plan 4 contract and current implementation.
- Secret search over docs and frontend/backend source.
- Browser/manual responsive checks for key customer/admin routes.

### Explicit Non-Goals

- Creating real external provider resources, changing schema for documentation only, adding product image upload, building charts, or writing presentation slides unless explicitly requested.

## Mandatory Batch06 - Final Verification, Audit, and Submission Readiness

### Goal

Run final backend, API, frontend, UI, security, MVC, duplication, scope, documentation, and submission-readiness checks for the completed Phase 4 work.

### Why this batch exists

Final submission should be based on verified runtime behavior, clean MVC boundaries, safe secrets handling, synchronized progress tracking, and honest blocked-check reporting.

### Inputs / Dependencies

- Batch01 through Batch05 outputs.
- User-provided real backend `.env`, frontend `.env`, Supabase database, seeded data, admin/customer credentials, and browser access for full live checks.

### Tasks

- [ ] (06A): Run backend command checks and review/report API smoke tests
  - Source of Truth: `docs/plans/Plan_4.md` > `## 9. Verification & Testing Plan`; `docs/plans/Master_Plan.md` > `## 23. Testing Plan`
  - Source Requirements:
    - Run backend validation/startup commands.
    - Smoke test review and report APIs.
    - Revenue, best-selling, and order-summary data must match database records.
  - Details: Prove all Phase 4 backend/API behavior through commands and HTTP checks.
  - Dependencies: Batch01, Batch03
  - User Action: User must provide real backend `.env`, running Supabase PostgreSQL, seeded demo data, and safe admin/customer credentials for full live checks.
  - Agent Work: Run backend validation, startup, and HTTP checks, or mark blocked items honestly with safe reasons.
  - Specific Steps:
    1. Run `cd backend && npx prisma validate`.
    2. Start backend with `cd backend && npm run dev` long enough to confirm startup.
    3. Smoke test customer auth needed for review creation.
    4. Smoke test review list/create/hide behavior.
    5. Smoke test revenue report.
    6. Smoke test best-selling products report.
    7. Smoke test order-summary report.
    8. Smoke test admin/customer/anonymous authorization boundaries.
    9. Summarize results without printing JWTs, passwords, or database connection strings.
  - Output: Final backend/API validation evidence.
  - Acceptance: Commands and smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output and HTTP smoke-test summary.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if real env values, live database, backend server, seeded data, or test credentials are unavailable.
  - Files: Execution report, `docs/demo-checklist.md`

- [ ] (06B): Run frontend command checks and full customer/admin UI demo
  - Source of Truth: `docs/plans/Plan_4.md` > `## 9. Verification & Testing Plan`; `docs/plans/Master_Plan.md` > `## 21. Minimum Viable Demo Flow`; `docs/design/design.md` > `# 30. Final UI Checklist`
  - Source Requirements:
    - Run frontend dev command.
    - Customer demo flow runs from homepage through product review.
    - Admin demo flow runs from dashboard through reports.
    - Key pages show loading, success, empty, and error states.
  - Details: Verify final UI flows from browser/manual checks and command output.
  - Dependencies: Batch02, Batch04, Batch05, (06A)
  - User Action: User must provide running backend/API data, seeded demo data, admin/customer credentials, and manual browser observations when automation is unavailable.
  - Agent Work: Run frontend command and perform browser/manual UI smoke checks, or record blocked live checks honestly.
  - Specific Steps:
    1. Run `cd frontend && npm run dev`.
    2. Verify customer homepage, product list, search/filter, product detail, cart, checkout, order history, order detail, and review creation.
    3. Verify admin login, dashboard, categories/products/users if available, orders, status update, revenue report, best-selling products, and order summary.
    4. Verify route guard behavior for anonymous, customer, and admin paths.
    5. Verify review/report loading, empty, error, and success states where data permits.
    6. Verify desktop, tablet, and mobile usability where browser tooling is available.
  - Output: Final frontend/UI validation evidence.
  - Acceptance: UI smoke checks pass or are explicitly marked `BLOCKED_BY_USER_ACTION` with safe reasons.
  - Validation: Command output, browser/manual smoke summary, and screenshot evidence if available.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` if backend, seeded data, login credentials, or browser tooling is unavailable.
  - Files: Execution report, `docs/demo-checklist.md`

- [ ] (06C): Audit security, MVC boundaries, anti-duplication, and Astryx compliance
  - Source of Truth: `docs/plans/Plan_4.md` > `## 5. Out of Scope`; `docs/plans/Plan_4.md` > `## 9. Verification & Testing Plan`; `docs/plans/Master_Plan.md` > `## 22. MVC Acceptance Criteria`; `AGENTS.md` > `# Custom Rules & Workflows`
  - Source Requirements:
    - Confirm no real `.env` credentials are committed.
    - Confirm React never imports database credentials or Prisma.
    - Confirm no out-of-scope features were added.
    - Confirm MVC boundaries remain clear.
    - Confirm each large file is split if it drifts beyond a focused responsibility.
  - Details: Search and inspect the final implementation for security leaks, duplicated core helpers, MVC violations, Astryx issues, and scope creep.
  - Dependencies: Batch01 through Batch05
  - User Action: None
  - Agent Work: Run focused searches and inspect changed files before final submission.
  - Specific Steps:
    1. Search for committed real `.env` files and credential-like strings.
    2. Search frontend source for `DATABASE_URL`, `DIRECT_URL`, Prisma imports, Supabase database URLs, SQL, and backend-only config names.
    3. Search backend for duplicate Prisma client exports, response helpers, JWT helpers, review/report helper paths, and duplicate route/controller files.
    4. Inspect controllers/models to confirm HTTP logic stays in controllers and database logic stays in models/helpers.
    5. Inspect UI files for direct database calls and raw styling that violates Astryx/token rules.
    6. Search for out-of-scope online payment, shipping provider, email, realtime, AI, recommendation, mobile, image upload, or dashboard chart implementation added during Phase 4.
    7. Inspect broad files and split only if a file has drifted into multiple responsibilities.
  - Output: Security/MVC/duplication/Astryx/scope audit result.
  - Acceptance: No secrets, direct frontend database access, duplicate core helpers, MVC boundary violations, or out-of-scope behavior are present.
  - Validation: `rg`/grep search summaries and manual inspection notes.
  - Blocked Condition: None
  - Files: Execution report; changed source files only if fixes are needed.

- [ ] (06D): Finalize submission evidence, reports, and progress state
  - Source of Truth: `docs/plans/Plan_4.md` > `## 10. Handoff Notes for Final Submission`; `docs/plans/Master_Plan.md` > `## 26. Final Submission Checklist`; `docs/plans/Master_Plan.md` > `## 27. Suggested Presentation Division`
  - Source Requirements:
    - Final deliverable exposes running React View layer, Express Controller layer, Supabase PostgreSQL database through Prisma Models, seeded demo data, customer/admin demo flows, README/docs, and clear MVC explanation.
    - Do not add new nice-to-have features after final verification starts.
    - Do not change schema after final data/report verification unless full demo flow is retested.
    - Do not present planned or placeholder UI as completed runtime behavior.
  - Details: Record final validation results, blocked items, docs status, and handoff notes for submission.
  - Dependencies: (06A), (06B), (06C)
  - User Action: User may need to confirm manual checks that cannot be performed by the agent, such as Supabase Table Editor visual confirmation, browser observations, or presentation readiness.
  - Agent Work: Update demo checklist, execution report, and this task tracker only after evidence exists.
  - Specific Steps:
    1. Update `docs/demo-checklist.md` with actual Phase 4 backend/API/frontend/admin/docs check statuses.
    2. Write or update execution report entries for completed batches and blocked validations.
    3. Record final out-of-scope and no-new-feature freeze status.
    4. Record Supabase/dashboard checks as `BLOCKED_BY_USER_ACTION` unless user-confirmed.
    5. Confirm README/docs/database/demo/API docs match implemented behavior.
    6. Synchronize this task file progress tracker if the execution workflow requires checklist updates.
  - Output: Final submission evidence and progress state.
  - Acceptance: Future readers can distinguish completed runtime behavior, verified evidence, pending user actions, and explicitly out-of-scope work.
  - Validation: Manual doc review against Plan 4 verification and final submission checklist.
  - Blocked Condition: `BLOCKED_BY_USER_ACTION` only for user-side manual checks, credential-dependent live validation, or unavailable browser tooling.
  - Files: `docs/demo-checklist.md`, `docs/reports/report_4_execute_agent.md`, `docs/review/review_4_review_agent.md`, `docs/tasks/task_4.md`

### Files or Modules Likely Created or Updated

- `docs/demo-checklist.md`
- `docs/reports/report_4_execute_agent.md`
- `docs/review/review_4_review_agent.md`
- `docs/tasks/task_4.md`
- Runtime files only if verification finds defects requiring repair

### Required Outputs / Artifacts

- Backend/API validation summary.
- Frontend/UI validation summary.
- Security/MVC/duplication/Astryx/scope audit summary.
- Final docs/demo/submission evidence.
- Updated progress state when execution is completed by future agents.

### Acceptance Criteria

- Backend and frontend commands pass or are explicitly blocked by user setup.
- Review and report APIs satisfy Plan 4 behavior.
- Customer review UI and admin report UI are demoable or honestly blocked by missing setup.
- Documentation matches actual runtime behavior.
- No secrets are exposed.
- MVC boundaries remain clear.
- Scope is frozen after final verification starts.

### Required Tests or Validations

- `cd backend && npx prisma validate`
- `cd backend && npm run dev`
- Review/report API smoke tests listed in Plan 4.
- `cd frontend && npm run dev`
- Browser/manual checks for customer demo through review.
- Browser/manual checks for admin demo through reports.
- Customer/admin/anonymous authorization checks.
- Security, MVC, duplication, direct-database, and forbidden-scope searches.

### Explicit Non-Goals

- Adding new nice-to-have features after final verification starts.
- Claiming completion for credential-dependent checks that were not run.
- Changing schema after final data/report verification without full retest.
- Creating real external resources or presentation slides unless explicitly requested.

## Optional Future Tracks

These tracks are not part of the mandatory Plan 4 batch chain.

- Admin review moderation view: Plan 4 allows this only if it does not threaten must-have completion. If implemented after mandatory review/report/demo readiness is safe, use `frontend/src/views/admin/AdminReviewView.jsx`, `AdminReviewTable`, `ReviewStatusBadge`, `ReviewActionMenu`, existing admin route guards, and the review hide/delete API. Record the decision and evidence clearly.
- Product image upload remains out of scope unless all must-have and should-have work is complete and the user explicitly approves it.
- Dashboard charts are out of scope unless simple report cards/tables are already complete and the user explicitly approves charts.
- Advanced analytics, date-range reports, exports, realtime notifications, AI chatbot, recommendations, mobile app, shipping provider integration, online payment, email features, multi-store, warehouse, and accounting behavior are not needed for this phase.

## Dependency Chain

- Batch01 -> Batch02
- Batch03 -> Batch04
- Batch02 -> Batch05
- Batch04 -> Batch05
- Batch05 -> Batch06

Batch01 and Batch03 can be implemented in parallel if they do not edit shared route mounting at the same time. Batch02 depends on review APIs. Batch04 depends on report APIs. Batch05 depends on the review/report UI surfaces it polishes and documents. Batch06 depends on all mandatory implementation and documentation batches.

## Global Verification Checklist

- [ ] Current AGENTS instructions were read and followed.
- [ ] Repository was searched before adding new helpers, utilities, configs, API clients, contexts, components, or business logic.
- [ ] Existing `review.model.js` placeholder was reused or safely expanded instead of duplicated.
- [ ] No duplicated Prisma client, response helper, JWT helper, auth/admin middleware, frontend API client, review helper path, or report helper path was added.
- [ ] Review list returns only visible reviews sorted newest first.
- [ ] Review creation requires authentication.
- [ ] Review rating validation accepts only integers from 1 to 5.
- [ ] Review comment is trimmed and optional.
- [ ] New reviews default to visible.
- [ ] Admin review hide/delete requires admin authorization.
- [ ] Hidden/deleted reviews are absent from public product detail review results.
- [ ] Review UI loads reviews from backend APIs.
- [ ] Review UI handles loading, empty, validation error, API error, and success states.
- [ ] Report APIs require admin authorization.
- [ ] Revenue report uses completed orders with paid COD payment.
- [ ] Best-selling report aggregates order detail quantities by product.
- [ ] Order-summary report returns all order statuses.
- [ ] Report UI consumes backend report APIs and does not calculate report truth from React state.
- [ ] Admin dashboard/report UI handles loading, empty, error, and success states.
- [ ] Frontend does not import Prisma, use SQL, expose Supabase PostgreSQL credentials, or access the database directly.
- [ ] Astryx discovery was run before UI implementation or tooling failure was recorded.
- [ ] UI uses Astryx components/tokens and avoids unsupported raw layout/styling.
- [ ] Customer demo flow works through product review or is blocked with safe reasons.
- [ ] Admin demo flow works through reports or is blocked with safe reasons.
- [ ] Responsive checks passed for key demo routes or unavailable browser/user checks were recorded.
- [ ] README setup, stack, API groups, and MVC explanation match implemented runtime behavior.
- [ ] Database docs and optional ERD match the actual Prisma schema.
- [ ] Demo checklist includes customer and admin flows with evidence-backed statuses.
- [ ] API testing notes cover auth, products, cart, orders, reviews, and reports if created.
- [ ] Real `.env` files and secrets are not committed, printed, logged, or documented.
- [ ] Online payment, shipping provider integration, email, realtime, AI, recommendations, mobile app, multi-store, warehouse, accounting, image upload, and dashboard charts remain out of scope unless explicitly approved.
- [ ] Progress tracker matches all task IDs exactly.
- [ ] Final submission evidence distinguishes completed, blocked, and pending checks.

## Progress Tracker

### Batches

- [ ] Batch01 - Backend Review APIs
- [ ] Batch02 - Customer Review UI
- [ ] Batch03 - Backend Report APIs
- [ ] Batch04 - Admin Dashboard and Report UI
- [ ] Batch05 - Polish, Documentation, and Demo Artifacts
- [ ] Batch06 - Final Verification, Audit, and Submission Readiness

### Task IDs

#### Batch01
- [x] (01A): Inspect review schema and backend conventions
- [x] (01B): Implement review model helpers
- [x] (01C): Implement review controller and routes
- [x] (01D): Validate backend review API behavior

#### Batch02
- [ ] (02A): Add review API helper using existing API client pattern
- [ ] (02B): Build customer review list and form components
- [ ] (02C): Integrate review UI into product detail
- [ ] (02D): Validate customer review UI states and access behavior

#### Batch03
- [ ] (03A): Inspect order, payment, and report prerequisites
- [ ] (03B): Implement report aggregation helpers
- [ ] (03C): Implement report controller and admin routes
- [ ] (03D): Validate backend report API behavior

#### Batch04
- [ ] (04A): Run Astryx discovery and map admin report components
- [ ] (04B): Add report API helper and admin route wiring
- [ ] (04C): Build report components and ReportView
- [ ] (04D): Update admin dashboard with simple report-backed metrics

#### Batch05
- [ ] (05A): Polish responsive customer and admin demo routes
- [ ] (05B): Update README with final setup and implemented behavior
- [ ] (05C): Update database design and ERD documentation
- [ ] (05D): Update demo checklist, API testing notes, and presentation support

#### Batch06
- [ ] (06A): Run backend command checks and review/report API smoke tests
- [ ] (06B): Run frontend command checks and full customer/admin UI demo
- [ ] (06C): Audit security, MVC boundaries, anti-duplication, and Astryx compliance
- [ ] (06D): Finalize submission evidence, reports, and progress state

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
