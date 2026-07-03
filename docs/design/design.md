# design.md — Electronics E-Commerce Website UI Design

## 1. Design Goal

This document defines the **UI design only** for the Electronics E-Commerce Website.

It focuses on:

- Page structure
- Layouts
- UI components
- Astryx component mapping
- Form design
- Table design
- Dialog design
- Empty/loading/error states
- Responsive behavior
- UI implementation priority

This file does **not** describe backend architecture, database design, API implementation, MVC implementation, Supabase setup, or project timeline.

---

## 2. Design System

### 2.1 Main Design Reference

Use Astryx Design System as the main UI reference.

```text
https://astryx.atmeta.com/
```

Astryx should be used for:

- Layout
- Navigation
- Cards
- Forms
- Tables
- Dialogs
- Buttons
- Badges
- Empty states
- Loading states
- Admin dashboard patterns
- Checkout pattern
- Product detail pattern

---

## 3. Visual Direction

### 3.1 Style

The UI should feel:

- Clean
- Modern
- Simple
- Easy to understand
- Suitable for an electronics store
- Suitable for a university project demo

### 3.2 Design Personality

The interface should look like a small modern e-commerce website, not a large enterprise platform.

Recommended style:

```text
Minimal layout
Clear product cards
Simple admin dashboard
Readable tables
Clean checkout form
Consistent buttons and badges
```

### 3.3 Color Usage

Use semantic colors instead of random colors.

| Purpose | Usage |
|---|---|
| Primary | Main actions such as Add to cart, Checkout, Save |
| Secondary | Cancel, Back, View details |
| Success | Order completed, payment paid, product created |
| Warning | Low stock, pending order |
| Danger | Delete, cancel order, failed payment |
| Neutral | Borders, background, table rows |

### 3.4 Typography

Use clear text hierarchy.

| Text Type | Usage |
|---|---|
| Display heading | Homepage hero title |
| Page title | Product List, Cart, Checkout, Admin Products |
| Section title | Featured Products, Order Summary |
| Body text | Product description, form helper text |
| Small text | Metadata, timestamps, helper messages |

---

## 4. Page Inventory

### 4.1 Customer Pages

| Page | Purpose |
|---|---|
| Home Page | Introduce store and show featured products |
| Product List Page | Browse, search, filter, and sort products |
| Product Detail Page | Show full product information and reviews |
| Login Page | User login |
| Register Page | User registration |
| Cart Page | Review selected products |
| Checkout Page | Enter shipping information and place order |
| Order History Page | View all customer orders |
| Order Detail Page | View one order in detail |
| Profile Page | View and update user profile |

### 4.2 Admin Pages

| Page | Purpose |
|---|---|
| Admin Dashboard Page | Show business overview |
| Admin Products Page | Create, edit, delete, and search products |
| Admin Categories Page | Create, edit, delete categories |
| Admin Users Page | View users |
| Admin Orders Page | View and update order status |
| Admin Reviews Page | View, hide, or delete reviews |
| Admin Reports Page | View revenue and best-selling products |

### 4.3 Utility Pages

| Page | Purpose |
|---|---|
| Not Found Page | Show when route does not exist |
| Unauthorized Page | Show when user has no permission |
| Error Page | Show when application fails unexpectedly |

---

## 5. Main Layouts

## 5.1 CustomerLayout

### Purpose

Used for normal customer-facing pages.

### Used By

- Home Page
- Product List Page
- Product Detail Page
- Cart Page
- Checkout Page
- Order History Page
- Order Detail Page
- Profile Page

### Required Sections

```text
CustomerHeader
MainContent
Footer
```

### Astryx References

- App Shell
- Top Nav
- Layout
- Card
- Link
- Icon Button
- Badge

---

## 5.2 AdminLayout

### Purpose

Used for admin management pages.

### Used By

- Admin Dashboard Page
- Admin Products Page
- Admin Categories Page
- Admin Users Page
- Admin Orders Page
- Admin Reviews Page
- Admin Reports Page

### Required Sections

```text
AdminSidebar
AdminTopBar
PageHeader
MainContent
```

### Astryx References

- App Shell
- Side Nav
- Top Nav
- Breadcrumbs
- Toolbar
- Card
- Table

---

## 5.3 AuthLayout

### Purpose

Used for authentication pages.

### Used By

- Login Page
- Register Page

### Required Sections

```text
CenteredAuthContainer
AuthCard
AuthFooterLink
```

