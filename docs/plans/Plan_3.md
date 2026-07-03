# Plan 3 - Checkout, Orders, COD Payment, and Admin Order Management

## 1. Objective

Complete the purchase flow: authenticated customers can checkout from their cart using COD, orders are persisted with order details and payment records, product stock is reduced transactionally, customers can view order history/details, and admins can view orders and update order status.

## 2. Source of Truth

- `docs/plans/Master_Plan.md` section 5.1, In-Scope Customer and Admin Features
- `docs/plans/Master_Plan.md` section 5.2, Out-of-Scope Features
- `docs/plans/Master_Plan.md` section 7, Member 3 Cart, Order, Admin View Layer
- `docs/plans/Master_Plan.md` section 7, Member 5 Business Controller Layer
- `docs/plans/Master_Plan.md` section 13.6, OrderController
- `docs/plans/Master_Plan.md` section 13.7, PaymentController
- `docs/plans/Master_Plan.md` section 15, Order and Payment APIs
- `docs/plans/Master_Plan.md` section 16, Week 3 - Order, Payment, Admin
- `docs/plans/Master_Plan.md` section 21, Minimum Viable Demo Flow
- `docs/design/design.md` sections 11, 12, 17, 20, 21, 22, 23, 24, 25, 26, and 29

## 3. Prerequisites from Prior Phases

- [ ] Phase 1 database schema, Prisma client, auth middleware, admin middleware, and response helper exist.
- [ ] Phase 2 product APIs work and product stock can be read reliably.
- [ ] Phase 2 cart APIs work and authenticated users have persisted cart items.
- [ ] Frontend auth state and cart state are available.
- [ ] Admin layout and product/category admin route patterns exist.
- [ ] Seed data includes at least one customer, one admin, products, and categories.

## 4. Scope

- Implement order APIs:
  - `POST /api/orders`
  - `GET /api/orders/my-orders`
  - `GET /api/orders/:id`
  - `GET /api/admin/orders`
  - `PUT /api/admin/orders/:id/status`
- Implement COD payment API:
  - `POST /api/payments/cod`
- Use one transaction for checkout:
  - load current cart
  - check stock for every item
  - calculate total amount
  - create order
  - create order details
  - reduce product stock
  - create COD payment record
  - clear cart items after successful order creation
- Build checkout and order customer views:
  - `CheckoutView`
  - `OrderHistoryView`
  - `OrderDetailView`
- Build admin order management view:
  - `AdminOrderView`
- Improve shared validation and error handling where needed for checkout/order flows.
- Keep payment limited to COD only.

## 5. Out of Scope

- Online payment gateway or online payment simulation.
- Real shipping provider integration.
- Email confirmation.
- Refunds, returns, invoices, coupons, or promotions.
- ReviewController and product review UI.
- Revenue reports and best-selling products reports.
- Dashboard charts beyond simple placeholders that consume no report API.
- Database schema redesign from Phase 1.

## 6. Target Directory Structure

```text
backend/
|-- src/
|   |-- controllers/
|   |   |-- order.controller.js
|   |   `-- payment.controller.js
|   |-- models/
|   |   |-- cart.model.js
|   |   |-- order.model.js
|   |   |-- orderDetail.model.js
|   |   |-- payment.model.js
|   |   `-- product.model.js
|   |-- routes/
|   |   |-- order.routes.js
|   |   `-- payment.routes.js
|   `-- middlewares/
|       |-- admin.middleware.js
|       |-- auth.middleware.js
|       `-- validation.middleware.js
frontend/
|-- src/
|   |-- api/
|   |   |-- orderApi.js
|   |   `-- paymentApi.js
|   |-- components/
|   |   |-- admin/
|   |   |   |-- AdminTable.jsx
|   |   |   `-- OrderStatusSelect.jsx
|   |   |-- order/
|   |   |   |-- OrderDetailPanel.jsx
|   |   |   |-- OrderItem.jsx
|   |   |   |-- OrderStatusBadge.jsx
|   |   |   `-- PaymentStatusBadge.jsx
|   |   `-- checkout/
|   |       |-- CheckoutForm.jsx
|   |       |-- CheckoutOrderSummary.jsx
|   |       `-- CheckoutSuccessDialog.jsx
|   |-- views/
|   |   |-- CheckoutView.jsx
|   |   |-- OrderDetailView.jsx
|   |   |-- OrderHistoryView.jsx
|   |   `-- admin/
|   |       `-- AdminOrderView.jsx
|   `-- routes/
|       `-- AppRoutes.jsx
```

## 7. Technical Specifications

### 7.1 Order Creation API

`POST /api/orders`

Request:

```json
{
  "shippingAddress": "123 Demo Street, Ho Chi Minh City"
}
```

Rules:

- Requires authentication.
- Uses the authenticated user's cart.
- Rejects checkout if the cart is empty.
- Rejects checkout if any requested quantity exceeds current product stock.
- Calculates `totalAmount` on the backend from cart items and captured prices.
- Creates `Order` with status `pending`.
- Creates one `OrderDetail` per cart item.
- Reduces each product's `quantity`.
- Creates one `Payment` with:
  - `paymentMethod`: `COD`
  - `paymentStatus`: `unpaid`
  - `amount`: same as order total
  - `paymentDate`: `null`
- Clears cart items only after the transaction succeeds.

Response data:

```json
{
  "id": "uuid",
  "status": "pending",
  "totalAmount": "120.00",
  "shippingAddress": "123 Demo Street, Ho Chi Minh City",
  "details": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "price": "60.00",
      "product": {
        "name": "Keyboard",
        "brand": "DemoBrand"
      }
    }
  ],
  "payment": {
    "paymentMethod": "COD",
    "paymentStatus": "unpaid",
    "amount": "120.00"
  }
}
```

### 7.2 Order Read APIs

`GET /api/orders/my-orders`

- Requires authentication.
- Returns only orders for the authenticated customer.
- Sort newest first.

`GET /api/orders/:id`

- Customer can access only their own order.
- Admin can access any order.
- Includes details, product summary, and payment.

`GET /api/admin/orders`

- Requires admin.
- Supports optional `status` filter if simple.
- Sort newest first.

### 7.3 Order Status API

`PUT /api/admin/orders/:id/status`

Request:

```json
{
  "status": "confirmed"
}
```

Allowed status values:

```text
pending
confirmed
shipping
completed
cancelled
```

Rules:

- Requires admin.
- Rejects unknown statuses.
- If status becomes `completed`, update the COD payment status to `paid` and set `paymentDate`.
- If status becomes `cancelled`, do not automatically restore stock unless the implementation documents and tests a stock-restoration rule. For this course project, keep cancellation simple and visible.

### 7.4 Payment API

`POST /api/payments/cod`

- Exists only if the team wants an explicit COD endpoint for demo/API completeness.
- Must not create a second payment for an order that already has one.
- Prefer creating the COD payment inside `POST /api/orders`; the explicit endpoint may return the existing payment for the order.

Request:

```json
{
  "orderId": "uuid"
}
```

### 7.5 Frontend UI Contract

Customer checkout/order views:

- `CheckoutView` shows shipping address form, cart-derived order summary, COD-only payment method, submit button, loading state, validation error state, and success dialog.
- `OrderHistoryView` shows order list/table with status badge, payment badge, total, created date, and detail link.
- `OrderDetailView` shows shipping address, order items, order status, payment status, and total.

Admin order view:

- `AdminOrderView` shows order table with customer, status, total, created date, detail dialog, and status selector.
- Status selector must use the same status values as the backend enum.

Implementation constraints:

- Use `docs/design/design.md` checkout/order/admin order component maps.
- Use Astryx forms, tables, dialogs, badges, cards, loading, empty, and error states.
- Do not perform total calculation as source-of-truth in React. React may display backend totals.

## 8. Implementation Steps

- [ ] Review Phase 2 cart and product model functions before adding checkout logic.
- [ ] Add order model helpers for create transaction, list by user, get by id with access filtering, admin list, and update status.
- [ ] Add payment model helpers for COD payment creation and status update.
- [ ] Implement stock checks and stock reduction inside one Prisma transaction.
- [ ] Implement `order.controller.js` endpoints.
- [ ] Implement `payment.controller.js` only for the explicit COD endpoint if needed by the API summary.
- [ ] Add order and payment routes and mount them under `/api`.
- [ ] Ensure customer order reads are scoped to the authenticated user.
- [ ] Ensure admin order routes use admin middleware.
- [ ] Add targeted backend tests or Postman examples for successful checkout, empty cart, insufficient stock, customer order access, and admin status update.
- [ ] Add `orderApi.js` and `paymentApi.js`.
- [ ] Build checkout, order, and admin order components from the design document.
- [ ] Build `CheckoutView`, `OrderHistoryView`, `OrderDetailView`, and `AdminOrderView`.
- [ ] Wire route protection for checkout/order pages.
- [ ] Clear or refresh cart state after successful checkout.
- [ ] Manually verify the customer and admin demo flow through order status update.

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
POST http://localhost:5000/api/orders
GET http://localhost:5000/api/orders/my-orders
GET http://localhost:5000/api/orders/:id
GET http://localhost:5000/api/admin/orders
PUT http://localhost:5000/api/admin/orders/:id/status
POST http://localhost:5000/api/payments/cod
```

Expected evidence:

- Checkout with a non-empty cart creates an order, order details, and COD payment.
- Product stock decreases after successful checkout.
- Cart items are cleared after successful checkout.
- Checkout fails cleanly for empty cart.
- Checkout fails cleanly when requested quantity exceeds stock.
- Customer can view own order history and order detail.
- Customer cannot view another customer's order detail.
- Admin can list all orders and update status.
- Updating order status to `completed` marks COD payment as `paid`.
- Checkout and order pages show loading, success, empty, and error states.
- Admin order view uses the same order status values as the backend.

Manual checks:

- Run the customer demo flow from product detail to checkout success.
- Log in as admin and update the new order status.
- Confirm Supabase rows exist in `Order`, `OrderDetail`, and `Payment`.
- Confirm no React code writes directly to Supabase or manually mutates stock.

## 10. Handoff Notes for Phase 4

Phase 4 must consume:

- Completed order and payment records for reports.
- Product/order relationships for best-selling product calculations.
- Auth/admin middleware for review moderation and reports.
- Existing order status and payment status enum values.
- Existing customer product detail view for review display/form integration.
- Existing admin layout/table/dialog patterns.

Phase 4 is expected to implement product reviews, admin review moderation, reports, final testing, documentation, demo checklist, and presentation readiness.

Hard rules for Phase 4:

- Do not recalculate revenue from frontend state; reports must use backend/database data.
- Do not create duplicate order/payment models or reporting-only schema copies.
- Do not add online payment behavior.
- Do not change checkout transaction behavior unless tests cover the full customer/admin order flow.
