# MVC Implementation Plan — Electronics E-Commerce Website with Supabase PostgreSQL

## 1. Project Overview

### 1.1 Project Name

**Electronics E-Commerce Website**

### 1.2 Project Type

This is a **university major assignment / course project**, not a large-scale production product.

The goal is to build a complete but manageable web application using a clear **MVC architecture** with:

- **React.js** as the View layer
- **Node.js / Express.js** as the Controller layer
- **Supabase PostgreSQL** as the hosted Database
- **Prisma or Sequelize Models** as the Model layer

The project should focus on being easy to build, easy to explain, and easy to demonstrate.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| View | React.js |
| Front-end Tooling | Vite |
| Controller | Node.js + Express.js |
| Model | Prisma Models or Sequelize Models |
| Database | Supabase PostgreSQL |
| Authentication | JWT |
| Password Hashing | bcrypt |
| API Style | RESTful API |
| API Testing | Postman |
| Version Control | Git + GitHub |
| Styling / UI System | Astryx Design System |

---

## 3. Supabase PostgreSQL Usage

### 3.1 Supabase Role in This Project

Supabase is used as the **hosted PostgreSQL database provider** for this project.

The team will use Supabase mainly for:

- Creating a cloud PostgreSQL database
- Managing tables and relationships
- Viewing data through Supabase Table Editor
- Running SQL when needed through Supabase SQL Editor
- Getting the PostgreSQL connection string for the Node.js back-end

Supabase will **not** be used as the main authentication system in this project.
Authentication will still be handled by the Node.js / Express.js back-end using JWT and bcrypt.

This keeps the architecture simple and consistent with MVC:

```text
React.js View
    ↓
Express.js Controller
    ↓
Prisma / Sequelize Model
    ↓
Supabase PostgreSQL Database
```

### 3.2 Why Use Supabase PostgreSQL

Supabase PostgreSQL is suitable for this assignment because:

- The team does not need to install PostgreSQL locally on every computer.
- All members can connect to the same shared database.
- The database can be managed visually through the Supabase dashboard.
- It is easier to demo because the data is stored online.
- It still uses standard PostgreSQL, so the system remains compatible with Prisma or Sequelize.

### 3.3 Supabase Boundary

For this course project, Supabase should be treated as the **database platform only**.

Recommended usage:

```text
Use Supabase PostgreSQL: Yes
Use Supabase Table Editor: Yes
Use Supabase SQL Editor: Yes
Use Supabase Auth: No
Use Supabase Storage: Optional only if product image upload is added later
Use Supabase Edge Functions: No
```

---

## 4. MVC Architecture

### 3.1 MVC Definition in This Project

This project follows the **Model-View-Controller architecture**.

```text
User
 ↓
View Layer — React.js
 ↓
Controller Layer — Express.js Controllers
 ↓
Model Layer — Prisma / Sequelize Models
 ↓
Database — Supabase PostgreSQL
```

### 3.2 MVC Mapping

| MVC Part | Project Implementation | Responsibility |
|---|---|---|
| Model | Prisma / Sequelize models | Define data structure, relationships, and database operations |
| View | React.js pages and components | Display UI and collect user input |
| Controller | Express.js controllers | Receive requests, validate input, call Models, and return responses |
| Database | Supabase PostgreSQL | Store persistent data |

---

## 5. MVC Request Flow

### 4.1 Customer Views Product List

```text
Customer opens Product List page
 ↓
React View sends GET /api/products
 ↓
ProductController receives request
 ↓
Product Model queries Supabase PostgreSQL
 ↓
ProductController returns JSON response
 ↓
React View renders product list
```

### 4.2 Customer Places Order

```text
Customer clicks Checkout
 ↓
React Checkout View sends POST /api/orders
 ↓
OrderController receives request
 ↓
Order Model creates order
 ↓
OrderDetail Model creates order items
 ↓
Product Model updates stock quantity
 ↓
Payment Model creates COD payment record
 ↓
OrderController returns order result
 ↓
React View shows order success message
```

### 4.3 Admin Updates Product

