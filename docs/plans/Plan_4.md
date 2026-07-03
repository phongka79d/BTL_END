# Plan 4 - Reviews, Reports, Final Testing, Documentation, and Demo Readiness

## 1. Objective

Finish the remaining in-scope features and prepare the course-project submission. This phase adds product reviews, admin review moderation, simple admin reports, UI polish, full MVC testing, documentation, demo checklist, and presentation support.

## 2. Source of Truth

- `docs/plans/Master_Plan.md` section 5.1, In-Scope Features
- `docs/plans/Master_Plan.md` section 5.2, Out-of-Scope Features
- `docs/plans/Master_Plan.md` section 13.8, ReviewController
- `docs/plans/Master_Plan.md` section 13.9, ReportController
- `docs/plans/Master_Plan.md` section 15, Review and Report APIs
- `docs/plans/Master_Plan.md` section 16, Week 4 - Review, Report, Testing, Documentation
- `docs/plans/Master_Plan.md` section 21, Minimum Viable Demo Flow
- `docs/plans/Master_Plan.md` section 22, MVC Acceptance Criteria
- `docs/plans/Master_Plan.md` section 23, Testing Plan
- `docs/plans/Master_Plan.md` section 24, Risk Management
- `docs/plans/Master_Plan.md` section 25, Priority List
- `docs/plans/Master_Plan.md` section 26, Final Submission Checklist
- `docs/plans/Master_Plan.md` section 27, Suggested Presentation Division
- `docs/design/design.md` sections 7.6, 7.7, 13, 16, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, and 30

## 3. Prerequisites from Prior Phases

- [ ] Phase 1 foundation, schema, auth, admin middleware, and shared API conventions exist.
- [ ] Phase 2 product/category/cart flows work.
- [ ] Phase 3 checkout/order/payment flows work.
- [ ] Admin users can access admin views.
- [ ] Customer product detail page exists and can display review sections.
- [ ] Orders and order details exist for report queries.
- [ ] Supabase database contains enough demo data for reports and reviews.

## 4. Scope

- Implement review APIs:
  - `POST /api/products/:id/reviews`
  - `GET /api/products/:id/reviews`
  - `DELETE /api/admin/reviews/:id`
- Build customer review UI on product detail:
  - review list
  - review form
  - empty/loading/error states
- Build admin review moderation view if time allows without risking must-have completion:
  - list reviews
  - hide/delete inappropriate review
- Implement report APIs:
  - `GET /api/admin/reports/revenue`
  - `GET /api/admin/reports/best-selling-products`
  - `GET /api/admin/reports/order-summary`
- Build admin dashboard/report views:
  - dashboard metric cards
  - recent orders or low stock summary if simple
  - revenue summary
  - best-selling products table
  - order summary cards
- Polish responsive UI using `docs/design/design.md`.
- Complete final MVC/API/manual testing.
- Create/update documentation:
  - `README.md`
  - `docs/database-design.md`
  - `docs/demo-checklist.md`
  - optional `docs/api-testing.md`
  - optional ERD image or Mermaid ERD
- Prepare demo and presentation division evidence.

## 5. Out of Scope

- Real online payment gateway.
- Real shipping provider integration.
- Email verification or forgot password.
- Real-time notifications.
- AI chatbot.
- Recommendation system.
- Mobile application.
- Multi-store management.
- Advanced warehouse management.
- Accounting system.
- Product image upload unless all must-have and should-have work is already complete.
- Dashboard charts unless simple Astryx/table/card reports are already complete.

## 6. Target Directory Structure