### Astryx References

- Login Card template
- Card
- Form
- Text Input
- Button
- Link

---

# 6. Navigation Components

## 6.1 CustomerHeader

### Purpose

Main navigation for customer pages.

### Elements

- Logo
- Home link
- Products link
- Search shortcut
- Cart icon with item count badge
- Login/Register buttons
- User dropdown after login

### Astryx References

- Top Nav
- Link
- Icon Button
- Badge
- Dropdown Menu
- Avatar

---

## 6.2 AdminSidebar

### Purpose

Sidebar navigation for admin pages.

### Menu Items

```text
Dashboard
Products
Categories
Users
Orders
Reviews
Reports
```

### Astryx References

- Side Nav
- Side Nav Item
- Side Nav Section
- Icon Button

---

## 6.3 UserMenu

### Purpose

Dropdown menu for logged-in users.

### Menu Items

```text
Profile
My Orders
Admin Dashboard
Logout
```

### Notes

- Show Admin Dashboard only for admin users.
- Show My Orders only for authenticated customers.

### Astryx References

- Avatar
- Dropdown Menu
- Dropdown Menu Item
- Badge

---

## 6.4 BreadcrumbNav

### Purpose

Show current page location.

### Used By

- Product Detail Page
- Order Detail Page
- Admin detail pages

### Astryx References

- Breadcrumbs
- Link

---

# 7. Customer Product Components

## 7.1 ProductCard

### Purpose

Display a product in a grid.

### Content

- Product image
- Product name
- Brand
- Price
- Category badge
- Stock status badge
- View details action
- Add to cart action

### Astryx References

- Card
- Clickable Card
- Badge
- Button
- Image
- Text

---

## 7.2 ProductGrid

### Purpose

Display multiple product cards.

### States

- Loading
- Success
- Empty
- Error

### Astryx References

- Grid
- Card
- Skeleton
- Empty State
- Pagination

---

## 7.3 FeaturedProductSection

### Purpose

Show highlighted products on the homepage.

### Content

- Section title
- Short description
- Product cards
- View all products button

### Astryx References

- Section
- Card Grid
- Button

---

## 7.4 ProductImageGallery

### Purpose

Show product images on product detail page.

### Content

- Main image
- Thumbnail list
- Fallback image

### Astryx References

- Carousel
- Image
- Card

---

## 7.5 ProductInfoPanel

### Purpose

Show important product information.

### Content

- Product name
- Brand
- Price
- Category
- Stock quantity
- Description
- Quantity selector
- Add to cart button

### Astryx References

- Card
- Badge
- Button
- Number Input
- Divider

---

## 7.6 ProductReviewList

### Purpose

Show customer reviews for a product.

### Content

- Customer name
- Rating
- Comment
- Review date

### Astryx References

- List
- List Item
- Avatar
- Badge
- Timestamp
- Empty State

---

## 7.7 ProductReviewForm

### Purpose

Allow customer to submit a product review.

### Fields

```text
rating
comment
```

### Astryx References

- Form
- Field
- Selector
- Text Area
- Button
- Toast

---

# 8. Search, Filter, and Sort Components

## 8.1 ProductSearchBar

### Purpose

Search products by keyword.

### Elements

- Search input
- Search button
- Clear button

### Astryx References

- Text Input
- Icon Button
- Power Search

---

## 8.2 ProductFilterPanel

### Purpose

Filter product list.

### Filters

```text
Category
Brand
Minimum price
Maximum price
Stock status
```

### Astryx References

- Collapsible
- Checkbox
- Selector
- Slider
- Button
- Divider

---

## 8.3 ProductSortSelector

### Purpose

Sort products.

### Options

```text
Newest
Price: Low to High
Price: High to Low
Name: A to Z
Best Selling
```

### Astryx References

- Selector
- Dropdown Menu

---

## 8.4 ActiveFilterChips

### Purpose

Show currently active filters.

### Elements

- Filter chip
- Remove filter button
- Clear all button

### Astryx References

- Badge
- Button
- Icon Button

---

# 9. Authentication Components

## 9.1 LoginForm

### Purpose

Allow user to log in.

### Fields

```text
email
password
```

### Actions

```text
Login
Go to Register
```

### States

- Default
- Loading
- Validation error
- Login error

### Astryx References

- Login Card template
- Card
- Form
- Text Input
- Button
- Banner

---

