# Backend Service - tsshop API

## Overview

The `backend/` directory contains the REST API server for the **tsshop** electronics e-commerce platform. It is built with **Node.js**, **Express 5**, **Prisma ORM 6**, and **PostgreSQL**.

The backend manages user authentication and authorization (JWT + bcrypt, role-based access control, account blocking), product catalog and categorization, persistent user shopping carts, transactional Cash-on-Delivery (COD) order placement, customer product reviews with admin moderation, administrative sales and revenue reporting, dynamic storefront content management (carousel slides, hierarchical navigation, featured products), and secure OTP-based password change and password reset flows.

- **Frontend Documentation:** [../frontend/README.md](../frontend/README.md)
- **Root Repository Overview:** [../README.md](../README.md)

---

## Technology Stack

- **Runtime:** Node.js (CommonJS modules)
- **Web Framework:** [Express 5](https://expressjs.com/) (`^5.2.1`)
- **Database & ORM:** PostgreSQL with [Prisma 6](https://www.prisma.io/) (`^6.4.0`)
- **Authentication:** [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (`^9.0.3`) for JWT generation and verification
- **Password Hashing:** [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (`^6.0.0`)
- **Email & OTP Delivery:** [Nodemailer](https://nodemailer.com/) (`^9.0.3`) with console fallback mode
- **CORS & Environment:** `cors` (`^2.8.6`), `dotenv` (`^17.4.2`)
- **Development Tooling:** `nodemon` (`^3.1.14`)

---

## Directory Structure

```text
backend/
├── prisma/
│   ├── migrations/              # Database schema migrations
│   │   ├── 20260708193000_add_user_blocked_status/
│   │   ├── 20260709000000_add_password_change_otp/
│   │   └── 20260710000000_add_staff_role/
│   ├── schema.prisma            # Authoritative Prisma database schema (customer, staff, admin)
│   └── seed.js                  # Database seeding script for demo data
├── src/
│   ├── config/
│   │   ├── database.js          # Shared PrismaClient singleton instance
│   │   └── index.js             # Re-exports configuration
│   ├── controllers/             # HTTP request handling and response formatting
│   │   ├── auth.controller.js   # Registration, login, OTP request/verify/reset, getMe
│   │   ├── cart.controller.js   # Cart retrieval, item addition, updates, removal
│   │   ├── category.controller.js # Public & admin category management
│   │   ├── order.controller.js  # Checkout, customer orders, admin order management
│   │   ├── payment.controller.js # COD payment processing
│   │   ├── product.controller.js # Product browsing, filtering, admin catalog mutations
│   │   ├── report.controller.js # Revenue, best-selling products, order summaries
│   │   ├── review.controller.js # Customer reviews, admin review moderation
│   │   ├── storefrontContent.controller.js # Carousel, navigation, featured products
│   │   ├── user.controller.js   # Profile management, admin user management & blocking
│   │   └── index.js             # Re-exports all controllers
│   ├── middlewares/             # Express middlewares
│   │   ├── admin.middleware.js  # Legacy admin guard
│   │   ├── auth.middleware.js   # Validates Bearer JWT, fetches user, rejects blocked accounts
│   │   ├── error.middleware.js  # Global centralized error handler and JSON formatter
│   │   ├── permission.middleware.js # Granular capability authorization middleware
│   │   ├── validation.middleware.js # Request body field validation and password policy checks
│   │   └── index.js             # Re-exports middlewares
│   ├── models/                  # Database access layer encapsulating Prisma queries
│   │   ├── cart.model.js        # Cart creation, retrieval with relations, total calculation
│   │   ├── cartItem.model.js    # Cart item addition, quantity updates, removal
│   │   ├── category.model.js    # Category queries and CRUD operations
│   │   ├── order.model.js       # Transactional order checkout, status updates, order lookup
│   │   ├── orderDetail.model.js # Order line items queries
│   │   ├── passwordChangeOtp.model.js # OTP hashing, validity tracking, atomic consumption
│   │   ├── payment.model.js     # Payment creation and status queries
│   │   ├── product.model.js     # Product listing with filters, pagination, catalog CRUD
│   │   ├── report.model.js      # Aggregation queries for revenue, sales, and order stats
│   │   ├── review.model.js      # Product reviews creation, rating aggregation, moderation
│   │   ├── storefrontContent.model.js # Carousel slides and navigation tree queries
│   │   ├── storefrontFeatured.model.js # Featured product management and ordering
│   │   ├── user.model.js        # User lookup, profile updates, admin status/role changes
│   │   └── index.js             # Re-exports models
│   ├── routes/                  # Express route declarations
│   │   ├── auth.routes.js       # /api/auth endpoints
│   │   ├── cart.routes.js       # /api/cart endpoints
│   │   ├── category.routes.js   # /api/categories and /api/admin/categories endpoints
│   │   ├── order.routes.js      # /api/orders and /api/admin/orders endpoints
│   │   ├── payment.routes.js    # /api/payments endpoints
│   │   ├── product.routes.js    # /api/products and /api/admin/products endpoints
│   │   ├── report.routes.js     # /api/admin/reports endpoints
│   │   ├── review.routes.js     # /api/products/:id/reviews and /api/admin/reviews
│   │   ├── storefrontContent.routes.js # /api/storefront and /api/admin/storefront
│   │   ├── user.routes.js       # /api/users/profile and /api/admin/users
│   │   └── index.js             # Main router aggregating all sub-routes
│   ├── services/
│   │   └── email.service.js     # Email dispatch for OTPs (SMTP or console logging)
│   ├── utils/
│   │   ├── generateToken.js     # JWT token signing with configurable expiration
│   │   ├── otp.js               # 6-digit OTP generation, SHA-256 hashing, timing-safe checks
│   │   ├── passwordPolicy.js    # Password strength policy definition and validator
│   │   ├── response.js          # Standardized JSON response envelopes (success, error, pagination)
│   │   └── index.js             # Re-exports utilities
│   ├── app.js                   # Express application configuration and middleware registration
│   └── server.js                # Server entrypoint listening on PORT
├── .env.example                 # Example environment variables template
├── package.json                 # Project manifest, dependencies, and scripts
└── prisma.config.ts             # Prisma configuration file
```

---

## Database Architecture & Prisma Schema

The database is defined in `backend/prisma/schema.prisma` and runs on PostgreSQL:

### Enums
- **`Role`**: `customer` | `staff` | `admin`
- **`OrderStatus`**: `pending` | `confirmed` | `shipping` | `completed` | `cancelled`
- **`PaymentMethod`**: `COD` (Cash on Delivery)
- **`PaymentStatus`**: `unpaid` | `paid` | `failed`
- **`ReviewStatus`**: `visible` | `hidden` (for soft moderation)
- **`StorefrontLinkType`**: `product` | `category` | `customUrl`
- **`StorefrontNavItemType`**: `link` | `mega_menu`

### Core Data Models
1. **`User`**: Account details (`username`, `email`, `passwordHash`, `fullName`, `phone`, `address`, `role`, `isBlocked`, timestamps).
2. **`PasswordChangeOtp`**: Stores hashed OTPs (`otpHash`), attempt counts (`attempts`), expiration timestamp (`expiresAt`), and `usedAt`.
3. **`Category`**: Catalog categories (`name`, `description`, timestamps).
4. **`Product`**: Catalog products (`name`, `brand`, `description`, `price`, `quantity`, `imageUrl`, `categoryId`, timestamps).
5. **`Cart` & `CartItem`**: User shopping carts. Unique composite index on `(cartId, productId)`.
6. **`Order` & `OrderDetail`**: Orders placed by users (`totalAmount`, `status`, `shippingAddress`, timestamps) with line items (`productId`, `quantity`, `price`).
7. **`Payment`**: Payment record linked 1-to-1 with `Order` (`paymentMethod`, `paymentStatus`, `amount`, `paymentDate`).
8. **`Review`**: Product ratings (1-5) and comments linked to user and product (`status: visible | hidden`).
9. **`CarouselSlide`**: Homepage banner slides (`title`, `description`, `imageUrl`, `linkType`, `productId`, `categoryId`, `customUrl`, `sortOrder`, `isActive`).
10. **`StorefrontNavItem`**: Hierarchical header navigation items supporting standard links and multi-column mega menus with featured banners.
11. **`StorefrontSetting`**: Global storefront configuration (`featuredProductLimit`).
12. **`StorefrontFeaturedProduct`**: Hand-picked featured products for the storefront.

---

## API Reference

All API routes are served under the `/api` prefix. Standard JSON envelopes are returned:
- **Success:** `{ success: true, message: string, data: any }`
- **Paginated:** `{ success: true, message: string, data: any[], pagination: { page, limit, total, totalPages } }`
- **Error:** `{ success: false, message: string, errors?: any }`

### 1. Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Returns server uptime and timestamp |

### 2. Authentication & Security (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a new customer account |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetches current user profile from token |
| `POST` | `/api/auth/forgot-password/request-otp` | Public | Generates and delivers OTP to user email |
| `POST` | `/api/auth/forgot-password/verify-otp` | Public | Validates OTP before password reset |
| `POST` | `/api/auth/forgot-password/reset` | Public | Resets password with valid OTP |
| `POST` | `/api/auth/change-password/request-otp` | Authenticated | Requests OTP for password change |
| `POST` | `/api/auth/change-password/confirm` | Authenticated | Verifies OTP and updates account password |

### 3. User Management (`/api/users`, `/api/admin/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Authenticated | Retrieves authenticated user profile |
| `PUT` | `/api/users/profile` | Authenticated | Updates name, phone, or address |
| `GET` | `/api/admin/users` | Admin | Lists users with pagination and search; `role=customer\|staff\|admin` filters by role |
| `POST` | `/api/admin/users` | Admin | Creates a `customer` / `staff` / `admin` account (password policy enforced) and sends login credentials by email |
| `PUT` | `/api/admin/users/:id` | Admin | Updates user information |
| `PUT` | `/api/admin/users/:id/role` | Admin | Changes user role (`customer` / `staff` / `admin`) |
| `PUT` | `/api/admin/users/:id/block` | Admin | Blocks or unblocks a user account |

`GET /api/admin/users` accepts only `customer`, `staff`, or `admin` for `role`; omit it or send an empty value to include every role. Role and keyword search combine; other `role` values return HTTP 400. In the admin user view, changing the role filter resets pagination to page 1; **Clear filters** resets role, search, and page. Successful role changes reload the list with the active filters, so a user who no longer matches the selected role disappears. If a reload leaves the active page beyond the filtered result set, the view moves back to a valid page, including recovering from a now-empty final page.

### Vietnam Administrative Address Lookups (`/api/addresses`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/addresses/provinces` | Public | Lists current provinces and centrally governed cities |
| `GET` | `/api/addresses/wards?provinceCode={code}` | Public | Lists wards/communes/special zones belonging to the selected province |
| `GET` | `/api/addresses/streets?provinceCode={code}&wardCode={code}&q={text}` | Public | Searches current streets within the selected ward and province |

Successful address lookups use the standard success envelope, with `data.items` holding the results. Province items contain string `code` and canonical `name` (and `type` when supplied); ward items also include their parent `provinceCode`; street items contain provider `ref`, canonical `name`, and `displayName`. Street queries must contain 2–100 characters. Invalid area/query input returns HTTP 400. Provider-backed street lookup is limited to 60 requests per minute per `req.ip`; HTTP 429 includes `Retry-After`. Provider outages return a retryable HTTP 503 in the standard error envelope (`success: false`, `message`, and optional `errors`), never an empty or unmatched result.

Profile updates (`PUT /api/users/profile`) and checkout (`POST /api/orders`) use a structured `address` object with this request shape: `{ provinceCode: string, wardCode: string, streetRef: string, detail: string }`. Province, ward, and street names are resolved by the server; clients must send the selected string codes/reference and the user's house number or other detail, not authoritative names or a preformatted address. Checkout requires this object. Profile address is optional: omit `address` to leave it unchanged; `null` or an all-empty object clears it when there is no legacy-address reselection guard. A non-empty partial object is rejected rather than saved.

### 4. Products & Categories (`/api/products`, `/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Lists products with search, category/price filters, pagination and sorting; `stockStatus=low` means stock ≤ 5 (including zero), `stockStatus=out` means zero; other non-empty values return HTTP 400 |
| `GET` | `/api/products/:id` | Public | Retrieves detailed product information |
| `PUT` | `/api/products/:id/stock` | Staff / Admin | Fast inventory stock adjustment |
| `POST` | `/api/admin/products` | Admin | Creates a new product |
| `PUT` | `/api/admin/products/:id` | Admin | Updates product attributes and catalog data |
| `DELETE` | `/api/admin/products/:id` | Admin | Deletes a product from catalog |
| `GET` | `/api/categories` | Public | Lists all categories |
| `POST` | `/api/admin/categories` | Admin | Creates a new category |
| `PUT` | `/api/admin/categories/:id` | Admin | Updates an existing category |
| `DELETE` | `/api/admin/categories/:id` | Admin | Deletes a category |

### 5. Shopping Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Authenticated | Gets active cart with items and total calculation |
| `POST` | `/api/cart/items` | Authenticated | Adds an item to the shopping cart |
| `PUT` | `/api/cart/items` | Authenticated | Bulk updates cart item quantities |
| `PUT` | `/api/cart/items/:id` | Authenticated | Updates specific cart item quantity |
| `DELETE` | `/api/cart/items/:id` | Authenticated | Removes an item from the cart |

### 6. Orders & Payments (`/api/orders`, `/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Authenticated | Creates order from cart with COD payment (transactional) |
| `GET` | `/api/orders/my-orders` | Authenticated | Lists orders belonging to authenticated user |
| `GET` | `/api/orders/:id` | Owner / Staff / Admin | Retrieves specific order details |
| `PUT` | `/api/orders/:id/cancel` | Owner | Cancels the customer's own order while it is `pending` or `confirmed` and restocks every line item |
| `GET` | `/api/admin/orders` | Staff / Admin | Lists orders with combined status, keyword and pagination filters; `searchField=orderId\|customer\|shippingAddress\|all` selects the search domain (default `all`); unknown fields return HTTP 400 |
| `PUT` | `/api/admin/orders/:id/status` | Staff / Admin | Moves an order to an allowed next status (see lifecycle rules below) |
| `POST` | `/api/payments/cod` | Authenticated | Processes COD payment creation |

**Checkout request** (`POST /api/orders`):
- Body: `fullName` (required, 10–50 characters after trimming), `phone` (required JSON string of 9–11 ASCII digits, with no spaces or symbols), `address` (required structured object `{ provinceCode, wardCode, streetRef, detail }`), optional `note`, and optional `cartItemIds` for partial-cart checkout.
- The server checks that the province and ward codes form a current parent/child pair, resolves the selected street reference against the current provider place hierarchy, and builds the canonical address from local administrative data. `detail` must be non-empty and the complete formatted address must be at least 12 characters. Names supplied by the client are not authoritative.
- Checkout initializes `fullName`, `phone`, and a complete structured address from the user's profile. If profile loading fails, checkout leaves these values blank, shows a notice, and still allows the customer to enter them. An old unstructured `User.address` is shown as unverified, read-only text; it is never treated as a checkout address, so the customer must reselect the current province, ward, and street.
- Each order stores its own immutable recipient (`recipientName`, `recipientPhone`, `note`) and canonical structured shipping-address snapshot; later user profile changes do not rewrite existing orders.
- One `prisma.$transaction`: quantities must be positive integers; stock is decremented with a conditional `quantity >= ordered` write (fails with HTTP 409 when another checkout wins), the order/details/COD `Payment` (`unpaid`, `paymentDate: null`) are created, and only the ordered cart lines are deleted (a mismatched delete count aborts with HTTP 409).

**Order lifecycle enforcement** (`backend/src/models/order.model.js`):
- Allowed transitions: `pending → confirmed | cancelled`, `confirmed → shipping | cancelled`, `shipping → completed | cancelled`; `completed` and `cancelled` are terminal.
- Invalid transitions and unknown statuses are rejected with HTTP 400, and the status write is conditional on the current status being unchanged (guards against concurrent updates).
- Side effects inside the same transaction: moving to `cancelled` (admin or customer cancel) increments each product's `quantity` by the ordered amount; moving to `completed` marks the linked payment as `paid`.
- Customer self-cancel is limited to `pending` / `confirmed` orders (`CUSTOMER_CANCELLABLE_STATUSES`); staff and admins can cancel up to `shipping` through the admin status endpoint.

### 7. Product Reviews (`/api/products/:id/reviews`, `/api/admin/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products/:id/reviews` | Public | Lists visible reviews and average rating |
| `POST` | `/api/products/:id/reviews` | Authenticated | Submits a customer rating and review |
| `GET` | `/api/admin/reviews` | Staff / Admin | Lists all reviews for administrative/staff moderation |
| `DELETE` | `/api/admin/reviews/:id` | Staff / Admin | Hides review from public storefront |

### 8. Storefront Content Management (`/api/storefront`, `/api/admin/storefront`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/storefront/carousel` | Public | Lists active carousel slides |
| `GET` | `/api/storefront/navigation` | Public | Retrieves active mega-menu navigation tree |
| `GET` | `/api/storefront/featured-products` | Public | Retrieves active featured products |
| `GET` | `/api/admin/storefront/carousel` | Admin | Lists all carousel slides |
| `POST` | `/api/admin/storefront/carousel` | Admin | Creates a carousel slide |
| `PUT` | `/api/admin/storefront/carousel/:id` | Admin | Updates a carousel slide |
| `DELETE` | `/api/admin/storefront/carousel/:id` | Admin | Deletes a carousel slide |
| `GET` | `/api/admin/storefront/navigation` | Admin | Lists all navigation items |
| `POST` | `/api/admin/storefront/navigation` | Admin | Creates a navigation item |
| `PUT` | `/api/admin/storefront/navigation/:id` | Admin | Updates a navigation item |
| `DELETE` | `/api/admin/storefront/navigation/:id` | Admin | Deletes a navigation item |
| `GET` | `/api/admin/storefront/featured-products` | Admin | Lists configured featured products |
| `POST` | `/api/admin/storefront/featured-products/bulk` | Admin | Bulk configures featured products |
| `PUT` | `/api/admin/storefront/featured-products/reorder` | Admin | Reorders featured products |
| `PUT` | `/api/admin/storefront/settings` | Admin | Updates storefront display settings |

### 9. Operational & Financial Reports (`/api/admin/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/reports/order-summary` | Staff / Admin | Status breakdown count of orders |
| `GET` | `/api/admin/reports/best-selling-products` | Staff / Admin | Best-selling products by quantity volume |
| `GET` | `/api/admin/reports/revenue` | Admin | Financial totals, completed revenue, and metrics |

**Date-range filtering:** every report endpoint accepts optional `startDate` and `endDate` query parameters (`YYYY-MM-DD`, inclusive of the whole end day). When both are omitted the report covers all time and echoes `range: null`; when supplied, the response includes the resolved `range: { startDate, endDate }` boundaries. An invalid range — start after end, or an unparseable date — returns HTTP 400.

---

## Vietnam Address Data, Validation & Availability

The current two-level administrative dataset is vendored at `backend/src/data/vietnamAdministrativeUnits.json`. It is pinned to [ThangLeQuoc/vietnamese-provinces-database v5.2.0](https://github.com/ThangLeQuoc/vietnamese-provinces-database/tree/v5.2.0) (raw source: [full JSON](https://raw.githubusercontent.com/ThangLeQuoc/vietnamese-provinces-database/v5.2.0/json/full_json_generated_data_vn_units.json)); the file records effective date `2026-09-20`, upstream `lastUpdated` `2026-09-20T13:13:17Z`, and latest decree `388/NQ-UBTVQH16`. The official National Statistics Office administrative directory is [DMDVHC.asmx](https://danhmuchanhchinh.nso.gov.vn/DMDVHC.asmx). The snapshot contains 34 provinces and 3,321 wards, communes, and special zones, with upstream full names and codes retained as strings (including leading zeroes); the domain has no district level. The source is MIT-licensed, Copyright (c) 2021 Thang Le Quoc; the vendored JSON metadata retains the full MIT notice and links to the pinned [LICENSE](https://raw.githubusercontent.com/ThangLeQuoc/vietnamese-provinces-database/v5.2.0/LICENSE).

The browser's selections are not trusted as address authority. The server validates the province/ward relationship against this local snapshot, resolves the street reference with VietMap Place v4, and requires that the resolved street belongs to the same current province and ward. Names persisted to profiles and orders are server-derived. VietMap's relevant references are [Geocode v4](https://maps.vietmap.vn/docs/map-api/geocode-version/geocode-v4/) and [Place v4](https://maps.vietmap.vn/docs/map-api/place-v4/).

- Checkout requires the complete structured address and validates the formatted current address at 12 or more characters. A checkout name must be 10–50 characters after trimming. A required phone is a JSON string of 9–11 ASCII digits; do not send a number, because a string preserves leading zeroes. Profile phone is optional, but a non-empty value follows the same 9–11 digit string rule.
- A profile may have no address: omit `address` to keep its current value, or clear it with `null`/an empty address object when no legacy-address guard applies. If any address field is populated, province, ward, street reference, and detail must all be complete; partial addresses are rejected with HTTP 400. A non-empty legacy `User.address` without a complete structured address is shown only as unverified, read-only text. Profile edits and checkout require selecting a current structured address before the legacy value can be replaced; it is never parsed or silently converted in the UI.
- Street lookup is debounced in the UI by 350 ms and begins at two query characters. The provider-backed lookup is limited to 60 requests per minute per `req.ip`; bounded server caches retain provider results for 30 minutes. A provider outage or missing API key is a safe, retryable HTTP 503, not an empty search or a backfill `unmatched` classification. The UI offers retry for lookup failures.

---

## Structured Address Migration & Legacy Backfill

Migration `20261002000000_add_structured_vietnam_addresses` is additive: it adds seven nullable structured-address columns to `User` and seven nullable structured-address snapshot columns to `Order`. It does not transform the legacy `User.address` or existing order rows. Use a staged expand-and-fill rollout:

1. Take a fresh database backup and confirm it is restorable; rehearse the migration and backfill dry run against an isolated copy first. Confirm the intended database, provider configuration, and release/rollback plan before touching a shared or production database.
2. Apply the additive migration through the controlled Prisma migration deployment process, then verify the migration and new nullable columns before deploying code that writes them. Keep the old columns and rows intact; do not treat the backfill as a migration substitute.
3. Deploy the backend and frontend with `ADDRESS_PROVIDER=vietmap` and `VIETMAP_API_KEY` supplied only in the backend's secret environment. Confirm the deployment's address endpoints and ordinary checkout path in the intended non-production environment before production rollout.
4. Review the legacy backfill's dry-run classifications and counts. Resolve ambiguous/conflicting cases manually, take/confirm a fresh backup, then explicitly enable writes. Afterward compare counts and preserve the original legacy text and every order record. An application rollback should leave these additive columns in place; do not drop them as an automatic rollback.

Run `node prisma/backfillStructuredUserAddresses.js -h` or `node prisma/backfillStructuredUserAddresses.js --help` for CLI help. A plain `node prisma/backfillStructuredUserAddresses.js` is a dry run and performs no writes. Apply requires both a completed backup and explicit confirmation:

```bash
node prisma/backfillStructuredUserAddresses.js --apply --backup-confirmed
```

For a remote database, add the separate `--allow-remote-db` guard:

```bash
node prisma/backfillStructuredUserAddresses.js --apply --backup-confirmed --allow-remote-db
```

The CLI uses `DATABASE_URL` only and never `DIRECT_URL`; it does not create a backup, and `--backup-confirmed` is an operator assertion, not a backup command. Only the seven `User` structured `address*` columns may be filled. The CLI never rewrites `User.address`, order rows, recipient/contact fields, or roles. It stages all classifications before mutation, so provider failure causes no writes; updates are conditional on the original address and structured-field snapshot, preventing a concurrent user edit from being overwritten. Complete records are skipped on reruns; ambiguous or unmatched records stay unchanged; conflicting partial structured values require manual review.

Legacy matching calls VietMap Geocode v4 `/api/search/v4` with `layers=ADDRESS` and `display_type=5`, then `/api/place/v4` for each current-format Place candidate; POIs are not accepted. Confidence is exact only: after NFC, case, comma, and whitespace normalization, the old text must exactly equal a current provider display or `data_old.display`. It does not use fuzzy matching, abbreviation expansion, accent removal, district parsing, or top-result guessing. Candidates must pass current local province/ward boundary validation and current Place hierarchy validation, contain a non-empty house number from `hs_num`, and compose current detail + street + ward + province back to the current display. Multiple distinct exact place references are ambiguous; duplicate hits for the same reference are not. Provider outages remain retryable failures and never become `unmatched`. Logs report IDs, statuses, and counts—not original address text, credentials, or authenticated URLs.

This runbook describes the rollout; it does not assert that a production migration has been applied. Fixture-backed checks are not live VietMap provider QA, and no live-provider success is claimed here.

---

## Capability-Based Authorization Matrix

Defined in `backend/src/config/permissions.js` and enforced by `permission.middleware.js`:

| Capability | Purpose | Staff | Admin |
| :--- | :--- | :---: | :---: |
| `orders.view_all` | View system-wide order queue | ✅ | ✅ |
| `orders.update_status` | Update fulfillment state | ✅ | ✅ |
| `products.view_catalog` | View catalog lists | ✅ | ✅ |
| `products.update_stock` | Adjust stock count | ✅ | ✅ |
| `products.manage_catalog`| Create/edit product catalog | ❌ | ✅ |
| `products.delete` | Delete product | ❌ | ✅ |
| `categories.view` | View categories | ✅ | ✅ |
| `categories.manage` | Create/edit/delete categories | ❌ | ✅ |
| `reviews.view_all` | View all reviews | ✅ | ✅ |
| `reviews.moderate` | Hide inappropriate reviews | ✅ | ✅ |
| `reports.view_operational`| View order summary & top products | ✅ | ✅ |
| `reports.view_revenue` | View financial revenue | ❌ | ✅ |
| `users.view_all` | View user accounts | ❌ | ✅ |
| `users.manage_role` | Assign customer / staff / admin | ❌ | ✅ |
| `users.block` | Block / unblock users | ❌ | ✅ |
| `storefront.manage` | Manage banners & mega-menu | ❌ | ✅ |
---

## Environment Configuration

Configure environment variables in `backend/.env` (see `.env.example`):

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `5000` | HTTP port for the Express API server |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (pool or direct) |
| `DIRECT_URL` | No | - | Direct connection string for Prisma migrations |
| `JWT_SECRET` | Yes | - | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token validity duration |
| `NODE_ENV` | No | `development` | Runtime environment (`development` / `production`) |
| `ADDRESS_PROVIDER` | Yes for provider-backed address operations | `vietmap` | Selects the server-side VietMap address provider; `vietmap` is the supported value |
| `VIETMAP_API_KEY` | Yes for provider-backed address operations | - | VietMap credential, configured as a backend-only secret; never expose it through frontend `VITE_` variables |
| `PASSWORD_OTP_EXPIRES_MINUTES`| No | `10` | Expiration time for password OTPs in minutes |
| `PASSWORD_OTP_MAX_ATTEMPTS` | No | `5` | Maximum failed verification attempts before invalidation |
| `PASSWORD_OTP_DELIVERY_MODE` | No | `console` | OTP delivery channel (`console` or `smtp`) |
| `SMTP_HOST` | If SMTP | - | SMTP server hostname |
| `SMTP_PORT` | If SMTP | `587` | SMTP server port |
| `SMTP_USER` | If SMTP | - | SMTP authentication username |
| `SMTP_PASS` | If SMTP | - | SMTP authentication password |
| `SMTP_FROM` | If SMTP | `no-reply@example.com` | From header email address |

---

## Setup & Running

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Configure DATABASE_URL and JWT_SECRET; set ADDRESS_PROVIDER=vietmap and keep VIETMAP_API_KEY only in the backend environment when enabling provider-backed address operations.
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with initial admin, categories, and products
npm run prisma:seed
```

**Existing databases — product images only:** do not re-run the full seed to replace photos. Point both database URLs at the intended isolated local database and take a fresh backup first. This maintenance command connects only through `DATABASE_URL`, never writes another product field, matches exact seed name/brand/category, preserves custom images and non-seed rows, and is idempotent.

```bash
node prisma/updateProductImages.js                         # Dry run: inspect exact imageUrl changes
node prisma/updateProductImages.js --apply --backup-confirmed # Apply only after backup and target review
node prisma/updateProductImages.js --qa                    # Validate all 40 model photo/source configurations
```

Remote apply is blocked unless the operator explicitly adds `--allow-remote-db`; that flag is not permission for local QA to contact a remote database. All 40 models now have photos: 17 licensed local WebP assets and 23 direct manufacturer/retailer links. `--qa` checks local assets and matching source metadata, and fails missing/invalid configurations; it does not fetch external URLs or verify reuse permission. Local attribution remains in `phones-laptops.json` and `watches-accessories.json`; `linked-phones-laptops.json` and `linked-watches-accessories.json` record direct links, model source pages, and `reusePermission: "unverified"`. All four manifests live in [`frontend/public/products`](../frontend/public/products). External links may change; the frontend retains its broken-image fallback.

### 4. Start the Server
```bash
# Development mode (auto-reload via nodemon)
npm run dev

# Production mode
npm start
```
The server will start and listen on `http://localhost:5000` (or the configured `PORT`).

---

## Testing & Validation

Backend validation test scripts can be executed using Node's test runner:

```bash
# Run unit and structural test files
node --test src/controllers/*.test.js
node --test src/models/*.test.js
node --test src/middlewares/*.test.js
node --test src/routes/*.test.js
node --test src/services/*.test.js
node --test src/utils/*.test.js
```

---

## Development Notes for AI Agents

1. **Authentication & User State:**
   - `auth.middleware.js` extracts the Bearer token, verifies it, fetches the live user record from the database, and checks `isBlocked`. If `isBlocked === true`, the request is immediately rejected with a 403 Forbidden status, ensuring blocked tokens are revoked without waiting for expiration.
2. **Password Policy & OTP Invariants:**
   - Passwords must meet the policy defined in `src/utils/passwordPolicy.js` (minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character).
   - OTP codes are 6-digit numeric strings hashed with SHA-256 before storage in `PasswordChangeOtp`. Plain OTPs are never stored in the database.
3. **Database Transactions:**
   - Cart checkout in `order.model.js` uses Prisma interactive transactions (`prisma.$transaction`) to atomically create the `Order`, `OrderDetail` records, `Payment` record, and clear the user's `CartItem` records.
4. **Error Handling:**
   - Always throw or pass errors to `next(err)`. `src/middlewares/error.middleware.js` catches all errors and formats them into standard `{ success: false, message }` JSON responses with appropriate HTTP status codes.
5. **No Hardcoded Secrets:**
   - Never commit `.env` or hardcode database credentials or JWT secrets. Always read from `process.env`.