```text
Admin opens Product Management page
 ↓
React Admin View sends PUT /api/admin/products/:id
 ↓
ProductController checks admin permission
 ↓
Product Model updates product data
 ↓
ProductController returns updated product
 ↓
React View updates the product table
```

---

## 6. Project Scope

### 5.1 In-Scope Features

#### Customer Features

- Register account
- Login
- Logout
- View homepage
- View product list
- Search products by name
- Filter products by category
- View product details
- Add product to cart
- Update cart item quantity
- Remove product from cart
- Checkout using COD payment
- View order history
- View order details
- Add product review

#### Admin Features

- Login as admin
- View admin dashboard
- Manage products
- Manage categories
- Manage users
- Manage orders
- Update order status
- View basic revenue report
- View best-selling products

---

### 5.2 Out-of-Scope Features

To keep the project suitable for a 5-member course assignment, the following features should not be implemented unless there is extra time:

- Real online payment gateway
- Real shipping provider integration
- Email verification
- Forgot password by email
- Real-time notifications
- AI chatbot
- Recommendation system
- Mobile application
- Multi-store management
- Advanced warehouse management
- Accounting system

---

## 7. Team Member Responsibility Plan

The team has **5 members**.

The project should be divided by MVC modules and main business features.

---

### Member 1 — Project Lead, Model Layer, Supabase Database

#### Main Role

Responsible for the **Model layer**, Supabase PostgreSQL database design, ERD, seed data, GitHub structure, and final integration.

#### Responsibilities

- Create GitHub repository
- Create project folder structure
- Design Supabase PostgreSQL database
- Create ERD diagram
- Define Prisma or Sequelize models
- Define model relationships
- Create database migrations for Supabase PostgreSQL
- Create Supabase seed data for demo
- Review MVC consistency
- Support final integration
- Prepare demo checklist

#### Main Deliverables

- Supabase PostgreSQL schema
- ERD diagram
- ORM model definitions
- Supabase database migrations
- Supabase seed data
- Final integration checklist

#### Suggested Files

```text
/backend/prisma/schema.prisma
/backend/prisma/seed.js
/docs/database-design.md
/docs/erd.png
/docs/demo-checklist.md
```

---

### Member 2 — Customer View Layer

#### Main Role

Responsible for the **customer-facing React Views**.

#### Responsibilities

- Build homepage
- Build product list page
- Build product detail page
- Build search UI
- Build filter UI
- Build category display
- Build reusable product components
- Connect customer views to controller APIs

#### Main Views

```text
HomePage
ProductListPage
ProductDetailPage
LoginPage
RegisterPage
```

#### Main Components

```text
Header
Footer
ProductCard
ProductList
ProductFilter
SearchBar
Pagination
Loading
Alert
```

#### APIs Used

```http
GET /api/products
GET /api/products/:id
GET /api/categories
GET /api/products?keyword=&categoryId=&minPrice=&maxPrice=
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

#### Main Deliverables

- Customer product browsing views
- Search and filter views
- Product detail view
- Login and register views

---

### Member 3 — Cart, Order, Admin View Layer

#### Main Role

Responsible for the **cart, checkout, order, and admin React Views**.

#### Responsibilities

- Build cart page
- Build checkout page
- Build order history page
- Build order detail page
- Build admin dashboard
- Build admin product management page
- Build admin category management page
- Build admin order management page
- Build report page

#### Main Views

```text
CartPage
CheckoutPage
OrderHistoryPage
OrderDetailPage
AdminDashboardPage
AdminProductPage
AdminCategoryPage
AdminOrderPage
ReportPage
```

#### Main Components

```text
CartItem
OrderItem
AdminSidebar
AdminTable
ProductForm
CategoryForm
OrderStatusSelect
ReportCard
```

#### APIs Used

```http
GET /api/cart
POST /api/cart/items
PUT /api/cart/items/:id
DELETE /api/cart/items/:id

POST /api/orders
GET /api/orders/my-orders
GET /api/orders/:id

GET /api/admin/orders
PUT /api/admin/orders/:id/status

