# Storefront Content Manager Design

Status: Approved design
Date: 2026-07-07

## Goal

Allow admins to manage the customer-facing storefront navigation and homepage carousel from the admin console instead of editing hardcoded frontend values.

## Scope

In scope:
- Homepage carousel slide management.
- Customer storefront navigation management.
- Full current mega-menu shape for storefront nav: simple links, top-level mega menus, child links, and optional featured cards.
- Product, category, and custom URL link targets.
- Product/category selectors in admin forms so admins do not manually paste internal links.
- Immediate publish on save with `isActive` and `sortOrder`.

Out of scope:
- Admin sidebar navigation management.
- Full CMS/page-builder behavior.
- Draft, review, scheduling, or publish workflows.
- Image upload storage. Admins provide image URLs for this version.
- Product/category CRUD changes beyond reusing existing selectors.

## Current Context

The current storefront has the right UI boundaries but hardcoded or indirect content sources:
- `frontend/src/components/home/HomeHero.jsx` renders a carousel from the first products loaded by `HomeView`.
- `frontend/src/components/layout/StorefrontMegaNav.jsx` contains hardcoded `shopItems`, `brandItems`, and featured-card values.
- `frontend/src/layouts/MainLayout.jsx` mounts `StorefrontMegaNav` in the customer top nav.
- `frontend/src/layouts/AdminLayout.jsx` owns admin sidebar links and should only receive one new `Storefront` entry for this feature.
- Backend follows a focused Express route/controller/model pattern backed by Prisma.

The Astryx CLI command `npx astryx build "admin editable homepage carousel navigation menu manager"` was unavailable during discovery because npm could not determine an executable. Implementation should reuse existing Astryx components already present in this app and retry Astryx docs/CLI before introducing unfamiliar UI primitives.

## Architecture

Add a focused Storefront Content domain, not a general CMS.

Backend adds Prisma-backed content models:
- `CarouselSlide`
- `StorefrontNavItem`

Backend exposes public read endpoints:
- `GET /api/storefront/carousel`
- `GET /api/storefront/navigation`

Backend exposes admin CRUD endpoints:
- `GET /api/admin/storefront/carousel`
- `POST /api/admin/storefront/carousel`
- `PUT /api/admin/storefront/carousel/:id`
- `DELETE /api/admin/storefront/carousel/:id`
- `GET /api/admin/storefront/navigation`
- `POST /api/admin/storefront/navigation`
- `PUT /api/admin/storefront/navigation/:id`
- `DELETE /api/admin/storefront/navigation/:id`

Frontend adds:
- `frontend/src/api/storefrontContentApi.js` for public and admin content calls.
- `frontend/src/views/admin/AdminStorefrontView.jsx` with `Carousel` and `Navigation` tabs.
- Focused admin form/table components under `frontend/src/components/admin/storefront/`.
- A data-driven `StorefrontMegaNav` that accepts or loads nav config.
- A data-driven `HomeHero` that renders slide config.

## Link Target Contract

Carousel slides and nav items use the same link target shape:

```js
{
  type: 'product' | 'category' | 'customUrl',
  productId: 'product-id-or-null',
  categoryId: 'category-id-or-null',
  customUrl: '/internal-or-external-url-or-null'
}
```

Storefront link resolution:
- `product` resolves to `/products/:id`.
- `category` resolves to `/products?categoryId=:id`.
- `customUrl` resolves to the stored URL.

Admin forms:
- Show a product selector when `type` is `product`.
- Show a category selector when `type` is `category`.
- Show a URL field when `type` is `customUrl`.
- Reuse existing product/category APIs for selector choices.

## Data Model

`CarouselSlide` fields:
- `id`
- `title`
- `description`
- `imageUrl`
- `primaryButtonLabel`
- `linkType`
- `productId`
- `categoryId`
- `customUrl`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

`StorefrontNavItem` fields:
- `id`
- `parentId`
- `label`
- `description`
- `itemType`: `link` or `mega_menu`
- `icon`
- `linkType`
- `productId`
- `categoryId`
- `customUrl`
- `featuredTitle`
- `featuredDescription`
- `featuredImageUrl`
- `featuredLinkLabel`
- `featuredLinkType`
- `featuredProductId`
- `featuredCategoryId`
- `featuredCustomUrl`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

Top-level simple nav items use `itemType = link` and no `parentId`.
Top-level mega menus use `itemType = mega_menu` and no `parentId`.
Mega-menu children use `parentId` pointing to a top-level `mega_menu` item and use their own label, description, icon, link target, active flag, and sort order.

## Admin UI

Add one admin sidebar item: `Storefront`.

`AdminStorefrontView` shows two tabs:
- `Carousel`
- `Navigation`