## 9.2 RegisterForm

### Purpose

Allow user to create account.

### Fields

```text
username
email
password
confirmPassword
fullName
phone
address
```

### Actions

```text
Register
Go to Login
```

### Astryx References

- Card
- Form
- Text Input
- Text Area
- Button
- Banner

---

# 10. Cart Components

## 10.1 CartItemCard

### Purpose

Display one cart item.

### Content

- Product image
- Product name
- Unit price
- Quantity input
- Subtotal
- Remove button

### Astryx References

- Card
- Image
- Number Input
- Icon Button
- Divider

---

## 10.2 CartItemList

### Purpose

Display all items in the cart.

### States

- Loading
- Success
- Empty
- Error

### Astryx References

- List
- Skeleton
- Empty State

---

## 10.3 CartSummaryCard

### Purpose

Show cart total before checkout.

### Content

```text
Subtotal
Shipping fee
Discount
Total
Checkout button
```

### Astryx References

- Card
- Metadata List
- Divider
- Button

---

## 10.4 EmptyCartState

### Purpose

Show when the cart has no items.

### Message

```text
Your cart is empty.
Browse products to add items to your cart.
```

### Astryx References

- Empty State
- Button

---

# 11. Checkout Components

## 11.1 CheckoutForm

### Purpose

Collect order and shipping information.

### Fields

```text
fullName
phone
shippingAddress
note
paymentMethod
```

### Payment Method

Only COD is required.

```text
COD — Cash on Delivery
```

### Astryx References

- Checkout Form template
- Form
- Text Input
- Text Area
- Radio List
- Button
- Banner

---

## 11.2 CheckoutOrderSummary

### Purpose

Show order summary before placing order.

### Content

- Product list
- Quantity
- Unit price
- Subtotal
- Total amount
- Payment method

### Astryx References

- Card
- List
- Metadata List
- Divider
- Badge

---

## 11.3 CheckoutSuccessDialog

### Purpose

Show after order is placed successfully.

### Content

- Success message
- Order ID
- View order button
- Continue shopping button

### Astryx References

- Dialog
- Button
- Badge

---

# 12. Order Components

## 12.1 OrderHistoryTable

### Purpose

Show all orders of the current customer.

### Columns

```text
Order ID
Date
Total Amount
Order Status
Payment Status
Actions
```

### Astryx References

- Table
- Badge
- Pagination
- Empty State

---

## 12.2 OrderDetailPanel

### Purpose

Show detailed information for one order.

### Sections

```text
Order information
Shipping address
Payment information
Order items
Order status
```

### Astryx References

- Order Detail template
- Card
- Metadata List
- Table
- Badge
- Divider

---

## 12.3 OrderStatusBadge

### Purpose

Show order status.

### Values

```text
pending
confirmed
shipping
completed
cancelled
```

### Astryx References

- Badge
- Status Dot

---

## 12.4 PaymentStatusBadge

### Purpose

Show payment status.

### Values

```text
unpaid
paid
failed
```

### Astryx References

- Badge
- Status Dot

---

# 13. Admin Dashboard Components

## 13.1 DashboardMetricCard

### Purpose

Show one important metric.

### Metrics

```text
Total revenue
Total orders
Total products
Total users
Low stock products
```

### Astryx References

- Card
- Badge
- Text
- Heading

---

## 13.2 DashboardMetricGrid

### Purpose

Display multiple metric cards.

### Astryx References

- Grid
- Card

---

## 13.3 RecentOrdersList

### Purpose

Show latest orders.

### Content

- Order ID
- Customer name
- Total amount
- Status
- Created date

### Astryx References

- List
- Badge
- Timestamp
- Link

---

## 13.4 LowStockAlertCard

### Purpose

Show products with low stock.

### Content

- Product name
- Current quantity
- Quick action to edit product

### Astryx References

- Card
- Banner
- List
- Badge
- Button

---

## 13.5 AdminQuickActions

### Purpose

Provide fast admin actions.

### Actions

```text
Add product
Add category
View orders
View reports
```

### Astryx References

- Button Group
- Button
- Icon Button

---

# 14. Admin Product Components

## 14.1 AdminProductTable

### Purpose

Manage products.

### Columns

```text
Image
Name
Brand
Category
Price
Quantity
Stock Status
Actions
```

### Row Actions

```text
View
Edit
Delete
```

### Astryx References