GET /api/admin/reports/revenue
GET /api/admin/reports/best-selling-products
```

#### Main Deliverables

- Cart view
- Checkout view
- Order history view
- Admin management views
- Report view

---

### Member 4 — Core Controller Layer

#### Main Role

Responsible for the **core Express.js Controllers**.

#### Responsibilities

- Initialize Express.js back-end project
- Configure routes
- Configure middleware
- Implement authentication controllers
- Implement user controllers
- Implement product controllers
- Implement category controllers
- Implement JWT authentication middleware
- Implement admin authorization middleware
- Return consistent JSON responses

#### Controllers To Implement

```text
AuthController
UserController
ProductController
CategoryController
```

#### APIs To Implement

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

GET /api/users/profile
PUT /api/users/profile
GET /api/admin/users

GET /api/products
GET /api/products/:id
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id

GET /api/categories
POST /api/admin/categories
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

#### Main Deliverables

- Express.js setup
- Authentication controllers
- User controllers
- Product controllers
- Category controllers
- Authentication middleware
- Admin middleware

---

### Member 5 — Business Controller Layer

#### Main Role

Responsible for the **cart, order, payment, review, and report controllers**.

#### Responsibilities

- Implement cart controllers
- Implement order controllers
- Implement payment controllers
- Implement review controllers
- Implement report controllers
- Check product stock before placing order
- Calculate order total
- Create order details
- Reduce product stock after successful order
- Create COD payment record
- Generate simple revenue statistics

#### Controllers To Implement

```text
CartController
OrderController
PaymentController
ReviewController
ReportController
```

#### APIs To Implement

```http
GET /api/cart
POST /api/cart/items
PUT /api/cart/items/:id
DELETE /api/cart/items/:id

POST /api/orders
GET /api/orders/my-orders
GET /api/orders/:id
GET /api/admin/orders
PUT /api/admin/orders/:id/status

POST /api/payments/cod

POST /api/products/:id/reviews
GET /api/products/:id/reviews
DELETE /api/admin/reviews/:id

GET /api/admin/reports/revenue
GET /api/admin/reports/best-selling-products
GET /api/admin/reports/order-summary
```

#### Main Deliverables

- Cart controllers
- Order controllers
- Payment controllers
- Review controllers
- Report controllers
- Checkout business flow

---

## 8. MVC Folder Structure

### 7.1 Root Folder

```text
electronics-ecommerce/
├── frontend/
├── backend/
├── docs/
├── README.md
└── .gitignore
```

---

## 9. Front-end MVC View Structure

The `frontend` folder represents the **View layer** in MVC.

```text
frontend/
├── src/
│   ├── views/
│   │   ├── HomeView.jsx
│   │   ├── ProductListView.jsx
│   │   ├── ProductDetailView.jsx
│   │   ├── CartView.jsx
│   │   ├── CheckoutView.jsx
│   │   ├── LoginView.jsx
│   │   ├── RegisterView.jsx
│   │   ├── OrderHistoryView.jsx
│   │   ├── OrderDetailView.jsx
│   │   └── admin/
│   │       ├── AdminDashboardView.jsx
│   │       ├── AdminProductView.jsx
│   │       ├── AdminCategoryView.jsx
│   │       ├── AdminOrderView.jsx
│   │       └── ReportView.jsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── order/
│   │   └── admin/
│   │
│   ├── api/
│   │   ├── authApi.js
│   │   ├── productApi.js
│   │   ├── categoryApi.js
│   │   ├── cartApi.js
│   │   ├── orderApi.js
│   │   ├── paymentApi.js
│   │   ├── reviewApi.js
│   │   └── reportApi.js
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   └── AdminLayout.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   │
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

### 8.1 View Layer Rules

- React views are responsible for displaying UI.
- React views collect user input.
- React views call back-end controller APIs.
- React views should not directly access the database.
- React views should not contain database logic.
- React views should not contain complex business logic.
- Front-end implementation agents must use `docs/design/design.md` as the UI source of truth before building React pages or components.
- Agents should follow the design document's page inventory, layout rules, component mapping, states, and responsive behavior instead of inventing new UI patterns.
- Astryx components and tokens should be used for layout, navigation, forms, cards, tables, dialogs, badges, loading states, and empty/error states.

---

## 10. Back-end MVC Structure

The `backend` folder contains the **Controller layer** and **Model layer**.

