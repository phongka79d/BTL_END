# API Testing Runbook

This is a Postman/manual smoke-test sequence for the implemented MVC API. It is
a reusable runbook, not evidence that Batch06 or a new live run has completed.

## Prerequisites and Safe Variables

1. Configure the private backend `.env` as described in `README.md`.
2. Run `cd backend`, `npx prisma validate`, `npx prisma db seed`, and `npm run dev`.
3. In Postman, create local environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `customerToken`: set from the customer login response
   - `adminToken`: set from the admin login response
   - `productId`, `cartItemId`, `orderId`, and `reviewId`: set from earlier responses
4. For protected requests, use `Authorization: Bearer {{customerToken}}` or
   `Authorization: Bearer {{adminToken}}`.

Do not export tokens, passwords, database URLs, or `.env` values. Use disposable
records for mutation checks and avoid deleting shared seed data.

All successful responses use `{ "success": true, "message": "...", "data": ... }`.
Errors use `success: false`; validate the HTTP status as well as the envelope.

## 1. Authentication

| Request | Body / authorization | Expected |
|---|---|---|
| `POST {{baseUrl}}/auth/login` | Seeded customer email/password from `README.md` | `200`; save `data.token` as `customerToken`. |
| `GET {{baseUrl}}/auth/me` | Customer bearer token | `200`; returned user role is `customer`. |
| `POST {{baseUrl}}/auth/login` | Seeded admin email/password from `README.md` | `200`; save `data.token` as `adminToken`. |
| `GET {{baseUrl}}/auth/me` | Admin bearer token | `200`; returned user role is `admin`. |
| `GET {{baseUrl}}/auth/me` | No token | `401`. |

Optional registration check: `POST /auth/register` with a unique demo email and
`username`, `email`, and `password`. Expect `201`; do not reuse real credentials.

## 2. Products and Categories

1. `GET {{baseUrl}}/categories` -> expect `200`; save a category ID.
2. `GET {{baseUrl}}/products` -> expect `200`; save an in-stock product ID.
3. `GET {{baseUrl}}/products/{{productId}}` -> expect `200`.
4. `GET {{baseUrl}}/products?keyword=<term>&categoryId=<id>&minPrice=0&maxPrice=<value>`
   -> expect `200` and only matching products.
5. Call `POST {{baseUrl}}/admin/products` without a token -> expect `401`.
6. Call it with the customer token -> expect `403`.
7. If admin mutation evidence is needed, create, update, then delete a uniquely
   named temporary category/product with the admin token.

## 3. Customer Cart

1. `GET {{baseUrl}}/cart` with the customer token -> expect `200`.
2. `POST {{baseUrl}}/cart/items` with
   `{ "productId": "{{productId}}", "quantity": 1 }` -> expect `201`; save
   the returned cart-item ID as `cartItemId`.
3. `PUT {{baseUrl}}/cart/items/{{cartItemId}}` with `{ "quantity": 2 }` ->
   expect `200` when stock permits.
4. Repeat with a quantity above stock -> expect `400`.
5. Keep one valid cart item for checkout. To test removal separately, use
   `DELETE {{baseUrl}}/cart/items/{{cartItemId}}` -> expect `200`.
6. Repeat a cart request without a token -> expect `401`.

## 4. Orders and COD Payment

1. Ensure the customer cart contains an in-stock item.
2. `POST {{baseUrl}}/orders` with
   `{ "shippingAddress": "Course demo address" }` and the customer token ->
   expect `201`; save the order ID as `orderId`.
3. `GET {{baseUrl}}/orders/my-orders` with the customer token -> expect `200`
   and the new order.
4. `GET {{baseUrl}}/orders/{{orderId}}` with its owner token -> expect `200`.
5. `GET {{baseUrl}}/admin/orders` with the admin token -> expect `200`.
6. `PUT {{baseUrl}}/admin/orders/{{orderId}}/status` with
   `{ "status": "completed" }` and the admin token -> expect `200`.
7. `POST {{baseUrl}}/payments/cod` with `{ "orderId": "{{orderId}}" }` and
   the customer token -> expect the existing COD payment behavior; repeating
   the request must not create a duplicate payment.
8. Verify anonymous admin-order access returns `401` and customer admin-order
   access returns `403`.

Checkout mutates stock and clears the cart. Use a dedicated demo product/order
or reseed only when it is safe for the shared environment.

## 5. Product Reviews

1. `GET {{baseUrl}}/products/{{productId}}/reviews` without a token -> expect
   `200` and only reviews whose status is visible.
2. `POST {{baseUrl}}/products/{{productId}}/reviews` with the customer token
   and `{ "rating": 5, "comment": "  Course demo review  " }` -> expect
   `201`; save `data.review.id` as `reviewId` and verify the comment is trimmed.
3. Repeat with rating `0`, `6`, or `4.5` -> expect `400`.
4. Repeat without a token -> expect `401`.
5. `DELETE {{baseUrl}}/admin/reviews/{{reviewId}}` with the customer token ->
   expect `403`.
6. Repeat with the admin token -> expect `200`. This endpoint hides the review.
7. List product reviews again -> expect the hidden review to be absent.

## 6. Admin Reports

Run each request with the admin token and expect `200`:

- `GET {{baseUrl}}/admin/reports/revenue`
- `GET {{baseUrl}}/admin/reports/best-selling-products`
- `GET {{baseUrl}}/admin/reports/order-summary`

For each endpoint, repeat without a token -> expect `401`; repeat with the
customer token -> expect `403`.

Compare report values with the same current database snapshot:

- Revenue includes only completed orders with paid COD payments.
- Best-selling products aggregate `OrderDetail.quantity` and captured unit price.
- Order summary includes `pending`, `confirmed`, `shipping`, `completed`, and
  `cancelled`, including zero counts.

Database-to-report comparison is part of the later Batch06 live verification.
Do not mark it passed from this runbook alone.

## Result Recording

Record date, environment, request, expected status, actual status, and a redacted
response summary. Mark inaccessible credentials, database, or dashboard checks
as `BLOCKED_BY_USER_ACTION`; never substitute planned behavior for runtime proof.