Carousel tab:
- Table columns: order, active status, title, link target, updated date, actions.
- Actions: create, edit, activate/deactivate, delete, move up/down.
- Form fields: title, description, image URL, primary button label, link type, product/category selector or custom URL, active toggle, sort order.

Navigation tab:
- Table shows top-level nav items first, with child items grouped under their parent.
- Top-level simple-link fields: label, link target, active toggle, sort order.
- Top-level mega-menu fields: label, active toggle, sort order, optional featured title, featured description, featured image URL, featured link label, and featured link target.
- Child item fields: parent mega-menu, label, description, icon choice, link target, active toggle, sort order.
- Actions: create/edit top-level item, create/edit child item, activate/deactivate, delete, move up/down.

The admin UI should use existing Astryx patterns from `AdminProductView`, `CategoryForm`, `CategoryTable`, `AdminTable`, dialogs, toolbars, inputs, and menus. Keep files focused; split form utilities and table components instead of adding one large manager file.

## Storefront Behavior

Homepage:
- `HomeView` loads active carousel slides from `GET /api/storefront/carousel`.
- `HomeHero` renders configured slides instead of deriving slides from the first products.
- If there are no active slides, keep a safe empty state that sends users to the product catalog and admins to product or storefront management.

Navigation:
- `StorefrontMegaNav` loads active nav config from `GET /api/storefront/navigation`.
- It renders simple links as `TopNavItem`.
- It renders top-level mega menus as `TopNavMegaMenu` with sorted children and optional featured card.
- If public nav config loading fails, keep a local fallback so the layout still renders.

Publishing:
- Save operations publish immediately.
- `isActive = false` hides content without deleting it.
- `sortOrder` controls display order.

Broken target handling:
- Public endpoints should not return active items whose product/category targets no longer exist.
- Admin endpoints should still show those items so admins can repair or delete them.

## Validation

Backend validation:
- Active carousel slides require title, image URL, button label, and valid link target.
- Active simple nav items require label and valid link target.
- Active mega-menu child items require parent mega menu, label, and valid link target.
- Mega-menu featured cards may be omitted, but if a featured link label is present then the featured link target must also be valid.
- `product` targets must reference existing products.
- `category` targets must reference existing categories.
- `customUrl` targets must be non-empty and begin with `/`, `http://`, or `https://`.
- Child nav items can only point to a top-level `mega_menu` parent.
- A top-level item cannot have a parent.
- Deleting storefront content must not delete products or categories.

Frontend validation:
- Mirror required field checks before submit.
- Disable save while submitting.
- Show API errors inline in the form.
- Show retryable load errors in the manager view.

## Error Handling

Public storefront:
- Carousel API failure does not crash the homepage.
- Navigation API failure does not crash the layout.
- Missing image URLs in inactive rows are tolerated in admin, but active carousel rows require an image.

Admin:
- List load failures show retry actions.
- Form submit failures keep the dialog open.
- Delete confirmation uses the existing alert-dialog pattern.
- Reorder failures leave the current UI state intact and show feedback.

## Testing

Backend tests:
- Public carousel endpoint returns only active slides sorted by `sortOrder`.
- Public navigation endpoint returns only active top-level items and active children sorted by `sortOrder`.
- Public endpoints filter active items with broken product/category targets.
- Admin endpoints require admin auth.
- Admin create/update rejects missing labels, invalid link types, invalid product/category ids, invalid custom URLs, and invalid parent-child nav structure.
- Deleting carousel/nav rows does not delete products or categories.

Frontend structure tests:
- `HomeHero` consumes slide config rather than product slices.
- `StorefrontMegaNav` consumes API data and keeps a fallback when config is unavailable.
- `AdminStorefrontView` is registered under `AdminRoute` and `AdminLayout`.
- Carousel and nav forms expose product/category selectors for internal targets.
- Forms do not require manually pasted URLs for product/category links.

Manual smoke:
- Admin creates a carousel slide linked to a product and confirms the homepage CTA opens `/products/:id`.
- Admin creates a carousel slide linked to a category and confirms the homepage CTA opens `/products?categoryId=:id`.
- Admin creates a simple nav link and confirms it renders in the storefront nav.
- Admin creates a mega-menu child and confirms it renders under the configured top-level menu.
- Admin toggles an item inactive and confirms it disappears from the storefront without deletion.
- Admin reorders items and confirms the storefront order changes.

## Acceptance Criteria

- Storefront carousel content is admin editable and no longer hardcoded to the first product list.
- Storefront navigation content is admin editable and no longer hardcoded in `StorefrontMegaNav.jsx`.
- Admins can choose product/category link targets from lists instead of manually copying internal links.
- Custom URL links remain available for external or special internal links.
- Save publishes immediately, while `isActive` and `sortOrder` control visibility and ordering.
- The admin sidebar itself remains code-owned except for adding the `Storefront` entry.
- Product/category records are never deleted or modified by storefront content deletion.