```text
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── review.controller.js
│   │   └── report.controller.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── category.model.js
│   │   ├── product.model.js
│   │   ├── cart.model.js
│   │   ├── cartItem.model.js
│   │   ├── order.model.js
│   │   ├── orderDetail.model.js
│   │   ├── payment.model.js
│   │   └── review.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── review.routes.js
│   │   └── report.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── admin.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── response.js
│   │
│   ├── app.js
│   └── server.js
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── .env.example
├── package.json
└── README.md
```

### 9.1 Controller Layer Rules

- Controllers receive HTTP requests.
- Controllers validate request data.
- Controllers call Models to read or write data.
- Controllers apply simple business rules.
- Controllers return JSON responses.
- Controllers should not render HTML because React handles the View layer.

### 9.2 Model Layer Rules

- Models define database entities.
- Models define relationships between entities.
- Models communicate with Supabase PostgreSQL through ORM.
- Models should not handle UI logic.
- Models should not directly handle HTTP request and response objects.

---

## 11. Database Design

### 10.1 Main Models

The system should include these main Models:

```text
User
Category
Product
Cart
CartItem
Order
OrderDetail
Payment
Review
```

---

### 10.2 Model Descriptions

#### User Model

Represents customers and admins.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| username | VARCHAR | Username |
| email | VARCHAR | Unique email |
| password_hash | VARCHAR | Hashed password |
| full_name | VARCHAR | Full name |
| phone | VARCHAR | Phone number |
| address | TEXT | Address |
| role | VARCHAR | customer or admin |
| created_at | TIMESTAMP | Created time |
| updated_at | TIMESTAMP | Updated time |

---

#### Category Model

Represents product categories.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| name | VARCHAR | Category name |
| description | TEXT | Category description |
| created_at | TIMESTAMP | Created time |
| updated_at | TIMESTAMP | Updated time |

---

#### Product Model

Represents electronic products.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| name | VARCHAR | Product name |
| brand | VARCHAR | Product brand |
| description | TEXT | Product description |
| price | DECIMAL | Product price |
| quantity | INTEGER | Stock quantity |
| image_url | TEXT | Product image URL |
| category_id | UUID / INTEGER | Foreign key to Category |
| created_at | TIMESTAMP | Created time |
| updated_at | TIMESTAMP | Updated time |

---

#### Cart Model

Represents the shopping cart of a customer.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| user_id | UUID / INTEGER | Foreign key to User |
| created_at | TIMESTAMP | Created time |
| updated_at | TIMESTAMP | Updated time |

---

#### CartItem Model

Represents a product inside a cart.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| cart_id | UUID / INTEGER | Foreign key to Cart |
| product_id | UUID / INTEGER | Foreign key to Product |
| quantity | INTEGER | Item quantity |
| unit_price | DECIMAL | Product price at time added |
| created_at | TIMESTAMP | Created time |
| updated_at | TIMESTAMP | Updated time |

---

#### Order Model

Represents a customer order.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| user_id | UUID / INTEGER | Foreign key to User |
| total_amount | DECIMAL | Order total amount |
| status | VARCHAR | pending, confirmed, shipping, completed, cancelled |
| shipping_address | TEXT | Delivery address |
| created_at | TIMESTAMP | Created time |
| updated_at | TIMESTAMP | Updated time |

---

#### OrderDetail Model

Represents each product inside an order.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| order_id | UUID / INTEGER | Foreign key to Order |
| product_id | UUID / INTEGER | Foreign key to Product |
| quantity | INTEGER | Ordered quantity |
| price | DECIMAL | Product price at order time |

---

#### Payment Model

Represents payment information for an order.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| order_id | UUID / INTEGER | Foreign key to Order |
| payment_method | VARCHAR | COD |
| payment_status | VARCHAR | unpaid, paid, failed |
| amount | DECIMAL | Payment amount |
| payment_date | TIMESTAMP | Payment time |

---

#### Review Model

Represents a customer review for a product.