- Searchable Table template
- Table
- Thumbnail
- Badge
- More Menu
- Pagination
- Toolbar

---

## 14.2 ProductFormDialog

### Purpose

Create or edit product.

### Fields

```text
name
brand
description
price
quantity
imageUrl
category
```

### Astryx References

- Dialog
- Form
- Text Input
- Number Input
- Text Area
- Selector
- Button

---

## 14.3 ProductDeleteDialog

### Purpose

Confirm product deletion.

### Content

- Warning message
- Cancel button
- Delete button

### Astryx References

- Alert Dialog
- Button

---

## 14.4 ProductStockBadge

### Purpose

Show stock condition.

### Rules

```text
quantity = 0       -> Out of stock
quantity <= 5      -> Low stock
quantity > 5       -> In stock
```

### Astryx References

- Badge
- Status Dot

---

# 15. Admin Category Components

## 15.1 AdminCategoryTable

### Purpose

Manage categories.

### Columns

```text
Category ID
Name
Description
Product Count
Created At
Actions
```

### Astryx References

- Table
- More Menu
- Empty State

---

## 15.2 CategoryFormDialog

### Purpose

Create or edit category.

### Fields

```text
name
description
```

### Astryx References

- Dialog
- Form
- Text Input
- Text Area
- Button

---

## 15.3 CategoryDeleteDialog

### Purpose

Confirm category deletion.

### Astryx References

- Alert Dialog
- Button

---

# 16. Admin User Components

## 16.1 AdminUserTable

### Purpose

View users.

### Columns

```text
User
Email
Phone
Role
Created At
Actions
```

### Astryx References

- Table
- Avatar
- Badge
- More Menu
- Pagination

---

## 16.2 UserRoleBadge

### Purpose

Show user role.

### Values

```text
customer
admin
```

### Astryx References

- Badge

---

## 16.3 UserDetailDialog

### Purpose

Show user details.

### Content

```text
Full name
Email
Phone
Address
Role
Created at
```

### Astryx References

- Dialog
- Metadata List
- Avatar
- Badge

---

# 17. Admin Order Components

## 17.1 AdminOrderTable

### Purpose

Manage customer orders.

### Columns

```text
Order ID
Customer
Date
Total Amount
Order Status
Payment Status
Actions
```

### Astryx References

- Grouped Table template
- Searchable Table template
- Table
- Badge
- Selector
- More Menu
- Pagination

---

## 17.2 OrderStatusSelector

### Purpose

Update order status.

### Options

```text
pending
confirmed
shipping
completed
cancelled
```

### Astryx References

- Selector

---

## 17.3 AdminOrderDetailDialog

### Purpose

Show order details in admin area.

### Sections

```text
Customer information
Shipping address
Payment information
Order items
Order status
```

### Astryx References

- Dialog
- Order Detail template
- Metadata List
- Table
- Badge

---

# 18. Admin Review Components

## 18.1 AdminReviewTable

### Purpose

Manage product reviews.

### Columns

```text
Product
Customer
Rating
Comment
Status
Created At
Actions
```

### Astryx References

- Table
- Badge
- More Menu
- Timestamp

---

## 18.2 ReviewStatusBadge

### Purpose

Show review visibility.

### Values

```text
visible
hidden
```

### Astryx References

- Badge
- Status Dot

---

## 18.3 ReviewActionMenu

### Purpose

Review moderation actions.

### Actions

```text
Hide review
Show review
Delete review
```

### Astryx References

- More Menu
- Dropdown Menu

---

# 19. Report Components

## 19.1 RevenueSummaryCard

### Purpose

Show revenue summary.

### Content

```text
Total revenue
Monthly revenue
Completed orders
Average order value
```

### Astryx References

- Card
- Badge
- Heading
- Text

---

## 19.2 BestSellingProductsTable

### Purpose

Show best-selling products.

### Columns

```text
Product
Category
Sold Quantity
Revenue
```

### Astryx References

- Table
- Thumbnail
- Badge

---

## 19.3 OrderSummaryCards

### Purpose

Show order count by status.

### Metrics

```text
Pending orders
Confirmed orders
Shipping orders
Completed orders
Cancelled orders
```

### Astryx References

- Grid
- Card
- Badge
- Status Dot

---

# 20. Common Form Components

## 20.1 AppTextField

### Purpose

Reusable text input.

### Astryx References

- Field
- Text Input
- Field Status

---

## 20.2 AppPasswordField

### Purpose

