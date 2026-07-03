# Plan 2 - Catalog, Product Browsing, Category Management, and Cart

## 1. Objective

Build the product/category/catalog vertical slice and shopping cart flow on top of the Phase 1 MVC foundation. This phase makes products browsable by customers, manageable by admins through APIs and basic admin views, and addable to a persisted user cart.

## 2. Source of Truth

- `docs/plans/Master_Plan.md` section 5.1, In-Scope Features
- `docs/plans/Master_Plan.md` section 7, Member 2 Customer View Layer
- `docs/plans/Master_Plan.md` section 7, Member 3 Cart/Admin View Layer
- `docs/plans/Master_Plan.md` section 7, Member 4 Core Controller Layer
- `docs/plans/Master_Plan.md` section 7, Member 5 Business Controller Layer
- `docs/plans/Master_Plan.md` section 9, Front-end MVC View Structure
- `docs/plans/Master_Plan.md` section 13.3, ProductController
- `docs/plans/Master_Plan.md` section 13.4, CategoryController
- `docs/plans/Master_Plan.md` section 13.5, CartController
- `docs/plans/Master_Plan.md` section 15, Product, Category, and Cart APIs
- `docs/plans/Master_Plan.md` section 16, Week 2 - Product, Category, Cart
- `docs/design/design.md` sections 4, 6, 7, 8, 10, 14, 15, 20, 21, 22, 23, 24, 25, 26, 28, and 29

## 3. Prerequisites from Prior Phases

- [ ] `backend/` exists and starts successfully.
- [ ] `frontend/` exists and starts successfully.
- [ ] `backend/prisma/schema.prisma` contains the Phase 1 model contract.
- [ ] Supabase PostgreSQL tables exist and seed data is loaded.
- [ ] Auth routes, auth middleware, admin middleware, shared response helper, and shared error middleware exist.
- [ ] `AuthContext` and frontend API helper pattern exist.
- [ ] Astryx reset and style imports exist in `frontend/src/main.jsx`.

## 4. Scope

- Implement public category APIs:
  - `GET /api/categories`
- Implement admin category APIs:
  - `POST /api/admin/categories`
  - `PUT /api/admin/categories/:id`
  - `DELETE /api/admin/categories/:id`
- Implement public product APIs:
  - `GET /api/products`
  - `GET /api/products/:id`
- Implement admin product APIs:
  - `POST /api/admin/products`
  - `PUT /api/admin/products/:id`
  - `DELETE /api/admin/products/:id`
- Support product query filters:
  - `keyword`
  - `categoryId`
  - `minPrice`
  - `maxPrice`
  - optional `page` and `limit` if pagination is simple and does not delay must-have work.