| Field | Type | Description |
|---|---|---|
| id | UUID / SERIAL | Primary key |
| user_id | UUID / INTEGER | Foreign key to User |
| product_id | UUID / INTEGER | Foreign key to Product |
| rating | INTEGER | Rating from 1 to 5 |
| comment | TEXT | Review content |
| status | VARCHAR | visible, hidden |
| created_at | TIMESTAMP | Created time |
| updated_at | TIMESTAMP | Updated time |

---

## 12. Model Relationships

```text
User 1 --- 1 Cart
User 1 --- N Order
User 1 --- N Review

Category 1 --- N Product

Cart 1 --- N CartItem
Product 1 --- N CartItem

Order 1 --- N OrderDetail
Product 1 --- N OrderDetail

Order 1 --- 1 Payment

Product 1 --- N Review
```

---

## 13. Controller Design

### 12.1 AuthController

Responsible for authentication.

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

Main actions:

- Register new user
- Hash password
- Login user
- Generate JWT token
- Get current logged-in user

---

### 12.2 UserController

Responsible for user profile and admin user management.

```http
GET /api/users/profile
PUT /api/users/profile
GET /api/admin/users
```

Main actions:

- Get customer profile
- Update customer profile
- Get all users for admin

---

### 12.3 ProductController

Responsible for product management.

```http
GET /api/products
GET /api/products/:id
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id
```

Main actions:

- Get product list
- Search products
- Filter products
- Get product detail
- Create product
- Update product
- Delete product

---

### 12.4 CategoryController

Responsible for category management.

```http
GET /api/categories
POST /api/admin/categories
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

Main actions:

- Get all categories
- Create category
- Update category
- Delete category

---

### 12.5 CartController

Responsible for shopping cart management.

```http
GET /api/cart
POST /api/cart/items
PUT /api/cart/items/:id
DELETE /api/cart/items/:id
```

Main actions:

- Get current user's cart
- Add product to cart
- Update cart item quantity
- Remove product from cart

---

### 12.6 OrderController

Responsible for order management.

```http
POST /api/orders
GET /api/orders/my-orders
GET /api/orders/:id
GET /api/admin/orders
PUT /api/admin/orders/:id/status
```

Main actions:

- Create order
- Check product stock
- Calculate total amount
- Create order details
- Reduce stock quantity
- Get customer order history
- Get order detail
- Get all orders for admin
- Update order status

---

### 12.7 PaymentController

Responsible for COD payment.

```http
POST /api/payments/cod
```

Main actions:

- Create COD payment record
- Update payment status when order is completed

---

### 12.8 ReviewController

Responsible for product reviews.

```http
POST /api/products/:id/reviews
GET /api/products/:id/reviews
DELETE /api/admin/reviews/:id
```

Main actions:

- Add product review
- Get product reviews
- Delete inappropriate review as admin

---

### 12.9 ReportController

Responsible for simple admin reports.

```http
GET /api/admin/reports/revenue
GET /api/admin/reports/best-selling-products
GET /api/admin/reports/order-summary
```

Main actions:

- Calculate total revenue
- Get best-selling products
- Count orders by status

---

## 14. View Design

### 13.1 Customer Views

```text
HomeView
ProductListView
ProductDetailView
CartView
CheckoutView
LoginView
RegisterView
OrderHistoryView
OrderDetailView
```

### 13.2 Admin Views

```text
AdminDashboardView
AdminProductView
AdminCategoryView
AdminOrderView
ReportView
```

### 13.3 View Responsibilities

Views should:

- Display data
- Show forms
- Collect user input
- Call controller APIs
- Show loading states
- Show success and error messages

Views should not:

- Access database directly
- Contain SQL queries
- Contain model definitions
- Perform complex database operations

---

## 15. API Design Summary

### Authentication APIs

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### User APIs

```http
GET /api/users/profile
PUT /api/users/profile
GET /api/admin/users
```

### Product APIs

```http
GET /api/products
GET /api/products/:id
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id
```

### Category APIs

```http
GET /api/categories
POST /api/admin/categories
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

### Cart APIs

```http
GET /api/cart
POST /api/cart/items
PUT /api/cart/items/:id
DELETE /api/cart/items/:id
```

### Order APIs

```http
POST /api/orders
GET /api/orders/my-orders
GET /api/orders/:id
GET /api/admin/orders
PUT /api/admin/orders/:id/status
```