Reusable password input.

### Astryx References

- Field
- Text Input
- Icon Button

---

## 20.3 AppTextArea

### Purpose

Reusable textarea.

### Astryx References

- Field
- Text Area
- Field Status

---

## 20.4 AppNumberField

### Purpose

Reusable number input.

### Astryx References

- Field
- Number Input
- Field Status

---

## 20.5 AppSelectField

### Purpose

Reusable select input.

### Astryx References

- Field
- Selector
- Field Status

---

## 20.6 AppRadioGroup

### Purpose

Reusable radio list.

### Astryx References

- Radio List
- Radio List Item
- Field

---

## 20.7 AppFormActions

### Purpose

Reusable form action area.

### Buttons

```text
Cancel
Save
Submit
Reset
```

### Astryx References

- Button Group
- Button

---

# 21. Common Feedback Components

## 21.1 AppToast

### Purpose

Show short success or error messages.

### Usage

```text
Login success
Product created
Cart updated
Order placed
Error message
```

### Astryx References

- Toast

---

## 21.2 AppBanner

### Purpose

Show page-level messages.

### Usage

```text
API error
Validation warning
Permission denied
Low stock warning
```

### Astryx References

- Banner

---

## 21.3 LoadingSpinner

### Purpose

Show small loading state.

### Astryx References

- Spinner

---

## 21.4 LoadingSkeleton

### Purpose

Show loading placeholder.

### Used By

```text
ProductGrid
ProductDetail Page
Admin tables
Dashboard cards
```

### Astryx References

- Skeleton

---

## 21.5 EmptyState

### Purpose

Show when no data exists.

### Used When

```text
No products found
Cart is empty
No orders yet
No reviews yet
No report data
```

### Astryx References

- Empty State

---

## 21.6 ConfirmDialog

### Purpose

Confirm risky actions.

### Used For

```text
Delete product
Delete category
Delete review
Cancel order
Logout
```

### Astryx References

- Alert Dialog
- Button

---

# 22. Common Utility Components

## 22.1 PageHeader

### Purpose

Show page title and page actions.

### Content

- Title
- Description
- Breadcrumbs
- Action buttons

### Astryx References

- Heading
- Text
- Button Group
- Breadcrumbs

---

## 22.2 DataToolbar

### Purpose

Toolbar above admin tables.

### Content

- Search
- Filter
- Sort
- Add button

### Astryx References

- Toolbar
- Power Search
- Button
- Selector

---

## 22.3 PaginationBar

### Purpose

Navigate paginated data.

### Astryx References

- Pagination

---

## 22.4 PriceText

### Purpose

Format money values.

### Example

```text
12,500,000 VND
```

---

## 22.5 DateText

### Purpose

Format dates.

### Example

```text
03/07/2026
```

### Astryx References

- Timestamp

---

## 22.6 RatingDisplay

### Purpose

Display product rating.

### Used By

- Product Review List
- Product Detail Page
- Product Card

---

# 23. Status Components

## 23.1 Stock Status

| Value | Meaning |
|---|---|
| In stock | Product quantity is greater than 5 |
| Low stock | Product quantity is between 1 and 5 |
| Out of stock | Product quantity is 0 |

---

## 23.2 Order Status

| Value | Meaning |
|---|---|
| pending | Order created but not confirmed |
| confirmed | Admin confirmed order |
| shipping | Order is being delivered |
| completed | Order completed |
| cancelled | Order cancelled |

---

## 23.3 Payment Status

| Value | Meaning |
|---|---|
| unpaid | Not paid yet |
| paid | Payment completed |
| failed | Payment failed |

---

## 23.4 Review Status

| Value | Meaning |
|---|---|
| visible | Review is visible |
| hidden | Review is hidden by admin |

---

# 24. Page-to-Component Map

## 24.1 Home Page

Required components:

```text
CustomerLayout
CustomerHeader
HeroSection
FeaturedProductSection
ProductCard
Footer
```

---

## 24.2 Product List Page

Required components:

```text
CustomerLayout
PageHeader
ProductSearchBar
ProductFilterPanel
ProductSortSelector
ActiveFilterChips
ProductGrid
ProductCard
PaginationBar
EmptyState
LoadingSkeleton
```

---

## 24.3 Product Detail Page

Required components:

```text
CustomerLayout
BreadcrumbNav
ProductImageGallery
ProductInfoPanel
ProductReviewList
ProductReviewForm
RelatedProductsSection
AppToast
```