```text
backend/
|-- src/
|   |-- controllers/
|   |   |-- report.controller.js
|   |   `-- review.controller.js
|   |-- models/
|   |   |-- order.model.js
|   |   |-- orderDetail.model.js
|   |   |-- payment.model.js
|   |   |-- product.model.js
|   |   `-- review.model.js
|   |-- routes/
|   |   |-- report.routes.js
|   |   `-- review.routes.js
|   `-- middlewares/
|       |-- admin.middleware.js
|       `-- auth.middleware.js
frontend/
|-- src/
|   |-- api/
|   |   |-- reportApi.js
|   |   `-- reviewApi.js
|   |-- components/
|   |   |-- admin/
|   |   |   |-- ReportCard.jsx
|   |   |   `-- AdminTable.jsx
|   |   |-- product/
|   |   |   |-- ProductReviewForm.jsx
|   |   |   `-- ProductReviewList.jsx
|   |   `-- report/
|   |       |-- BestSellingProductsTable.jsx
|   |       |-- OrderSummaryCards.jsx
|   |       `-- RevenueSummaryCard.jsx
|   |-- views/
|   |   |-- ProductDetailView.jsx
|   |   `-- admin/
|   |       |-- AdminDashboardView.jsx
|   |       |-- AdminReviewView.jsx
|   |       `-- ReportView.jsx
|   `-- routes/
|       `-- AppRoutes.jsx
docs/
|-- api-testing.md
|-- database-design.md
|-- demo-checklist.md
`-- erd.md
```

## 7. Technical Specifications

### 7.1 Review API

`GET /api/products/:id/reviews`

- Public.
- Returns only reviews with `status = visible`.
- Sort newest first.

Response data:

```json
[
  {
    "id": "uuid",
    "rating": 5,
    "comment": "Good product",
    "status": "visible",
    "createdAt": "2026-07-03T00:00:00.000Z",
    "user": {
      "id": "uuid",
      "username": "alice",
      "fullName": "Alice Nguyen"
    }
  }
]
```

`POST /api/products/:id/reviews`

Request:

```json
{
  "rating": 5,
  "comment": "Good product"
}
```

Rules:

- Requires authentication.
- `rating` must be an integer from `1` to `5`.
- `comment` is optional but should be trimmed.
- New reviews default to `visible`.
- One review per user per product is recommended for simplicity if it does not require schema changes; otherwise allow multiple reviews and keep the UI clear.

`DELETE /api/admin/reviews/:id`

- Requires admin.
- May physically delete the review or set `status = hidden`.
- Prefer setting `status = hidden` because the schema already includes review status.
- Must return a consistent success response.

### 7.2 Report API

`GET /api/admin/reports/revenue`

Rules:

- Requires admin.
- Calculates revenue from completed orders or paid payments.
- Use one definition consistently. For this project, use completed orders with paid COD payment.

Response data:

```json
{
  "totalRevenue": "1200.00",
  "completedOrderCount": 12
}
```

`GET /api/admin/reports/best-selling-products`

Rules:

- Requires admin.
- Aggregate `OrderDetail.quantity` by product.
- Prefer completed orders only for final revenue-aligned reporting.
- Limit to top 5 or top 10.

Response data:

```json
[
  {
    "productId": "uuid",
    "name": "Keyboard",
    "brand": "DemoBrand",
    "soldQuantity": 20,
    "revenue": "1000.00"
  }
]
```

`GET /api/admin/reports/order-summary`

Response data:

```json
{
  "pending": 3,
  "confirmed": 2,
  "shipping": 1,
  "completed": 12,
  "cancelled": 1
}
```

### 7.3 Admin Dashboard UI Contract

- Dashboard metric cards may use report endpoints.
- Reports must display loading, empty, error, and success states.
- Report cards/tables must use Astryx components and semantic status badges.
- Report pages must not query Supabase directly from React.

### 7.4 Documentation Contract

`README.md` must include:

- Project name and MVC explanation.
- Tech stack.
- Setup instructions for backend and frontend.
- Environment variable examples.
- Supabase PostgreSQL setup note.
- Available API groups.
- Demo login accounts from seed data.

`docs/database-design.md` must include:

- Entity list.
- Field summaries.
- Relationship summary.
- Supabase/Prisma migration notes.

`docs/demo-checklist.md` must include:

- Customer demo flow from homepage through review.
- Admin demo flow from dashboard through reports.
- Final submission checklist mapped to the master plan.

Optional `docs/api-testing.md`:

- Postman/manual test sequence for auth, products, cart, orders, reviews, and reports.

## 8. Implementation Steps

- [ ] Review Phase 3 order/payment model helpers before adding report queries.
- [ ] Implement review model helpers for visible list, create, and hide/delete.
- [ ] Implement `review.controller.js` and review routes.
- [ ] Add review list/form to `ProductDetailView`.
- [ ] Add `reviewApi.js`.
- [ ] Build admin review moderation view if it does not threaten final must-have completion.
- [ ] Implement report model/controller helpers for revenue, best-selling products, and order summary.
- [ ] Implement report routes with admin protection.
- [ ] Add `reportApi.js`.
- [ ] Build dashboard/report components using Astryx cards and tables.
- [ ] Update `AdminDashboardView` and `ReportView`.
- [ ] Polish responsive behavior for customer and admin routes listed in the design document.
- [ ] Run full backend API smoke tests.
- [ ] Run full frontend manual route checks.
- [ ] Update README and docs.
- [ ] Prepare demo checklist and presentation division notes.
- [ ] Freeze scope after all must-have and should-have items are verified.

## 9. Verification & Testing Plan

Backend commands:

```bash
cd backend
npx prisma validate
npm run dev
```

Frontend commands:

```bash
cd frontend
npm run dev
```

API smoke tests:

```http
POST http://localhost:5000/api/products/:id/reviews
GET http://localhost:5000/api/products/:id/reviews
DELETE http://localhost:5000/api/admin/reviews/:id