### Payment APIs

```http
POST /api/payments/cod
```

### Review APIs

```http
POST /api/products/:id/reviews
GET /api/products/:id/reviews
DELETE /api/admin/reviews/:id
```

### Report APIs

```http
GET /api/admin/reports/revenue
GET /api/admin/reports/best-selling-products
GET /api/admin/reports/order-summary
```

---

## 16. Development Timeline

This plan assumes a **4-week implementation timeline**.

If the deadline is shorter, the team should remove review and report features first.

---

### Week 1 — MVC Foundation

#### Goals

- Create project repository
- Set up React View project
- Set up Express Controller project
- Set up Supabase PostgreSQL database
- Define Models
- Implement authentication

#### Tasks

| Member | Tasks |
|---|---|
| Member 1 | Create GitHub repo, ERD, Supabase PostgreSQL schema, ORM models |
| Member 2 | Set up React project, MainLayout, HomeView, ProductCard |
| Member 3 | Set up AdminLayout, CartView skeleton, CheckoutView skeleton |
| Member 4 | Set up Express project, AuthController, UserController, middleware |
| Member 5 | Prepare CartController and OrderController structure |

#### Week 1 Output

- React project runs
- Express project runs
- Supabase PostgreSQL connects successfully
- Models are created
- Register API works
- Login API works
- Basic homepage view works

---

### Week 2 — Product, Category, Cart

#### Goals

- Complete product and category models/controllers
- Complete product views
- Complete cart feature

#### Tasks

| Member | Tasks |
|---|---|
| Member 1 | Seed sample categories and products |
| Member 2 | ProductListView, ProductDetailView, search/filter views |
| Member 3 | CartView, add/update/remove cart UI |
| Member 4 | ProductController, CategoryController |
| Member 5 | CartController |

#### Week 2 Output

- Product list works
- Product detail works
- Product search and filter work
- Admin can manage products and categories
- Customer can add products to cart

---

### Week 3 — Order, Payment, Admin

#### Goals

- Complete checkout flow
- Complete order management
- Complete COD payment
- Complete admin order management

#### Tasks

| Member | Tasks |
|---|---|
| Member 1 | Integration testing and database issue fixing |
| Member 2 | Improve customer views and product UI |
| Member 3 | CheckoutView, OrderHistoryView, AdminOrderView |
| Member 4 | Improve middleware, validation, and user APIs |
| Member 5 | OrderController and PaymentController |

#### Week 3 Output

- Customer can checkout
- Order is saved in database
- Product stock is updated
- Customer can view order history
- Admin can update order status
- COD payment record is created

---

### Week 4 — Review, Report, Testing, Documentation

#### Goals

- Complete remaining features
- Test full MVC system
- Prepare documentation
- Prepare presentation
- Prepare demo

#### Tasks

| Member | Tasks |
|---|---|
| Member 1 | Final integration, Supabase database backup/export, demo checklist |
| Member 2 | Responsive UI polish |
| Member 3 | Admin dashboard and report views |
| Member 4 | Bug fixing, error handling, API validation |
| Member 5 | ReviewController, ReportController, final business logic testing |

#### Week 4 Output

- Product review works
- Revenue report works
- Best-selling product report works
- Final demo is ready
- Documentation is ready
- Presentation is ready

---

## 17. Git Workflow

### 16.1 Branch Structure

```text
main
└── dev
    ├── feature/model-database
    ├── feature/customer-views
    ├── feature/admin-cart-order-views
    ├── feature/core-controllers
    └── feature/business-controllers
```

### 16.2 Branch Rules

- Do not push directly to `main`.
- Each member works on a feature branch.
- Merge feature branches into `dev`.
- Test `dev` before merging into `main`.
- Use pull requests.
- Write clear commit messages.
- Do not commit real `.env` files.

---

## 18. Environment Variables

### 18.1 Back-end `.env.example`

The back-end connects to **Supabase PostgreSQL** using the connection string copied from the Supabase dashboard.