---

## 24.4 Login Page

Required components:

```text
AuthLayout
LoginForm
AppBanner
LoadingSpinner
```

---

## 24.5 Register Page

Required components:

```text
AuthLayout
RegisterForm
AppBanner
LoadingSpinner
```

---

## 24.6 Cart Page

Required components:

```text
CustomerLayout
PageHeader
CartItemList
CartItemCard
CartSummaryCard
EmptyCartState
ConfirmDialog
AppToast
```

---

## 24.7 Checkout Page

Required components:

```text
CustomerLayout
PageHeader
CheckoutForm
CheckoutOrderSummary
CheckoutSuccessDialog
AppBanner
LoadingSpinner
```

---

## 24.8 Order History Page

Required components:

```text
CustomerLayout
PageHeader
OrderHistoryTable
OrderStatusBadge
PaymentStatusBadge
PaginationBar
EmptyState
```

---

## 24.9 Order Detail Page

Required components:

```text
CustomerLayout
BreadcrumbNav
OrderDetailPanel
OrderStatusBadge
PaymentStatusBadge
```

---

## 24.10 Profile Page

Required components:

```text
CustomerLayout
PageHeader
ProfileForm
AppToast
AppBanner
```

---

## 24.11 Admin Dashboard Page

Required components:

```text
AdminLayout
PageHeader
DashboardMetricGrid
DashboardMetricCard
RecentOrdersList
LowStockAlertCard
AdminQuickActions
```

---

## 24.12 Admin Products Page

Required components:

```text
AdminLayout
PageHeader
DataToolbar
AdminProductTable
ProductFormDialog
ProductDeleteDialog
ProductStockBadge
PaginationBar
AppToast
```

---

## 24.13 Admin Categories Page

Required components:

```text
AdminLayout
PageHeader
DataToolbar
AdminCategoryTable
CategoryFormDialog
CategoryDeleteDialog
AppToast
```

---

## 24.14 Admin Users Page

Required components:

```text
AdminLayout
PageHeader
DataToolbar
AdminUserTable
UserRoleBadge
UserDetailDialog
PaginationBar
```

---

## 24.15 Admin Orders Page

Required components:

```text
AdminLayout
PageHeader
DataToolbar
AdminOrderTable
OrderStatusSelector
AdminOrderDetailDialog
OrderStatusBadge
PaymentStatusBadge
AppToast
```

---

## 24.16 Admin Reviews Page

Required components:

```text
AdminLayout
PageHeader
DataToolbar
AdminReviewTable
ReviewStatusBadge
ReviewActionMenu
ConfirmDialog
AppToast
```

---

## 24.17 Admin Reports Page

Required components:

```text
AdminLayout
PageHeader
RevenueSummaryCard
BestSellingProductsTable
OrderSummaryCards
```

---

# 25. UI States

Every important page should handle these states:

```text
Initial
Loading
Success
Empty
Validation Error
API Error
Permission Denied
```

---

## 25.1 Product List Page States

| State | UI |
|---|---|
| Loading | Show ProductGrid skeleton |
| Success | Show product cards |
| Empty | Show No products found |
| Error | Show error banner and retry button |

---

## 25.2 Cart Page States

| State | UI |
|---|---|
| Loading | Show cart skeleton |
| Success | Show cart items and summary |
| Empty | Show EmptyCartState |
| Error | Show error banner |

---

## 25.3 Checkout Page States

| State | UI |
|---|---|
| Default | Show checkout form |
| Submitting | Disable submit button and show spinner |
| Validation Error | Show field errors |
| Success | Show CheckoutSuccessDialog |
| Error | Show error banner or toast |

---

## 25.4 Admin Table States

| State | UI |
|---|---|
| Loading | Show table skeleton |
| Success | Show data table |
| Empty | Show EmptyState |
| Error | Show error banner |
| Deleting | Disable row actions |

---

# 26. Responsive Design

## 26.1 Desktop

- Show full customer header.
- Product grid should use 3 or 4 columns.
- Filters may appear as a left sidebar.
- Admin sidebar should be visible.
- Tables should use full width.

---

## 26.2 Tablet

- Product grid should use 2 columns.
- Admin sidebar may collapse.
- Tables can scroll horizontally.
- Checkout form and order summary can be side by side if space allows.

---

## 26.3 Mobile