- Implement cart APIs:
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PUT /api/cart/items/:id`
  - `DELETE /api/cart/items/:id`
- Build customer product browsing views:
  - `HomeView`
  - `ProductListView`
  - `ProductDetailView`
- Build product/search/filter components from `docs/design/design.md`.
- Build cart context/API helpers and `CartView`.
- Build basic admin product and category management views so the Week 2 output is demoable.
- Keep UI implementation aligned with Astryx components and tokens.

## 5. Out of Scope

- Checkout and order creation.
- Payment records.
- Order history and order detail pages.
- Admin order management.
- Product reviews and review forms.
- Revenue or best-selling reports.
- Product image upload. Use `imageUrl` text values from seed/admin forms only.
- Advanced inventory/warehouse behavior.
- Real shipping provider integration.
- Any database schema redesign from Phase 1.

## 6. Target Directory Structure

```text
backend/
|-- src/
|   |-- controllers/
|   |   |-- cart.controller.js
|   |   |-- category.controller.js
|   |   `-- product.controller.js
|   |-- models/
|   |   |-- cart.model.js
|   |   |-- cartItem.model.js
|   |   |-- category.model.js
|   |   `-- product.model.js
|   |-- routes/
|   |   |-- cart.routes.js
|   |   |-- category.routes.js
|   |   `-- product.routes.js
|   `-- utils/
|       `-- response.js
frontend/
|-- src/
|   |-- api/
|   |   |-- cartApi.js
|   |   |-- categoryApi.js
|   |   `-- productApi.js
|   |-- components/
|   |   |-- admin/
|   |   |   |-- CategoryForm.jsx
|   |   |   |-- ProductForm.jsx
|   |   |   `-- AdminTable.jsx
|   |   |-- cart/
|   |   |   |-- CartItem.jsx
|   |   |   |-- CartItemList.jsx
|   |   |   `-- CartSummary.jsx
|   |   |-- common/
|   |   |   |-- Alert.jsx
|   |   |   |-- Loading.jsx
|   |   |   `-- Pagination.jsx
|   |   `-- product/
|   |       |-- ProductCard.jsx
|   |       |-- ProductFilter.jsx
|   |       |-- ProductList.jsx
|   |       `-- SearchBar.jsx
|   |-- contexts/
|   |   `-- CartContext.jsx
|   |-- views/
|   |   |-- CartView.jsx
|   |   |-- HomeView.jsx
|   |   |-- ProductDetailView.jsx
|   |   |-- ProductListView.jsx
|   |   `-- admin/
|   |       |-- AdminCategoryView.jsx
|   |       `-- AdminProductView.jsx
|   `-- routes/
|       `-- AppRoutes.jsx
```

## 7. Technical Specifications

### 7.1 Product API

`GET /api/products`

Query parameters:

```text
keyword?: string
categoryId?: string
minPrice?: number
maxPrice?: number
page?: number
limit?: number
```

Response data:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Wireless Mouse",
      "brand": "Logi",
      "description": "Demo product",
      "price": "25.00",
      "quantity": 20,
      "imageUrl": "https://example.com/image.jpg",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "Accessories"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

Rules:

- `keyword` searches product name and brand.
- `categoryId` filters by category.
- `minPrice` and `maxPrice` filter by product price.
- Hidden/deleted product behavior is not required because the master plan does not define a product status field.
- Admin create/update must validate required fields and non-negative price/quantity.

### 7.2 Category API

`GET /api/categories` response data:

```json
[
  {
    "id": "uuid",
    "name": "Laptops",
    "description": "Laptop computers"
  }
]
```

Rules:

- Category names must be unique.
- Do not delete a category that still has products unless the implementation explicitly handles the affected products.
- Prefer blocking deletion with a clear error message for this course project.

### 7.3 Cart API

`GET /api/cart` response data:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": "25.00",
      "product": {
        "id": "uuid",
        "name": "Wireless Mouse",
        "brand": "Logi",
        "price": "25.00",
        "quantity": 20,
        "imageUrl": "https://example.com/image.jpg"
      }
    }
  ],
  "subtotal": "50.00"
}
```

`POST /api/cart/items`

```json
{
  "productId": "uuid",
  "quantity": 1
}
```

`PUT /api/cart/items/:id`

```json
{
  "quantity": 3
}
```

Rules:

- Cart routes require authentication.
- Add-to-cart creates the user's cart if it does not exist.
- Adding the same product increments the existing item quantity.
- Quantity must be at least `1`.
- Quantity may not exceed product stock.
- `unitPrice` is captured from the current product price when the item is first added.
- Cart changes do not reduce product stock. Stock changes only during Phase 3 checkout.

### 7.4 Frontend UI Contract

Customer pages:

- `HomeView` shows featured products and links to product listing.
- `ProductListView` supports search, category filter, price filters, product grid, loading, empty, and error states.
- `ProductDetailView` shows product image, info, stock status, and add-to-cart action.
- `CartView` shows cart items, quantity controls, removal action, subtotal, and checkout navigation placeholder.

Admin pages:

- `AdminProductView` supports table, search if simple, create/edit form dialog, and delete confirmation.
- `AdminCategoryView` supports table, create/edit form dialog, and delete confirmation.

Implementation constraints:

- Use `docs/design/design.md` page-to-component map before building views.
- Use Astryx components for app shell, navigation, cards, forms, tables, badges, dialogs, loading, and empty/error states.
- Follow the root `AGENTS.md` rule against custom raw layout where Astryx components cover the need.
- Keep client-side business logic shallow; the backend remains the source of truth for validation and persistence.

## 8. Implementation Steps

- [ ] Review Phase 1 code and reuse existing API client, response helper, middleware, and model patterns.
- [ ] Implement product model functions for list/filter, detail, create, update, and delete.
- [ ] Implement category model functions for list, create, update, delete, and "has products" checks.
- [ ] Implement cart model functions for get/create cart, add item, update item quantity, remove item, and subtotal calculation.
- [ ] Implement `product.controller.js`, `category.controller.js`, and `cart.controller.js`.
- [ ] Add routes and mount them under `/api`.
- [ ] Add admin middleware to admin product/category routes.
- [ ] Add auth middleware to cart routes.
- [ ] Add targeted backend tests or Postman collection examples for product/category/cart APIs.
- [ ] Build `productApi.js`, `categoryApi.js`, and `cartApi.js` using the existing API helper pattern.
- [ ] Build `CartContext.jsx` and ensure it uses auth state instead of storing user identity separately.
- [ ] Build product browsing components from the design document.
- [ ] Build `HomeView`, `ProductListView`, `ProductDetailView`, and `CartView`.
- [ ] Build admin product/category table and form views.
- [ ] Wire routes in `AppRoutes.jsx`.
- [ ] Manually verify customer and admin navigation.

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
GET http://localhost:5000/api/categories
POST http://localhost:5000/api/admin/categories
PUT http://localhost:5000/api/admin/categories/:id
DELETE http://localhost:5000/api/admin/categories/:id

GET http://localhost:5000/api/products
GET http://localhost:5000/api/products/:id
GET http://localhost:5000/api/products?keyword=mouse&categoryId=:id&minPrice=10&maxPrice=100
POST http://localhost:5000/api/admin/products
PUT http://localhost:5000/api/admin/products/:id
DELETE http://localhost:5000/api/admin/products/:id

GET http://localhost:5000/api/cart
POST http://localhost:5000/api/cart/items
PUT http://localhost:5000/api/cart/items/:id
DELETE http://localhost:5000/api/cart/items/:id
```

Expected evidence:

- Product list returns seeded products with category data.
- Product search/filter returns narrowed results.
- Product detail returns one product or a consistent 404 response.
- Admin can create, update, and delete products/categories.
- Customer cannot call admin product/category routes.
- Authenticated customer can add, update, and remove cart items.
- Cart subtotal matches item quantity times captured `unitPrice`.
- Add-to-cart rejects quantities greater than stock.
- Product stock is unchanged after cart operations.
- Customer product pages show loading, empty, success, and error states.
- Admin product/category pages use Astryx tables/forms/dialogs and no direct database calls.

Manual checks:

- Open homepage, product list, product detail, cart, admin products, and admin categories.
- Verify customer navigation does not expose admin links to non-admin users.
- Verify UI uses design document inventory and Astryx components/tokens.

## 10. Handoff Notes for Phase 3

Phase 3 must consume:

- Product model/controller behavior for product lookup and stock reads.
- Cart model/controller behavior and cart item shape.
- Auth middleware and current-user identity.
- Admin middleware for admin order routes.
- Frontend `CartContext`, `cartApi.js`, `productApi.js`, and existing route/layout patterns.

Phase 3 is expected to implement checkout, order creation, COD payment records, customer order history/detail, and admin order status management.

Hard rules for Phase 3:

- Do not reduce stock during cart updates; stock reduction belongs to order creation.
- Do not duplicate cart subtotal logic in the frontend as the source of truth.
- Do not create separate checkout-only product queries if existing product model helpers can be reused.
- Do not alter Phase 1 schema without an explicit migration section and verification of all affected Phase 2 APIs.