```env
PORT=5000

# Use the Supabase PostgreSQL connection string from:
# Supabase Dashboard → Project Settings → Database → Connection string
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[DATABASE_PASSWORD]@[SUPABASE_HOST]:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection is recommended for Prisma migrations.
# Use the direct/session connection string from Supabase when running migrations.
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[DATABASE_PASSWORD]@[SUPABASE_HOST]:5432/postgres"

JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"

NODE_ENV="development"
```

### 18.2 Front-end `.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 18.3 Important Supabase Security Rules

- Do not commit the real `.env` file to GitHub.
- Do not expose the Supabase database password in React code.
- Only the Node.js back-end should connect directly to Supabase PostgreSQL.
- The React front-end must call the Express.js API, not the Supabase database directly.
- Use `.env.example` for documentation and keep real credentials private.
- Rotate the database password if it is accidentally pushed to GitHub.

---

## 19. Supabase Setup Checklist

### 19.1 Create Supabase Project

1. Go to the Supabase dashboard.
2. Create a new project.
3. Choose a project name such as `electronics-ecommerce`.
4. Save the database password securely.
5. Wait until the project is ready.

### 19.2 Get Database Connection String

1. Open the Supabase project dashboard.
2. Go to **Project Settings**.
3. Open **Database**.
4. Copy the PostgreSQL connection string.
5. Put it into the back-end `.env` file as `DATABASE_URL`.
6. If using Prisma, also configure `DIRECT_URL` for migrations.

### 19.3 Configure Prisma for Supabase PostgreSQL

In `backend/prisma/schema.prisma`, use this configuration:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### 19.4 Supabase Database Management

The team can manage data in Supabase using:

- Table Editor for viewing and editing rows
- SQL Editor for running SQL scripts
- Database settings for connection strings
- Logs for checking database errors

However, the main schema should still be managed through ORM migrations so that the project remains reproducible.

---

## 20. Recommended Commands

### 20.1 Front-end

```bash
cd frontend
npm install
npm run dev
```

### 20.2 Back-end

```bash
cd backend
npm install
npm run dev
```

### 20.3 Prisma Example with Supabase PostgreSQL

```bash
cd backend
npx prisma init
# Make sure DATABASE_URL and DIRECT_URL point to Supabase PostgreSQL
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio
```

After running migrations, the created tables should be visible in the Supabase Table Editor.

---

## 21. Minimum Viable Demo Flow

### 21.1 Customer Demo Flow

1. Open homepage
2. View product list
3. Search product
4. Filter by category
5. Open product detail
6. Register or login
7. Add product to cart
8. Update cart quantity
9. Checkout with COD
10. View order history
11. View order detail
12. Add product review

### 21.2 Admin Demo Flow

1. Login as admin
2. Open admin dashboard
3. Create new category
4. Create new product
5. Update product information
6. View customer orders
7. Update order status
8. View revenue report
9. View best-selling products

---

## 22. MVC Acceptance Criteria

### 20.1 Model Acceptance Criteria

- All main entities are defined as Models.
- Model relationships are correct.
- Models connect to Supabase PostgreSQL through ORM.
- Models support CRUD operations.
- Supabase seed data is available.

### 20.2 View Acceptance Criteria

- React views display data from APIs.
- Views are separated from Controllers.
- Views do not access database directly.
- Views show loading, success, and error states.
- Views are usable for both customer and admin.

### 20.3 Controller Acceptance Criteria

- Controllers receive HTTP requests.
- Controllers call Models to process data.
- Controllers return JSON responses.
- Controllers handle validation and errors.
- Admin controllers are protected by authorization middleware.
- Customer controllers are protected where needed.

---

## 23. Testing Plan

### 21.1 API Testing

Use Postman to test:

- Register
- Login
- Get product list
- Get product detail
- Create product as admin
- Add product to cart
- Create order
- Update order status
- Create review
- View report

### 21.2 View Testing

Manually check:

- Page navigation
- Login and logout
- Product search
- Product filtering
- Cart update
- Checkout
- Admin product management
- Admin order management

### 21.3 Model and Database Testing

Check:

- New user is saved
- Password is hashed
- New product is saved
- Cart items are saved
- Order and order details are saved
- Payment record is saved
- Review is saved
- Product stock changes after order

---

## 24. Risk Management