- Product grid should use 1 column.
- Header should collapse into mobile navigation.
- Product filters should open as a drawer or collapsible panel.
- Checkout order summary should appear below the form.
- Admin tables should scroll horizontally.
- Buttons should be large enough to tap.

---

# 27. Accessibility Checklist

- Buttons must have clear labels.
- Icon-only buttons must have accessible labels.
- Form fields must have labels.
- Error messages must be close to related fields.
- Dialogs must be keyboard accessible.
- Text contrast must be readable.
- Focus states must be visible.
- Tables should have meaningful column headers.
- Loading states should not block the whole page unnecessarily.
- Empty states should explain what the user can do next.

---

# 28. Component Priority

## 28.1 Priority 1 — Required for Main Demo

```text
CustomerLayout
AdminLayout
AuthLayout
CustomerHeader
AdminSidebar
PageHeader
LoginForm
RegisterForm
ProductCard
ProductGrid
ProductSearchBar
ProductFilterPanel
CartItemCard
CartSummaryCard
CheckoutForm
CheckoutOrderSummary
OrderHistoryTable
AdminProductTable
ProductFormDialog
AdminOrderTable
OrderStatusBadge
PaymentStatusBadge
AppToast
LoadingSkeleton
EmptyState
ConfirmDialog
```

---

## 28.2 Priority 2 — Required for Complete UI

```text
ProductImageGallery
ProductInfoPanel
ProductReviewList
ProductReviewForm
CheckoutSuccessDialog
OrderDetailPanel
DashboardMetricCard
DashboardMetricGrid
RecentOrdersList
LowStockAlertCard
AdminCategoryTable
CategoryFormDialog
AdminUserTable
AdminReviewTable
RevenueSummaryCard
BestSellingProductsTable
OrderSummaryCards
```

---

## 28.3 Priority 3 — Nice to Have

```text
MobileNavigation
BreadcrumbNav
ProductSortSelector
ActiveFilterChips
UserDetailDialog
AdminOrderDetailDialog
ReviewActionMenu
DateText
PriceText
RatingDisplay
PaginationBar
DataToolbar
```

---

# 29. Astryx Component Mapping Summary

| Project UI Need | Astryx Reference |
|---|---|
| Main app layout | App Shell, Layout |
| Customer navigation | Top Nav |
| Admin navigation | Side Nav |
| Product cards | Card, Clickable Card |
| Product carousel | Carousel |
| Forms | Field, Text Input, Text Area, Number Input, Selector |
| Login page | Login Card template |
| Checkout page | Checkout Form template |
| Product detail | Product Detail template |
| Order detail | Order Detail template |
| Admin tables | Searchable Table template |
| Grouped orders | Grouped Table template |
| Buttons | Button, Button Group, Icon Button |
| Menus | Dropdown Menu, More Menu |
| Status labels | Badge, Status Dot |
| Page messages | Banner, Toast |
| Confirm actions | Alert Dialog |
| Loading state | Skeleton, Spinner |
| No data state | Empty State |
| Dashboard metrics | Card, Grid |
| Toolbar | Toolbar, Power Search |

---

# 30. Final UI Checklist

## 30.1 Customer UI

- [ ] Homepage completed
- [ ] Product list page completed
- [ ] Product detail page completed
- [ ] Login page completed
- [ ] Register page completed
- [ ] Cart page completed
- [ ] Checkout page completed
- [ ] Order history page completed
- [ ] Order detail page completed
- [ ] Profile page completed

---

## 30.2 Admin UI

- [ ] Admin dashboard completed
- [ ] Product management page completed
- [ ] Category management page completed
- [ ] User management page completed
- [ ] Order management page completed
- [ ] Review management page completed
- [ ] Report page completed

---

## 30.3 Component Quality

- [ ] Components are reusable
- [ ] Component names are clear
- [ ] Forms have validation messages
- [ ] Tables have loading and empty states
- [ ] Delete actions use confirmation dialogs
- [ ] Success actions show toast messages
- [ ] Error states are visible
- [ ] Customer pages use card/grid patterns
- [ ] Admin pages use table/dashboard patterns
- [ ] Mobile layout is usable

---

## 31. Final Design Note

The UI should be simple and consistent.

The most important demo flow is:

```text
Customer:
Browse products → View product detail → Add to cart → Checkout → View order

Admin:
Manage products → Manage orders → View reports
```

Focus on making these flows clear, stable, and visually polished.