GET http://localhost:5000/api/admin/reports/revenue
GET http://localhost:5000/api/admin/reports/best-selling-products
GET http://localhost:5000/api/admin/reports/order-summary
```

Full demo verification:

- Customer can register or login.
- Customer can view homepage.
- Customer can browse product list.
- Customer can search and filter products.
- Customer can open product detail.
- Customer can add product to cart.
- Customer can update cart quantity.
- Customer can checkout with COD.
- Customer can view order history.
- Customer can view order detail.
- Customer can add product review.
- Admin can login.
- Admin can open dashboard.
- Admin can create/update/delete categories.
- Admin can create/update/delete products.
- Admin can view users.
- Admin can view orders.
- Admin can update order status.
- Admin can view revenue report.
- Admin can view best-selling products.

Expected evidence:

- Review list shows new visible reviews.
- Hidden/deleted reviews no longer appear in public product detail.
- Revenue report matches completed paid orders in the database.
- Best-selling report aggregates order detail quantities correctly.
- Order summary counts match order statuses in the database.
- Final UI has loading, success, empty, and error states for key pages.
- README setup commands are accurate.
- Demo checklist is complete and usable by all team members.

Manual quality checks:

- Confirm no real `.env` credentials are committed.
- Confirm React never imports database credentials or Prisma.
- Confirm no out-of-scope features were added.
- Confirm MVC boundaries remain clear: views call APIs, controllers handle HTTP, models handle database access.
- Confirm each large file is split if it drifts beyond a focused responsibility.

## 10. Handoff Notes for Final Submission

The final deliverable must expose:

- Running React View layer.
- Running Express Controller layer.
- Supabase PostgreSQL database connected through Prisma Models.
- Seeded demo data.
- Customer demo flow.
- Admin demo flow.
- README and supporting docs.
- Clear MVC explanation for presentation.

Hard final rules:

- Do not add new nice-to-have features after final verification starts.
- Do not change schema after final data/report verification unless the full demo flow is retested.
- Do not commit real Supabase credentials.
- Do not present planned or placeholder UI as completed runtime behavior.
- Keep the project simple, stable, and explainable for a university course demo.