### Risk 1 — MVC Structure Becomes Unclear

#### Solution

Use strict folder names:

```text
views
controllers
models
routes
```

Do not rename them into service or repository as the main structure.

---

### Risk 2 — Front-end Waits for Back-end

#### Solution

React views can use mock data first, then replace mock data with real API calls later.

---

### Risk 3 — Database Changes Too Late

#### Solution

Finalize Models and database schema in Week 1.

---

### Risk 4 — Scope Is Too Large

#### Solution

Keep only COD payment, simple reports, and simple product reviews.

---

### Risk 5 — Integration Problems Near Deadline

#### Solution

Perform integration testing every week.

---

### Risk 6 — Supabase Credentials Are Exposed

#### Solution

Keep real Supabase connection strings only in the back-end `.env` file.
Never put the database password inside React code or commit it to GitHub.
Use `.env.example` for documentation only.

---

### Risk 7 — Prisma Migration Connection Issues

#### Solution

Use `DATABASE_URL` for normal application queries and `DIRECT_URL` for migrations.
If migrations fail, check the Supabase connection string, database password, project host, and network access.

---

## 25. Priority List

### Must Have

- MVC folder structure
- User model
- Product model
- Category model
- Cart model
- Order model
- Register and login
- Product list
- Product detail
- Cart
- Checkout
- Order history
- Admin product management
- Admin order management

### Should Have

- Product review
- Product search and filter
- Category management
- Basic revenue report

### Nice To Have

- Product image upload
- Pagination
- Responsive UI polish
- Dashboard charts
- Online payment simulation

### Not Needed

- Real online payment
- Email system
- Chatbot
- Recommendation system
- Mobile app

---

## 26. Final Submission Checklist

- [ ] React View layer runs successfully
- [ ] Express Controller layer runs successfully
- [ ] Supabase project is created
- [ ] Supabase PostgreSQL database connects successfully
- [ ] `DATABASE_URL` is configured in back-end `.env`
- [ ] `DIRECT_URL` is configured for Prisma migrations
- [ ] ORM Models are created
- [ ] Tables are visible in Supabase Table Editor
- [ ] MVC folder structure is clear
- [ ] Register works
- [ ] Login works
- [ ] Product list works
- [ ] Product detail works
- [ ] Add to cart works
- [ ] Checkout works
- [ ] Order history works
- [ ] Admin product management works
- [ ] Admin order management works
- [ ] Report page works
- [ ] Documentation includes MVC explanation
- [ ] ERD diagram is complete
- [ ] Presentation slides are ready
- [ ] Demo script is ready
- [ ] Each member understands their MVC responsibility

---

## 27. Suggested Presentation Division

### Member 1

- Project overview
- MVC architecture
- Model layer
- Database design
- ERD explanation

### Member 2

- Customer View layer
- Product browsing views
- Search and filter views

### Member 3

- Cart and checkout views
- Admin views
- Report view

### Member 4

- Core Controller layer
- Authentication controller
- Product controller
- Category controller

### Member 5

- Business Controller layer
- Cart controller
- Order controller
- Payment controller
- Report controller

---

## 28. Recommended Development Order

The team should build the system in this order:

1. Create MVC folder structure
2. Create Supabase project and configure Supabase PostgreSQL database
3. Define ORM Models
4. Create Supabase seed data
5. Build AuthController
6. Build UserController
7. Build ProductController
8. Build CategoryController
9. Build customer React views
10. Build CartController
11. Build cart React views
12. Build OrderController
13. Build checkout and order views
14. Build admin views
15. Build PaymentController
16. Build ReviewController
17. Build ReportController
18. Test full demo flow
19. Polish UI
20. Finalize documentation and presentation

---

## 29. Final Notes

This project should be presented as a **standard MVC web application**.

The simplest explanation is:

```text
Model:
Defines and manages data using ORM models and Supabase PostgreSQL.

View:
Displays the user interface using React.js pages and components.

Controller:
Handles requests using Express.js controllers and connects Views with Models.
```

The team should focus on building a simple, complete, and stable system.

A working MVC project with clear structure and a shared Supabase PostgreSQL database is better than a complex system with unclear architecture.
