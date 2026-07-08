# Storefront Content Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin-editable storefront carousel slides and customer storefront navigation with product/category/custom link targets.

**Architecture:** Add a focused Prisma-backed Storefront Content domain with public read endpoints and protected admin CRUD endpoints. The customer homepage and top navigation consume public active config, while a new admin Storefront page manages carousel and navigation records using existing Astryx admin patterns.

**Tech Stack:** Express 5, Prisma 6, PostgreSQL, React 19, Vite, React Router, Astryx Design System, Node `node:test`.

---

## Source Documents

- Approved spec: `docs/superpowers/specs/2026-07-07-storefront-content-manager-design.md`
- Project rules: `AGENTS.md`
- Current backend route pattern: `backend/src/routes/index.js`
- Current admin CRUD pattern: `frontend/src/views/admin/AdminProductView.jsx`
- Current storefront hardcoded nav: `frontend/src/components/layout/StorefrontMegaNav.jsx`
- Current homepage carousel: `frontend/src/components/home/HomeHero.jsx`

Before editing, run:

```powershell
git status --short
```

Current planning discovery saw unrelated local changes in `.gitignore`, `frontend/src/components/home/HomeHero.jsx`, `frontend/src/components/home/HomeSkeleton.jsx`, and `scratch/`. Do not overwrite unrelated user work. Read current files before patching them.

## File Structure

### Backend

- Modify: `backend/prisma/schema.prisma`
  - Add `StorefrontLinkType`, `StorefrontNavItemType`, `CarouselSlide`, and `StorefrontNavItem`.
  - Add relation arrays to `Product` and `Category` for storefront link targets.
- Create: `backend/src/models/storefrontContent.model.js`
  - Own validation, normalization, Prisma queries, public filtering, and DTO mapping.
- Create: `backend/src/models/storefrontContent.model.test.js`
  - Mock Prisma and verify model behavior.
- Create: `backend/src/controllers/storefrontContent.controller.js`
  - Translate model calls to shared `successResponse` / `errorResponse`.
- Create: `backend/src/controllers/storefrontContent.controller.test.js`
  - Verify controller response shapes, validation forwarding, route protection, and mounts.
- Create: `backend/src/routes/storefrontContent.routes.js`
  - Export public and admin routers.
- Modify: `backend/src/routes/index.js`
  - Mount `/storefront` and `/admin/storefront`.

### Frontend

- Create: `frontend/src/api/storefrontContentApi.js`
  - Centralized public/admin endpoint helpers.
- Create: `frontend/src/api/storefrontContentApi.test.js`
  - Structure test for endpoint paths and `apiClient` reuse.
- Create: `frontend/src/components/storefront/storefrontLinkUtils.js`
  - Resolve and describe product/category/custom targets.
- Create: `frontend/src/components/storefront/storefrontLinkUtils.test.js`
  - Unit test link resolution.
- Modify: `frontend/src/views/HomeView.jsx`
  - Load carousel slides from storefront content API.
- Modify: `frontend/src/components/home/HomeHero.jsx`
  - Render slide config, not first product slices.
- Create: `frontend/src/components/home/HomeHero.structure.test.js`
  - Structure test for slide config contract.
- Modify: `frontend/src/components/layout/StorefrontMegaNav.jsx`
  - Load public nav config and render fallback when unavailable.
- Create: `frontend/src/components/layout/StorefrontMegaNav.structure.test.js`
  - Structure test for API-driven nav and fallback.
- Create: `frontend/src/components/admin/storefront/storefrontFormUtils.js`
  - Shared link-target form values, payload normalization, and validation helpers.
- Create: `frontend/src/components/admin/storefront/storefrontFormUtils.test.js`
  - Unit tests for admin form validation.
- Create: `frontend/src/components/admin/storefront/LinkTargetFields.jsx`
  - Shared product/category/custom target selector fields.
- Create: `frontend/src/components/admin/storefront/CarouselSlideForm.jsx`
- Create: `frontend/src/components/admin/storefront/CarouselSlideTable.jsx`
- Create: `frontend/src/components/admin/storefront/NavigationItemForm.jsx`
- Create: `frontend/src/components/admin/storefront/NavigationItemTable.jsx`
- Create: `frontend/src/views/admin/AdminStorefrontView.jsx`
- Create: `frontend/src/views/admin/AdminStorefrontView.structure.test.js`
- Modify: `frontend/src/layouts/AdminLayout.jsx`
  - Add `Storefront` side-nav item.
- Modify: `frontend/src/routes/AppRoutes.jsx`
  - Add `/admin/storefront` route under `AdminRoute` and `AdminLayout`.

---

### Task 1: Backend Storefront Content Schema And Model

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/models/storefrontContent.model.js`
- Create: `backend/src/models/storefrontContent.model.test.js`

- [ ] **Step 1: Write the failing model test**

Create `backend/src/models/storefrontContent.model.test.js`:

```js
const assert = require('node:assert/strict');
const { after, beforeEach, test } = require('node:test');

const databasePath = require.resolve('../config/database');
const originalDatabaseModule = require.cache[databasePath];

const prisma = {
  carouselSlide: {
    findMany: async () => {
      throw new Error('Unexpected carouselSlide.findMany call');
    },
    create: async () => {
      throw new Error('Unexpected carouselSlide.create call');
    },
    update: async () => {
      throw new Error('Unexpected carouselSlide.update call');
    },
    delete: async () => {
      throw new Error('Unexpected carouselSlide.delete call');
    },
  },
  storefrontNavItem: {
    findMany: async () => {
      throw new Error('Unexpected storefrontNavItem.findMany call');
    },
    findUnique: async () => {
      throw new Error('Unexpected storefrontNavItem.findUnique call');
    },
    create: async () => {
      throw new Error('Unexpected storefrontNavItem.create call');
    },
    update: async () => {
      throw new Error('Unexpected storefrontNavItem.update call');
    },
    delete: async () => {
      throw new Error('Unexpected storefrontNavItem.delete call');
    },
  },
  product: {
    findUnique: async () => {
      throw new Error('Unexpected product.findUnique call');
    },
  },
  category: {
    findUnique: async () => {
      throw new Error('Unexpected category.findUnique call');
    },
  },
};

require.cache[databasePath] = {
  id: databasePath,
  filename: databasePath,
  loaded: true,
  exports: prisma,
};

const storefrontContentModel = require('./storefrontContent.model');

beforeEach(() => {
  prisma.product.findUnique = async () => null;
  prisma.category.findUnique = async () => null;
  prisma.carouselSlide.findMany = async () => [];
  prisma.storefrontNavItem.findMany = async () => [];
  prisma.storefrontNavItem.findUnique = async () => null;
});

after(() => {
  delete require.cache[require.resolve('./storefrontContent.model')];
  if (originalDatabaseModule) {
    require.cache[databasePath] = originalDatabaseModule;
  } else {
    delete require.cache[databasePath];
  }
});

test('validateLinkTarget accepts existing product targets', async () => {
  prisma.product.findUnique = async (query) => {
    assert.deepEqual(query, { where: { id: 'product-1' }, select: { id: true } });
    return { id: 'product-1' };
  };

  await storefrontContentModel.validateLinkTarget({
    linkType: 'product',
    productId: 'product-1',
  });
});

test('validateLinkTarget rejects missing product targets', async () => {
  await assert.rejects(
    () => storefrontContentModel.validateLinkTarget({
      linkType: 'product',
      productId: 'missing-product',
    }),
    /Product link target was not found/
  );
});

test('validateLinkTarget accepts existing category targets', async () => {
  prisma.category.findUnique = async (query) => {
    assert.deepEqual(query, { where: { id: 'category-1' }, select: { id: true } });
    return { id: 'category-1' };
  };

  await storefrontContentModel.validateLinkTarget({
    linkType: 'category',
    categoryId: 'category-1',
  });
});

test('validateLinkTarget rejects invalid custom URLs', async () => {
  await assert.rejects(
    () => storefrontContentModel.validateLinkTarget({
      linkType: 'customUrl',
      customUrl: 'products',
    }),
    /Custom URL must start/
  );
});

test('findPublicCarouselSlides returns active sorted slides and hides broken targets', async () => {
  prisma.carouselSlide.findMany = async (query) => {
    assert.deepEqual(query, {
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
    return [
      {
        id: 'slide-product',
        title: 'Laptop launch',
        description: 'New work machines',
        imageUrl: 'https://example.com/laptop.jpg',
        primaryButtonLabel: 'Shop laptop',
        linkType: 'product',
        productId: 'product-1',
        categoryId: null,
        customUrl: null,
        product: { id: 'product-1', name: 'Laptop' },
        category: null,
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 'slide-broken',
        title: 'Broken product',
        description: '',
        imageUrl: 'https://example.com/broken.jpg',
        primaryButtonLabel: 'Shop broken',
        linkType: 'product',
        productId: null,
        categoryId: null,
        customUrl: null,
        product: null,
        category: null,
        sortOrder: 2,
        isActive: true,
      },
    ];
  };

  assert.deepEqual(await storefrontContentModel.findPublicCarouselSlides(), [
    {
      id: 'slide-product',
      title: 'Laptop launch',
      description: 'New work machines',
      imageUrl: 'https://example.com/laptop.jpg',
      primaryButtonLabel: 'Shop laptop',
      linkTarget: {
        type: 'product',
        productId: 'product-1',
        categoryId: null,
        customUrl: null,
      },
      sortOrder: 1,
    },
  ]);
});

test('findPublicNavigation groups active children under active mega menus', async () => {
  prisma.storefrontNavItem.findMany = async (query) => {
    assert.deepEqual(query, {
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        product: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        featuredProduct: { select: { id: true, name: true } },
        featuredCategory: { select: { id: true, name: true } },
      },
    });
    return [
      {
        id: 'nav-shop',
        parentId: null,
        label: 'Shop',
        description: null,
        itemType: 'mega_menu',
        icon: null,
        linkType: null,
        productId: null,
        categoryId: null,
        customUrl: null,
        product: null,
        category: null,
        featuredTitle: 'Featured phones',
        featuredDescription: 'Newest devices',
        featuredImageUrl: 'https://example.com/phones.jpg',
        featuredLinkLabel: 'Shop phones',
        featuredLinkType: 'category',
        featuredProductId: null,
        featuredCategoryId: 'category-1',
        featuredCustomUrl: null,
        featuredProduct: null,
        featuredCategory: { id: 'category-1', name: 'Phones' },
        sortOrder: 1,
        isActive: true,
      },
      {
        id: 'nav-child',
        parentId: 'nav-shop',
        label: 'Phones',
        description: 'Smartphones and cases',
        itemType: 'link',
        icon: 'success',
        linkType: 'category',
        productId: null,
        categoryId: 'category-1',
        customUrl: null,
        product: null,
        category: { id: 'category-1', name: 'Phones' },
        featuredTitle: null,
        featuredDescription: null,
        featuredImageUrl: null,
        featuredLinkLabel: null,
        featuredLinkType: null,
        featuredProductId: null,
        featuredCategoryId: null,
        featuredCustomUrl: null,
        featuredProduct: null,
        featuredCategory: null,
        sortOrder: 1,
        isActive: true,
      },
    ];
  };

  assert.deepEqual(await storefrontContentModel.findPublicNavigation(), [
    {
      id: 'nav-shop',
      label: 'Shop',
      itemType: 'mega_menu',
      sortOrder: 1,
      featured: {
        title: 'Featured phones',
        description: 'Newest devices',
        imageUrl: 'https://example.com/phones.jpg',
        linkLabel: 'Shop phones',
        linkTarget: {
          type: 'category',
          productId: null,
          categoryId: 'category-1',
          customUrl: null,
        },
      },
      children: [
        {
          id: 'nav-child',
          label: 'Phones',
          description: 'Smartphones and cases',
          icon: 'success',
          linkTarget: {
            type: 'category',
            productId: null,
            categoryId: 'category-1',
            customUrl: null,
          },
          sortOrder: 1,
        },
      ],
    },
  ]);
});
```

- [ ] **Step 2: Run the model test and confirm it fails**

Run:

```powershell
cd backend
node --test src/models/storefrontContent.model.test.js
```

Expected: FAIL because `./storefrontContent.model` does not exist yet.

- [ ] **Step 3: Add Prisma schema models**

Modify `backend/prisma/schema.prisma`.

Add these enums after `ReviewStatus`:

```prisma
enum StorefrontLinkType {
  product
  category
  customUrl
}

enum StorefrontNavItemType {
  link
  mega_menu
}
```

Add these relation fields inside `model Product`:

```prisma
  carouselSlides                  CarouselSlide[]     @relation("CarouselSlideProduct")
  storefrontNavItems              StorefrontNavItem[]  @relation("StorefrontNavItemProduct")
  storefrontNavFeaturedItems      StorefrontNavItem[]  @relation("StorefrontNavFeaturedProduct")
```

Add these relation fields inside `model Category`:

```prisma
  carouselSlides                  CarouselSlide[]     @relation("CarouselSlideCategory")
  storefrontNavItems              StorefrontNavItem[]  @relation("StorefrontNavItemCategory")
  storefrontNavFeaturedItems      StorefrontNavItem[]  @relation("StorefrontNavFeaturedCategory")
```

Add these models after `model Review`:

```prisma
model CarouselSlide {
  id                 String             @id @default(uuid())
  title              String
  description        String?
  imageUrl           String?            @map("image_url")
  primaryButtonLabel String             @map("primary_button_label")
  linkType           StorefrontLinkType  @map("link_type")
  productId          String?            @map("product_id")
  product            Product?           @relation("CarouselSlideProduct", fields: [productId], references: [id], onDelete: SetNull)
  categoryId         String?            @map("category_id")
  category           Category?          @relation("CarouselSlideCategory", fields: [categoryId], references: [id], onDelete: SetNull)
  customUrl          String?            @map("custom_url")
  sortOrder          Int                @default(0) @map("sort_order")
  isActive           Boolean            @default(true) @map("is_active")
  createdAt          DateTime           @default(now()) @map("created_at")
  updatedAt          DateTime           @updatedAt @map("updated_at")

  @@index([isActive, sortOrder])
}

model StorefrontNavItem {
  id                 String                 @id @default(uuid())
  parentId           String?                @map("parent_id")
  parent             StorefrontNavItem?     @relation("StorefrontNavTree", fields: [parentId], references: [id], onDelete: Cascade)
  children           StorefrontNavItem[]    @relation("StorefrontNavTree")
  label              String
  description        String?
  itemType           StorefrontNavItemType   @map("item_type")
  icon               String?
  linkType           StorefrontLinkType?     @map("link_type")
  productId          String?                @map("product_id")
  product            Product?               @relation("StorefrontNavItemProduct", fields: [productId], references: [id], onDelete: SetNull)
  categoryId         String?                @map("category_id")
  category           Category?              @relation("StorefrontNavItemCategory", fields: [categoryId], references: [id], onDelete: SetNull)
  customUrl          String?                @map("custom_url")
  featuredTitle      String?                @map("featured_title")
  featuredDescription String?               @map("featured_description")
  featuredImageUrl   String?                @map("featured_image_url")
  featuredLinkLabel  String?                @map("featured_link_label")
  featuredLinkType   StorefrontLinkType?     @map("featured_link_type")
  featuredProductId  String?                @map("featured_product_id")
  featuredProduct    Product?               @relation("StorefrontNavFeaturedProduct", fields: [featuredProductId], references: [id], onDelete: SetNull)
  featuredCategoryId String?                @map("featured_category_id")
  featuredCategory   Category?              @relation("StorefrontNavFeaturedCategory", fields: [featuredCategoryId], references: [id], onDelete: SetNull)
  featuredCustomUrl  String?                @map("featured_custom_url")
  sortOrder          Int                    @default(0) @map("sort_order")
  isActive           Boolean                @default(true) @map("is_active")
  createdAt          DateTime               @default(now()) @map("created_at")
  updatedAt          DateTime               @updatedAt @map("updated_at")

  @@index([parentId])
  @@index([isActive, sortOrder])
}
```

Run:

```powershell
cd backend
npx prisma format
npx prisma generate
```

Expected: Prisma formats the schema and generates the client successfully.

- [ ] **Step 4: Create the model module**

Create `backend/src/models/storefrontContent.model.js` with these exports:

```js
const prisma = require('../config/database');

const LINK_TYPES = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  CUSTOM_URL: 'customUrl',
};

const NAV_ITEM_TYPES = {
  LINK: 'link',
  MEGA_MENU: 'mega_menu',
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidCustomUrl = (value) => (
  isNonEmptyString(value) &&
  (value.trim().startsWith('/') || value.trim().startsWith('http://') || value.trim().startsWith('https://'))
);

const toNullableString = (value) => (isNonEmptyString(value) ? value.trim() : null);

const buildLinkTarget = ({ linkType, productId, categoryId, customUrl }) => ({
  type: linkType,
  productId: productId || null,
  categoryId: categoryId || null,
  customUrl: customUrl || null,
});

const targetField = (prefix, fieldName) => {
  if (!prefix) return fieldName;
  return `${prefix}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
};

const hasResolvedTarget = (item, prefix = '') => {
  const linkType = item[targetField(prefix, 'linkType')];
  if (!linkType) return false;
  if (linkType === LINK_TYPES.PRODUCT) return Boolean(item[targetField(prefix, 'productId')]);
  if (linkType === LINK_TYPES.CATEGORY) return Boolean(item[targetField(prefix, 'categoryId')]);
  if (linkType === LINK_TYPES.CUSTOM_URL) return isValidCustomUrl(item[targetField(prefix, 'customUrl')]);
  return false;
};

const validateLinkTarget = async ({ linkType, productId, categoryId, customUrl }, { isRequired = true } = {}) => {
  if (!linkType) {
    if (isRequired) throw new Error('Link type is required.');
    return;
  }

  if (!Object.values(LINK_TYPES).includes(linkType)) {
    throw new Error('Link type is invalid.');
  }

  if (linkType === LINK_TYPES.PRODUCT) {
    if (!isNonEmptyString(productId)) {
      throw new Error('Product link target is required.');
    }
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new Error('Product link target was not found.');
    }
  }

  if (linkType === LINK_TYPES.CATEGORY) {
    if (!isNonEmptyString(categoryId)) {
      throw new Error('Category link target is required.');
    }
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new Error('Category link target was not found.');
    }
  }

  if (linkType === LINK_TYPES.CUSTOM_URL && !isValidCustomUrl(customUrl)) {
    throw new Error('Custom URL must start with /, http://, or https://.');
  }
};

const normalizeLinkTargetData = ({ linkType, productId, categoryId, customUrl }) => ({
  linkType,
  productId: linkType === LINK_TYPES.PRODUCT ? productId : null,
  categoryId: linkType === LINK_TYPES.CATEGORY ? categoryId : null,
  customUrl: linkType === LINK_TYPES.CUSTOM_URL ? customUrl.trim() : null,
});

const validateCarouselPayload = async (data) => {
  if (!isNonEmptyString(data.title)) throw new Error('Carousel title is required.');
  if (data.isActive !== false && !isNonEmptyString(data.imageUrl)) throw new Error('Carousel image URL is required.');
  if (!isNonEmptyString(data.primaryButtonLabel)) throw new Error('Carousel button label is required.');
  await validateLinkTarget(data);
};

const normalizeCarouselPayload = (data) => ({
  title: data.title.trim(),
  description: toNullableString(data.description),
  imageUrl: toNullableString(data.imageUrl),
  primaryButtonLabel: data.primaryButtonLabel.trim(),
  ...normalizeLinkTargetData(data),
  sortOrder: Number.isInteger(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
  isActive: data.isActive !== false,
});

const findPublicCarouselSlides = async () => {
  const slides = await prisma.carouselSlide.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      product: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });

  return slides
    .filter(hasResolvedTarget)
    .map((slide) => ({
      id: slide.id,
      title: slide.title,
      description: slide.description || '',
      imageUrl: slide.imageUrl || '',
      primaryButtonLabel: slide.primaryButtonLabel,
      linkTarget: buildLinkTarget(slide),
      sortOrder: slide.sortOrder,
    }));
};

const findAdminCarouselSlides = () => prisma.carouselSlide.findMany({
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  include: {
    product: { select: { id: true, name: true } },
    category: { select: { id: true, name: true } },
  },
});

const createCarouselSlide = async (data) => {
  await validateCarouselPayload(data);
  return prisma.carouselSlide.create({ data: normalizeCarouselPayload(data) });
};

const updateCarouselSlide = async (id, data) => {
  await validateCarouselPayload(data);
  return prisma.carouselSlide.update({
    where: { id },
    data: normalizeCarouselPayload(data),
  });
};

const deleteCarouselSlide = (id) => prisma.carouselSlide.delete({ where: { id } });

const validateNavigationPayload = async (data) => {
  if (!isNonEmptyString(data.label)) throw new Error('Navigation label is required.');
  if (!Object.values(NAV_ITEM_TYPES).includes(data.itemType)) throw new Error('Navigation item type is invalid.');

  if (data.parentId) {
    const parent = await prisma.storefrontNavItem.findUnique({
      where: { id: data.parentId },
      select: { id: true, parentId: true, itemType: true },
    });
    if (!parent || parent.parentId || parent.itemType !== NAV_ITEM_TYPES.MEGA_MENU) {
      throw new Error('Navigation children must belong to a top-level mega menu.');
    }
  }

  if (!data.parentId && data.itemType === NAV_ITEM_TYPES.LINK) {
    await validateLinkTarget(data);
  }

  if (data.parentId) {
    await validateLinkTarget(data);
  }

  if (isNonEmptyString(data.featuredLinkLabel) || data.featuredLinkType) {
    await validateLinkTarget({
      linkType: data.featuredLinkType,
      productId: data.featuredProductId,
      categoryId: data.featuredCategoryId,
      customUrl: data.featuredCustomUrl,
    });
  }
};

const normalizeNavigationPayload = (data) => {
  const linkData = data.itemType === NAV_ITEM_TYPES.MEGA_MENU && !data.parentId
    ? { linkType: null, productId: null, categoryId: null, customUrl: null }
    : normalizeLinkTargetData(data);

  return {
    parentId: toNullableString(data.parentId),
    label: data.label.trim(),
    description: toNullableString(data.description),
    itemType: data.itemType,
    icon: toNullableString(data.icon),
    ...linkData,
    featuredTitle: toNullableString(data.featuredTitle),
    featuredDescription: toNullableString(data.featuredDescription),
    featuredImageUrl: toNullableString(data.featuredImageUrl),
    featuredLinkLabel: toNullableString(data.featuredLinkLabel),
    featuredLinkType: data.featuredLinkType || null,
    featuredProductId: data.featuredLinkType === LINK_TYPES.PRODUCT ? data.featuredProductId : null,
    featuredCategoryId: data.featuredLinkType === LINK_TYPES.CATEGORY ? data.featuredCategoryId : null,
    featuredCustomUrl: data.featuredLinkType === LINK_TYPES.CUSTOM_URL ? (data.featuredCustomUrl || '').trim() : null,
    sortOrder: Number.isInteger(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
    isActive: data.isActive !== false,
  };
};

const navInclude = {
  product: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  featuredProduct: { select: { id: true, name: true } },
  featuredCategory: { select: { id: true, name: true } },
};

const toFeaturedCard = (item) => {
  if (!item.featuredTitle || !item.featuredLinkLabel || !hasResolvedTarget(item, 'featured')) {
    return null;
  }

  return {
    title: item.featuredTitle,
    description: item.featuredDescription || '',
    imageUrl: item.featuredImageUrl || '',
    linkLabel: item.featuredLinkLabel,
    linkTarget: buildLinkTarget({
      linkType: item.featuredLinkType,
      productId: item.featuredProductId,
      categoryId: item.featuredCategoryId,
      customUrl: item.featuredCustomUrl,
    }),
  };
};

const toPublicChildNavItem = (item) => ({
  id: item.id,
  label: item.label,
  description: item.description || '',
  icon: item.icon || 'info',
  linkTarget: buildLinkTarget(item),
  sortOrder: item.sortOrder,
});

const findPublicNavigation = async () => {
  const items = await prisma.storefrontNavItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: navInclude,
  });

  const childrenByParentId = new Map();
  items
    .filter((item) => item.parentId && hasResolvedTarget(item))
    .forEach((item) => {
      const children = childrenByParentId.get(item.parentId) || [];
      children.push(toPublicChildNavItem(item));
      childrenByParentId.set(item.parentId, children);
    });

  return items
    .filter((item) => !item.parentId)
    .filter((item) => item.itemType === NAV_ITEM_TYPES.MEGA_MENU || hasResolvedTarget(item))
    .map((item) => {
      if (item.itemType === NAV_ITEM_TYPES.MEGA_MENU) {
        return {
          id: item.id,
          label: item.label,
          itemType: item.itemType,
          sortOrder: item.sortOrder,
          featured: toFeaturedCard(item),
          children: childrenByParentId.get(item.id) || [],
        };
      }

      return {
        id: item.id,
        label: item.label,
        itemType: item.itemType,
        linkTarget: buildLinkTarget(item),
        sortOrder: item.sortOrder,
      };
    });
};

const findAdminNavigation = () => prisma.storefrontNavItem.findMany({
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  include: navInclude,
});

const createNavigationItem = async (data) => {
  await validateNavigationPayload(data);
  return prisma.storefrontNavItem.create({ data: normalizeNavigationPayload(data) });
};

const updateNavigationItem = async (id, data) => {
  await validateNavigationPayload(data);
  return prisma.storefrontNavItem.update({
    where: { id },
    data: normalizeNavigationPayload(data),
  });
};

const deleteNavigationItem = (id) => prisma.storefrontNavItem.delete({ where: { id } });

module.exports = {
  LINK_TYPES,
  NAV_ITEM_TYPES,
  validateLinkTarget,
  findPublicCarouselSlides,
  findAdminCarouselSlides,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
  findPublicNavigation,
  findAdminNavigation,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
};
```

- [ ] **Step 5: Run the focused model test**

Run:

```powershell
cd backend
node --test src/models/storefrontContent.model.test.js
```

Expected: PASS.

- [ ] **Step 6: Create the migration**

Run:

```powershell
cd backend
npx prisma migrate dev --name storefront_content_manager
```

Expected: Prisma creates a migration under `backend/prisma/migrations/*_storefront_content_manager/` and regenerates the client.

- [ ] **Step 7: Commit Task 1**

```powershell
git add backend/prisma/schema.prisma backend/prisma/migrations backend/src/models/storefrontContent.model.js backend/src/models/storefrontContent.model.test.js
git commit -m "feat: add storefront content data model"
```

---

### Task 2: Backend Storefront Content Controllers And Routes

**Files:**
- Create: `backend/src/controllers/storefrontContent.controller.js`
- Create: `backend/src/controllers/storefrontContent.controller.test.js`
- Create: `backend/src/routes/storefrontContent.routes.js`
- Modify: `backend/src/routes/index.js`

- [ ] **Step 1: Write the failing controller and route tests**

Create `backend/src/controllers/storefrontContent.controller.test.js`:

```js
const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const express = require('express');

const storefrontModel = require('../models/storefrontContent.model');

beforeEach(() => {
  storefrontModel.findPublicCarouselSlides = async () => [];
  storefrontModel.findPublicNavigation = async () => [];
  storefrontModel.findAdminCarouselSlides = async () => [];
  storefrontModel.createCarouselSlide = async (payload) => ({ id: 'slide-1', ...payload });
  storefrontModel.updateCarouselSlide = async (id, payload) => ({ id, ...payload });
  storefrontModel.deleteCarouselSlide = async () => ({ id: 'slide-1' });
  storefrontModel.findAdminNavigation = async () => [];
  storefrontModel.createNavigationItem = async (payload) => ({ id: 'nav-1', ...payload });
  storefrontModel.updateNavigationItem = async (id, payload) => ({ id, ...payload });
  storefrontModel.deleteNavigationItem = async () => ({ id: 'nav-1' });
});

const createResponse = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
  };
  return response;
};

test('public storefront controllers return carousel and navigation response shapes', async () => {
  const controller = require('./storefrontContent.controller');

  const carouselResponse = createResponse();
  await controller.getPublicCarousel({}, carouselResponse, assert.fail);
  assert.equal(carouselResponse.statusCode, 200);
  assert.deepEqual(carouselResponse.body, {
    success: true,
    message: 'Storefront carousel retrieved successfully',
    data: { slides: [] },
  });

  const navResponse = createResponse();
  await controller.getPublicNavigation({}, navResponse, assert.fail);
  assert.equal(navResponse.statusCode, 200);
  assert.deepEqual(navResponse.body, {
    success: true,
    message: 'Storefront navigation retrieved successfully',
    data: { items: [] },
  });
});

test('admin create carousel validation errors return HTTP 400', async () => {
  const controller = require('./storefrontContent.controller');
  storefrontModel.createCarouselSlide = async () => {
    throw new Error('Carousel title is required.');
  };

  const response = createResponse();
  await controller.createAdminCarouselSlide({ body: {} }, response, assert.fail);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Carousel title is required.');
});

test('storefront routes mount public and admin endpoints with protection', async () => {
  const { protect } = require('../middlewares/auth.middleware');
  const { admin } = require('../middlewares/admin.middleware');
  const controller = require('./storefrontContent.controller');
  const { storefrontContentPublicRouter, storefrontContentAdminRouter } = require('../routes/storefrontContent.routes');

  const publicRoutes = storefrontContentPublicRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      method: Object.keys(layer.route.methods)[0],
      handlers: layer.route.stack.map((routeLayer) => routeLayer.handle),
    }));

  assert.deepEqual(publicRoutes, [
    { path: '/carousel', method: 'get', handlers: [controller.getPublicCarousel] },
    { path: '/navigation', method: 'get', handlers: [controller.getPublicNavigation] },
  ]);

  const adminRoutes = storefrontContentAdminRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      method: Object.keys(layer.route.methods)[0],
      handlers: layer.route.stack.map((routeLayer) => routeLayer.handle),
    }));

  assert.deepEqual(adminRoutes.map((route) => route.handlers.slice(0, 2)), [
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
    [protect, admin],
  ]);
});

test('public and admin storefront routes are mounted under /api', async () => {
  const app = express();
  app.use('/api', require('../routes'));
  app.use((req, res) => res.status(404).json({ status: 404 }));

  const server = app.listen(0);
  try {
    const { port } = server.address();

    const publicResponse = await fetch(`http://localhost:${port}/api/storefront/carousel`);
    const publicBody = await publicResponse.json();
    assert.equal(publicResponse.status, 200);
    assert.equal(publicBody.message, 'Storefront carousel retrieved successfully');

    const adminResponse = await fetch(`http://localhost:${port}/api/admin/storefront/carousel`);
    const adminBody = await adminResponse.json();
    assert.equal(adminResponse.status, 401);
    assert.equal(adminBody.message, 'Not authorized, no token provided');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
```

- [ ] **Step 2: Run the controller test and confirm it fails**

Run:

```powershell
cd backend
node --test src/controllers/storefrontContent.controller.test.js
```

Expected: FAIL because controller and route modules do not exist.

- [ ] **Step 3: Add the controller**

Create `backend/src/controllers/storefrontContent.controller.js`:

```js
const storefrontContentModel = require('../models/storefrontContent.model');
const { successResponse, errorResponse } = require('../utils/response');

const isValidationError = (error) => (
  error.message &&
  (
    error.message.includes('required') ||
    error.message.includes('invalid') ||
    error.message.includes('not found') ||
    error.message.includes('must') ||
    error.message.includes('belong')
  )
);

const getPublicCarousel = async (req, res, next) => {
  try {
    const slides = await storefrontContentModel.findPublicCarouselSlides();
    return successResponse(res, 200, 'Storefront carousel retrieved successfully', { slides });
  } catch (error) {
    next(error);
  }
};

const getPublicNavigation = async (req, res, next) => {
  try {
    const items = await storefrontContentModel.findPublicNavigation();
    return successResponse(res, 200, 'Storefront navigation retrieved successfully', { items });
  } catch (error) {
    next(error);
  }
};

const listAdminCarouselSlides = async (req, res, next) => {
  try {
    const slides = await storefrontContentModel.findAdminCarouselSlides();
    return successResponse(res, 200, 'Admin storefront carousel retrieved successfully', { slides });
  } catch (error) {
    next(error);
  }
};

const createAdminCarouselSlide = async (req, res, next) => {
  try {
    const slide = await storefrontContentModel.createCarouselSlide(req.body);
    return successResponse(res, 201, 'Carousel slide created successfully', { slide });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminCarouselSlide = async (req, res, next) => {
  try {
    const slide = await storefrontContentModel.updateCarouselSlide(req.params.id, req.body);
    return successResponse(res, 200, 'Carousel slide updated successfully', { slide });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Carousel slide not found');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminCarouselSlide = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteCarouselSlide(req.params.id);
    return successResponse(res, 200, 'Carousel slide deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Carousel slide not found');
    next(error);
  }
};

const listAdminNavigation = async (req, res, next) => {
  try {
    const items = await storefrontContentModel.findAdminNavigation();
    return successResponse(res, 200, 'Admin storefront navigation retrieved successfully', { items });
  } catch (error) {
    next(error);
  }
};

const createAdminNavigationItem = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.createNavigationItem(req.body);
    return successResponse(res, 201, 'Navigation item created successfully', { item });
  } catch (error) {
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const updateAdminNavigationItem = async (req, res, next) => {
  try {
    const item = await storefrontContentModel.updateNavigationItem(req.params.id, req.body);
    return successResponse(res, 200, 'Navigation item updated successfully', { item });
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Navigation item not found');
    if (isValidationError(error)) return errorResponse(res, 400, error.message);
    next(error);
  }
};

const deleteAdminNavigationItem = async (req, res, next) => {
  try {
    await storefrontContentModel.deleteNavigationItem(req.params.id);
    return successResponse(res, 200, 'Navigation item deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') return errorResponse(res, 404, 'Navigation item not found');
    next(error);
  }
};

module.exports = {
  getPublicCarousel,
  getPublicNavigation,
  listAdminCarouselSlides,
  createAdminCarouselSlide,
  updateAdminCarouselSlide,
  deleteAdminCarouselSlide,
  listAdminNavigation,
  createAdminNavigationItem,
  updateAdminNavigationItem,
  deleteAdminNavigationItem,
};
```

- [ ] **Step 4: Add the route module**

Create `backend/src/routes/storefrontContent.routes.js`:

```js
const express = require('express');
const controller = require('../controllers/storefrontContent.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

const storefrontContentPublicRouter = express.Router();
const storefrontContentAdminRouter = express.Router();

storefrontContentPublicRouter.get('/carousel', controller.getPublicCarousel);
storefrontContentPublicRouter.get('/navigation', controller.getPublicNavigation);

storefrontContentAdminRouter.get('/carousel', protect, admin, controller.listAdminCarouselSlides);
storefrontContentAdminRouter.post('/carousel', protect, admin, controller.createAdminCarouselSlide);
storefrontContentAdminRouter.put('/carousel/:id', protect, admin, controller.updateAdminCarouselSlide);
storefrontContentAdminRouter.delete('/carousel/:id', protect, admin, controller.deleteAdminCarouselSlide);
storefrontContentAdminRouter.get('/navigation', protect, admin, controller.listAdminNavigation);
storefrontContentAdminRouter.post('/navigation', protect, admin, controller.createAdminNavigationItem);
storefrontContentAdminRouter.put('/navigation/:id', protect, admin, controller.updateAdminNavigationItem);
storefrontContentAdminRouter.delete('/navigation/:id', protect, admin, controller.deleteAdminNavigationItem);

module.exports = {
  storefrontContentPublicRouter,
  storefrontContentAdminRouter,
};
```

Modify `backend/src/routes/index.js`:

```js
const {
  storefrontContentPublicRouter,
  storefrontContentAdminRouter,
} = require('./storefrontContent.routes');
```

Mount after report routes:

```js
router.use('/storefront', storefrontContentPublicRouter);
router.use('/admin/storefront', storefrontContentAdminRouter);
```

- [ ] **Step 5: Run backend route/controller tests**

Run:

```powershell
cd backend
node --test src/models/storefrontContent.model.test.js src/controllers/storefrontContent.controller.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```powershell
git add backend/src/controllers/storefrontContent.controller.js backend/src/controllers/storefrontContent.controller.test.js backend/src/routes/storefrontContent.routes.js backend/src/routes/index.js
git commit -m "feat: add storefront content API routes"
```

---

### Task 3: Frontend API And Link Target Utilities

**Files:**
- Create: `frontend/src/api/storefrontContentApi.js`
- Create: `frontend/src/api/storefrontContentApi.test.js`
- Create: `frontend/src/components/storefront/storefrontLinkUtils.js`
- Create: `frontend/src/components/storefront/storefrontLinkUtils.test.js`

- [ ] **Step 1: Write failing frontend API and utility tests**

Create `frontend/src/api/storefrontContentApi.test.js`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./storefrontContentApi.js', import.meta.url), 'utf8');

test('storefront content API helper uses apiClient for public and admin endpoints', () => {
  assert.match(source, /import \{ apiClient \} from '\.\/apiClient';/);
  assert.match(source, /getCarousel:\s*\(\)\s*=>\s*apiClient\.get\('\/storefront\/carousel'\)/);
  assert.match(source, /getNavigation:\s*\(\)\s*=>\s*apiClient\.get\('\/storefront\/navigation'\)/);
  assert.match(source, /getAdminCarousel:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/storefront\/carousel'\)/);
  assert.match(source, /createCarouselSlide:\s*\(payload\)\s*=>\s*apiClient\.post\('\/admin\/storefront\/carousel', payload\)/);
  assert.match(source, /updateCarouselSlide:\s*\(id, payload\)\s*=>\s*apiClient\.put\(`\/admin\/storefront\/carousel\/\$\{id\}`, payload\)/);
  assert.match(source, /deleteCarouselSlide:\s*\(id\)\s*=>\s*apiClient\.delete\(`\/admin\/storefront\/carousel\/\$\{id\}`\)/);
  assert.match(source, /getAdminNavigation:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/storefront\/navigation'\)/);
  assert.match(source, /createNavigationItem:\s*\(payload\)\s*=>\s*apiClient\.post\('\/admin\/storefront\/navigation', payload\)/);
  assert.match(source, /updateNavigationItem:\s*\(id, payload\)\s*=>\s*apiClient\.put\(`\/admin\/storefront\/navigation\/\$\{id\}`, payload\)/);
  assert.match(source, /deleteNavigationItem:\s*\(id\)\s*=>\s*apiClient\.delete\(`\/admin\/storefront\/navigation\/\$\{id\}`\)/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /API_BASE_URL|supabase/i);
});
```

Create `frontend/src/components/storefront/storefrontLinkUtils.test.js`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  describeLinkTarget,
  resolveStorefrontHref,
} from './storefrontLinkUtils.js';

test('resolveStorefrontHref resolves product category and custom targets', () => {
  assert.equal(resolveStorefrontHref({ type: 'product', productId: 'p1' }), '/products/p1');
  assert.equal(resolveStorefrontHref({ type: 'category', categoryId: 'c1' }), '/products?categoryId=c1');
  assert.equal(resolveStorefrontHref({ type: 'customUrl', customUrl: '/sale' }), '/sale');
  assert.equal(resolveStorefrontHref({ type: 'customUrl', customUrl: 'https://example.com' }), 'https://example.com');
});

test('resolveStorefrontHref falls back to products for incomplete targets', () => {
  assert.equal(resolveStorefrontHref(null), '/products');
  assert.equal(resolveStorefrontHref({ type: 'product' }), '/products');
  assert.equal(resolveStorefrontHref({ type: 'category' }), '/products');
});

test('describeLinkTarget creates admin table copy', () => {
  assert.equal(describeLinkTarget({ type: 'product', productId: 'p1' }), 'Product p1');
  assert.equal(describeLinkTarget({ type: 'category', categoryId: 'c1' }), 'Category c1');
  assert.equal(describeLinkTarget({ type: 'customUrl', customUrl: '/sale' }), '/sale');
  assert.equal(describeLinkTarget(null), 'No link target');
});
```

- [ ] **Step 2: Run the frontend focused tests and confirm they fail**

Run:

```powershell
cd frontend
node src/api/storefrontContentApi.test.js
node src/components/storefront/storefrontLinkUtils.test.js
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Add the API helper**

Create `frontend/src/api/storefrontContentApi.js`:

```js
import { apiClient } from './apiClient';

export const storefrontContentApi = {
  getCarousel: () => apiClient.get('/storefront/carousel'),
  getNavigation: () => apiClient.get('/storefront/navigation'),
  getAdminCarousel: () => apiClient.get('/admin/storefront/carousel'),
  createCarouselSlide: (payload) => apiClient.post('/admin/storefront/carousel', payload),
  updateCarouselSlide: (id, payload) => apiClient.put(`/admin/storefront/carousel/${id}`, payload),
  deleteCarouselSlide: (id) => apiClient.delete(`/admin/storefront/carousel/${id}`),
  getAdminNavigation: () => apiClient.get('/admin/storefront/navigation'),
  createNavigationItem: (payload) => apiClient.post('/admin/storefront/navigation', payload),
  updateNavigationItem: (id, payload) => apiClient.put(`/admin/storefront/navigation/${id}`, payload),
  deleteNavigationItem: (id) => apiClient.delete(`/admin/storefront/navigation/${id}`),
};
```

- [ ] **Step 4: Add link utility helpers**

Create `frontend/src/components/storefront/storefrontLinkUtils.js`:

```js
export const resolveStorefrontHref = (linkTarget) => {
  if (!linkTarget) {
    return '/products';
  }

  if (linkTarget.type === 'product' && linkTarget.productId) {
    return `/products/${linkTarget.productId}`;
  }

  if (linkTarget.type === 'category' && linkTarget.categoryId) {
    return `/products?categoryId=${encodeURIComponent(linkTarget.categoryId)}`;
  }

  if (linkTarget.type === 'customUrl' && linkTarget.customUrl) {
    return linkTarget.customUrl;
  }

  return '/products';
};

export const describeLinkTarget = (linkTarget) => {
  if (!linkTarget) {
    return 'No link target';
  }

  if (linkTarget.type === 'product' && linkTarget.productId) {
    return `Product ${linkTarget.productId}`;
  }

  if (linkTarget.type === 'category' && linkTarget.categoryId) {
    return `Category ${linkTarget.categoryId}`;
  }

  if (linkTarget.type === 'customUrl' && linkTarget.customUrl) {
    return linkTarget.customUrl;
  }

  return 'Incomplete link target';
};
```

- [ ] **Step 5: Run the frontend utility tests**

Run:

```powershell
cd frontend
node src/api/storefrontContentApi.test.js
node src/components/storefront/storefrontLinkUtils.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```powershell
git add frontend/src/api/storefrontContentApi.js frontend/src/api/storefrontContentApi.test.js frontend/src/components/storefront/storefrontLinkUtils.js frontend/src/components/storefront/storefrontLinkUtils.test.js
git commit -m "feat: add storefront content frontend helpers"
```

---

### Task 4: Public Homepage Carousel Rendering

**Files:**
- Modify: `frontend/src/views/HomeView.jsx`
- Modify: `frontend/src/components/home/HomeHero.jsx`
- Create: `frontend/src/components/home/HomeHero.structure.test.js`

- [ ] **Step 1: Write the failing structure test**

Create `frontend/src/components/home/HomeHero.structure.test.js`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const heroSource = readFileSync(new URL('./HomeHero.jsx', import.meta.url), 'utf8');
const homeViewSource = readFileSync(new URL('../../views/HomeView.jsx', import.meta.url), 'utf8');

test('HomeView loads storefront carousel slides from the storefront content API', () => {
  assert.match(homeViewSource, /import \{ storefrontContentApi \} from '\.\.\/api\/storefrontContentApi';/);
  assert.match(homeViewSource, /storefrontContentApi\.getCarousel\(\)/);
  assert.match(homeViewSource, /catch\(\(\) => \(\{ data: \{ slides: \[\] \} \}\)\)/);
  assert.match(homeViewSource, /setCarouselSlides\(carouselResponse\?\.data\?\.slides \|\| \[\]\)/);
  assert.match(homeViewSource, /<HomeHero slides=\{carouselSlides\} \/>/);
});

test('HomeHero renders slide config instead of deriving slides from products', () => {
  assert.match(heroSource, /export const HomeHero = \(\{ slides = \[\] \}\)/);
  assert.match(heroSource, /const heroSlides = slides\.slice\(0, heroSlidesLimit\)/);
  assert.match(heroSource, /resolveStorefrontHref\(slide\.linkTarget\)/);
  assert.match(heroSource, /slide\.primaryButtonLabel/);
  assert.doesNotMatch(heroSource, /products\.slice/);
  assert.doesNotMatch(heroSource, /formatPrice/);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
cd frontend
node src/components/home/HomeHero.structure.test.js
```

Expected: FAIL because `HomeView` and `HomeHero` still use product-derived carousel data.

- [ ] **Step 3: Update `HomeView.jsx` data loading**

Patch `frontend/src/views/HomeView.jsx`:

```jsx
import { storefrontContentApi } from '../api/storefrontContentApi';
```

Add carousel state near the existing product/category state:

```jsx
const [carouselSlides, setCarouselSlides] = useState([]);
```

Replace the `Promise.all` block with:

```jsx
const [productResponse, categoryResponse, carouselResponse] = await Promise.all([
  productApi.getProducts(homeProductQuery),
  categoryApi.getCategories(),
  storefrontContentApi.getCarousel().catch(() => ({ data: { slides: [] } }))
]);
```

Set the slide state in the success path:

```jsx
setProducts(productResponse?.data?.items || []);
setCategories(categoryResponse?.data?.categories || []);
setCarouselSlides(carouselResponse?.data?.slides || []);
```

Reset slide state in the error path:

```jsx
setProducts([]);
setCategories([]);
setCarouselSlides([]);
setError(err?.message || 'Unable to load storefront data.');
```

Render:

```jsx
<HomeHero slides={carouselSlides} />
```

- [ ] **Step 4: Update `HomeHero.jsx` to render configured slides**

Patch `frontend/src/components/home/HomeHero.jsx` so the public contract uses slides:

```jsx
import { resolveStorefrontHref } from '../storefront/storefrontLinkUtils';
```

Rename constants and component props:

```jsx
const heroSlidesLimit = 6;
const rotationDelayMs = 5000;
```

Use this slide component shape:

```jsx
const HomeHeroSlide = ({ isActive, slide }) => {
  const navigate = useNavigate();
  const href = resolveStorefrontHref(slide.linkTarget);

  return (
    <VStack
      aria-hidden={!isActive}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
        transform: isActive ? 'translateX(0)' : 'translateX(var(--spacing-4))',
        transition:
          'opacity var(--duration-medium) var(--ease-standard), transform var(--duration-medium) var(--ease-standard)',
        backgroundImage: `linear-gradient(90deg, var(--color-background-surface) 0%, color-mix(in srgb, var(--color-background-surface) 84%, transparent) 44%, color-mix(in srgb, var(--color-background-surface) 22%, transparent) 100%), url("${slide.imageUrl}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <VStack
        gap={5}
        style={{
          height: '100%',
          justifyContent: 'center',
          maxWidth: 'calc(var(--spacing-8) * 19)',
          paddingInline: heroContentInset
        }}
      >
        <VStack gap={3}>
          <Badge variant="blue" label="Featured" />
          <Heading
            level={1}
            style={{
              fontSize: 'var(--text-title-1-size)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            {slide.title}
          </Heading>
          {slide.description && (
            <Text color="secondary">{slide.description}</Text>
          )}
        </VStack>

        <HStack gap={3} style={{ flexWrap: 'wrap' }}>
          <Button
            label={slide.primaryButtonLabel}
            variant="primary"
            onClick={() => navigate(href)}
          />
          <Button
            label="Browse catalog"
            variant="secondary"
            onClick={() => navigate('/products')}
          />
        </HStack>
      </VStack>
    </VStack>
  );
};
```

Update the exported component:

```jsx
export const HomeHero = ({ slides = [] }) => {
  const navigate = useNavigate();
  const heroSlides = slides.slice(0, heroSlidesLimit);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const hasMultipleSlides = heroSlides.length > 1;
```

Replace all `heroProducts` references with `heroSlides`, and render:

```jsx
{heroSlides.map((slide, index) => (
  <HomeHeroSlide
    key={slide.id}
    isActive={index === activeIndex}
    slide={slide}
  />
))}
```

Update indicator labels:

```jsx
label={`Show ${slide.title}`}
```

Keep the existing empty state, but change the copy to:

```jsx
<Heading level={1}>Storefront carousel is ready for slides</Heading>
<Text color="secondary">
  Add active slides in the admin Storefront manager to publish homepage carousel content.
</Text>
```

- [ ] **Step 5: Run the focused frontend tests**

Run:

```powershell
cd frontend
node src/components/home/HomeHero.structure.test.js
node src/components/storefront/storefrontLinkUtils.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

```powershell
git add frontend/src/views/HomeView.jsx frontend/src/components/home/HomeHero.jsx frontend/src/components/home/HomeHero.structure.test.js
git commit -m "feat: render configurable storefront carousel"
```

---

### Task 5: Public Storefront Navigation Rendering

**Files:**
- Modify: `frontend/src/components/layout/StorefrontMegaNav.jsx`
- Create: `frontend/src/components/layout/StorefrontMegaNav.structure.test.js`

- [ ] **Step 1: Write the failing structure test**

Create `frontend/src/components/layout/StorefrontMegaNav.structure.test.js`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./StorefrontMegaNav.jsx', import.meta.url), 'utf8');

test('StorefrontMegaNav loads public navigation config and keeps a fallback', () => {
  assert.match(source, /import \{ storefrontContentApi \} from '\.\.\/\.\.\/api\/storefrontContentApi';/);
  assert.match(source, /fallbackStorefrontNavigation/);
  assert.match(source, /storefrontContentApi\.getNavigation\(\)/);
  assert.match(source, /setNavigationItems\(response\?\.data\?\.items \|\| fallbackStorefrontNavigation\)/);
});

test('StorefrontMegaNav renders configured simple links and mega menu children', () => {
  assert.match(source, /resolveStorefrontHref\(item\.linkTarget\)/);
  assert.match(source, /TopNavMegaMenu/);
  assert.match(source, /TopNavMegaMenuItem/);
  assert.match(source, /TopNavMegaMenuFeaturedCard/);
  assert.doesNotMatch(source, /const shopItems = \[/);
  assert.doesNotMatch(source, /const brandItems = \[/);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
cd frontend
node src/components/layout/StorefrontMegaNav.structure.test.js
```

Expected: FAIL because the component still has hardcoded nav arrays.

- [ ] **Step 3: Convert `StorefrontMegaNav.jsx` to API-driven rendering**

Patch `frontend/src/components/layout/StorefrontMegaNav.jsx` to use this structure:

```jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Icon,
  TopNavItem,
  TopNavMegaMenu,
  TopNavMegaMenuFeaturedCard,
  TopNavMegaMenuItem
} from '@astryxdesign/core';
import { storefrontContentApi } from '../../api/storefrontContentApi';
import { resolveStorefrontHref } from '../storefront/storefrontLinkUtils';

export const fallbackStorefrontNavigation = [
  {
    id: 'fallback-shop',
    label: 'Shop',
    itemType: 'mega_menu',
    sortOrder: 1,
    featured: {
      title: 'Featured products',
      description: 'Browse the current catalog.',
      imageUrl: 'https://lookaside.facebook.com/assets/astryx/texture-beige-horizontal-1.png',
      linkLabel: 'Shop catalog',
      linkTarget: { type: 'customUrl', customUrl: '/products' }
    },
    children: [
      {
        id: 'fallback-new',
        label: 'New Arrivals',
        description: 'Latest products',
        icon: 'success',
        linkTarget: { type: 'customUrl', customUrl: '/products' },
        sortOrder: 1
      },
      {
        id: 'fallback-sale',
        label: 'Sale',
        description: 'Browse current offers',
        icon: 'warning',
        linkTarget: { type: 'customUrl', customUrl: '/products' },
        sortOrder: 2
      }
    ]
  },
  {
    id: 'fallback-products',
    label: 'Products',
    itemType: 'link',
    linkTarget: { type: 'customUrl', customUrl: '/products' },
    sortOrder: 2
  }
];

const MegaMenuItems = ({ items }) => (
  <Grid columns={{ minWidth: 220, max: 2 }} gap={2}>
    {items.map((item) => (
      <TopNavMegaMenuItem
        key={item.id}
        title={item.label}
        description={item.description || ''}
        icon={<Icon icon={item.icon || 'info'} size="sm" color="secondary" />}
        href={resolveStorefrontHref(item.linkTarget)}
        as={Link}
      />
    ))}
  </Grid>
);

const MegaMenuFeatured = ({ featured }) => (
  featured ? (
    <TopNavMegaMenuFeaturedCard
      title={featured.title}
      description={featured.description || ''}
      image={featured.imageUrl}
      imageAlt={featured.title}
      linkLabel={featured.linkLabel}
      linkHref={resolveStorefrontHref(featured.linkTarget)}
    />
  ) : undefined
);

export const StorefrontMegaNav = () => {
  const [navigationItems, setNavigationItems] = useState(fallbackStorefrontNavigation);

  useEffect(() => {
    let isActive = true;

    storefrontContentApi.getNavigation()
      .then((response) => {
        if (isActive) {
          setNavigationItems(response?.data?.items || fallbackStorefrontNavigation);
        }
      })
      .catch(() => {
        if (isActive) {
          setNavigationItems(fallbackStorefrontNavigation);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      {navigationItems.map((item) => (
        item.itemType === 'mega_menu' ? (
          <TopNavMegaMenu
            key={item.id}
            label={item.label}
            items={<MegaMenuItems items={item.children || []} />}
            featured={<MegaMenuFeatured featured={item.featured} />}
          />
        ) : (
          <TopNavItem
            key={item.id}
            label={item.label}
            href={resolveStorefrontHref(item.linkTarget)}
            as={Link}
          />
        )
      ))}
    </>
  );
};

export default StorefrontMegaNav;
```

- [ ] **Step 4: Run the nav structure tests**

Run:

```powershell
cd frontend
node src/components/layout/StorefrontMegaNav.structure.test.js
node src/api/storefrontContentApi.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

```powershell
git add frontend/src/components/layout/StorefrontMegaNav.jsx frontend/src/components/layout/StorefrontMegaNav.structure.test.js
git commit -m "feat: render configurable storefront navigation"
```

---

### Task 6: Admin Storefront Form Utilities And Shared Link Fields

**Files:**
- Create: `frontend/src/components/admin/storefront/storefrontFormUtils.js`
- Create: `frontend/src/components/admin/storefront/storefrontFormUtils.test.js`
- Create: `frontend/src/components/admin/storefront/LinkTargetFields.jsx`

- [ ] **Step 1: Write failing form utility tests**

Create `frontend/src/components/admin/storefront/storefrontFormUtils.test.js`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCarouselPayload,
  createNavigationPayload,
  getCarouselFormValues,
  validateCarouselForm,
  validateNavigationForm,
} from './storefrontFormUtils.js';

test('carousel form validation requires active slide content and link target', () => {
  assert.deepEqual(validateCarouselForm({
    title: '',
    imageUrl: '',
    primaryButtonLabel: '',
    linkType: 'product',
    productId: '',
    isActive: true,
  }), {
    title: 'Title is required.',
    imageUrl: 'Image URL is required for active slides.',
    primaryButtonLabel: 'Button label is required.',
    productId: 'Product target is required.',
  });
});

test('carousel payload trims values and keeps product target only', () => {
  assert.deepEqual(createCarouselPayload({
    title: ' Laptop ',
    description: ' Work ',
    imageUrl: ' https://example.com/laptop.jpg ',
    primaryButtonLabel: ' Shop ',
    linkType: 'product',
    productId: 'p1',
    categoryId: 'c1',
    customUrl: '/sale',
    sortOrder: 2,
    isActive: true,
  }), {
    title: 'Laptop',
    description: 'Work',
    imageUrl: 'https://example.com/laptop.jpg',
    primaryButtonLabel: 'Shop',
    linkType: 'product',
    productId: 'p1',
    categoryId: null,
    customUrl: null,
    sortOrder: 2,
    isActive: true,
  });
});

test('getCarouselFormValues maps an existing slide to editable form values', () => {
  assert.equal(getCarouselFormValues({ title: 'Launch' }).title, 'Launch');
  assert.equal(getCarouselFormValues(null).linkType, 'product');
});

test('navigation validation enforces mega-menu child parent and target', () => {
  assert.deepEqual(validateNavigationForm({
    label: '',
    itemType: 'link',
    parentId: 'parent-1',
    linkType: 'category',
    categoryId: '',
    isActive: true,
  }), {
    label: 'Label is required.',
    categoryId: 'Category target is required.',
  });
});

test('navigation payload normalizes top-level mega menu without primary target', () => {
  assert.deepEqual(createNavigationPayload({
    label: ' Shop ',
    description: '',
    itemType: 'mega_menu',
    parentId: '',
    icon: '',
    linkType: 'product',
    productId: 'p1',
    categoryId: '',
    customUrl: '',
    featuredTitle: ' Feature ',
    featuredDescription: ' New ',
    featuredImageUrl: ' https://example.com/feature.jpg ',
    featuredLinkLabel: ' Shop now ',
    featuredLinkType: 'customUrl',
    featuredProductId: '',
    featuredCategoryId: '',
    featuredCustomUrl: '/products',
    sortOrder: 1,
    isActive: true,
  }), {
    label: 'Shop',
    description: '',
    itemType: 'mega_menu',
    parentId: null,
    icon: '',
    linkType: null,
    productId: null,
    categoryId: null,
    customUrl: null,
    featuredTitle: 'Feature',
    featuredDescription: 'New',
    featuredImageUrl: 'https://example.com/feature.jpg',
    featuredLinkLabel: 'Shop now',
    featuredLinkType: 'customUrl',
    featuredProductId: null,
    featuredCategoryId: null,
    featuredCustomUrl: '/products',
    sortOrder: 1,
    isActive: true,
  });
});
```

- [ ] **Step 2: Run utility tests and confirm failure**

Run:

```powershell
cd frontend
node src/components/admin/storefront/storefrontFormUtils.test.js
```

Expected: FAIL because the utility module does not exist.

- [ ] **Step 3: Add form utilities**

Create `frontend/src/components/admin/storefront/storefrontFormUtils.js` with these exports:

```js
export const LINK_TYPE_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'category', label: 'Category' },
  { value: 'customUrl', label: 'Custom URL' },
];

export const NAV_ITEM_TYPE_OPTIONS = [
  { value: 'link', label: 'Simple link' },
  { value: 'mega_menu', label: 'Mega menu' },
];

export const NAV_ICON_OPTIONS = [
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'copy', label: 'Copy' },
  { value: 'wrench', label: 'Wrench' },
  { value: 'warning', label: 'Warning' },
  { value: 'check', label: 'Check' },
  { value: 'externalLink', label: 'External link' },
];

export const EMPTY_CAROUSEL_FORM = {
  title: '',
  description: '',
  imageUrl: '',
  primaryButtonLabel: 'Shop now',
  linkType: 'product',
  productId: '',
  categoryId: '',
  customUrl: '',
  sortOrder: 0,
  isActive: true,
};

export const EMPTY_NAVIGATION_FORM = {
  label: '',
  description: '',
  itemType: 'link',
  parentId: '',
  icon: 'info',
  linkType: 'product',
  productId: '',
  categoryId: '',
  customUrl: '',
  featuredTitle: '',
  featuredDescription: '',
  featuredImageUrl: '',
  featuredLinkLabel: '',
  featuredLinkType: 'customUrl',
  featuredProductId: '',
  featuredCategoryId: '',
  featuredCustomUrl: '',
  sortOrder: 0,
  isActive: true,
};

const trim = (value) => (typeof value === 'string' ? value.trim() : value);
const asNumber = (value) => (Number.isInteger(Number(value)) ? Number(value) : 0);

export const getCarouselFormValues = (slide) => (
  slide
    ? {
        ...EMPTY_CAROUSEL_FORM,
        title: slide.title || '',
        description: slide.description || '',
        imageUrl: slide.imageUrl || '',
        primaryButtonLabel: slide.primaryButtonLabel || 'Shop now',
        linkType: slide.linkType || slide.linkTarget?.type || 'product',
        productId: slide.productId || slide.linkTarget?.productId || '',
        categoryId: slide.categoryId || slide.linkTarget?.categoryId || '',
        customUrl: slide.customUrl || slide.linkTarget?.customUrl || '',
        sortOrder: slide.sortOrder || 0,
        isActive: slide.isActive !== false,
      }
    : EMPTY_CAROUSEL_FORM
);

const targetField = (prefix, fieldName) => {
  if (!prefix) return fieldName;
  return `${prefix}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
};

const validateLinkTarget = (values, errors, prefix = '') => {
  const linkTypeKey = targetField(prefix, 'linkType');
  const productIdKey = targetField(prefix, 'productId');
  const categoryIdKey = targetField(prefix, 'categoryId');
  const customUrlKey = targetField(prefix, 'customUrl');
  const linkType = values[linkTypeKey];

  if (linkType === 'product' && !values[productIdKey]) {
    errors[productIdKey] = 'Product target is required.';
  }

  if (linkType === 'category' && !values[categoryIdKey]) {
    errors[categoryIdKey] = 'Category target is required.';
  }

  if (linkType === 'customUrl') {
    const customUrl = trim(values[customUrlKey] || '');
    if (!customUrl) {
      errors[customUrlKey] = 'Custom URL is required.';
    } else if (!customUrl.startsWith('/') && !customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
      errors[customUrlKey] = 'Custom URL must start with /, http://, or https://.';
    }
  }
};

export const validateCarouselForm = (values) => {
  const errors = {};
  if (!trim(values.title)) errors.title = 'Title is required.';
  if (values.isActive && !trim(values.imageUrl)) errors.imageUrl = 'Image URL is required for active slides.';
  if (!trim(values.primaryButtonLabel)) errors.primaryButtonLabel = 'Button label is required.';
  validateLinkTarget(values, errors);
  return errors;
};

const normalizedLinkTarget = (values, prefix = '') => {
  const linkTypeKey = targetField(prefix, 'linkType');
  const productIdKey = targetField(prefix, 'productId');
  const categoryIdKey = targetField(prefix, 'categoryId');
  const customUrlKey = targetField(prefix, 'customUrl');
  const linkType = values[linkTypeKey];

  return {
    [linkTypeKey]: linkType,
    [productIdKey]: linkType === 'product' ? values[productIdKey] : null,
    [categoryIdKey]: linkType === 'category' ? values[categoryIdKey] : null,
    [customUrlKey]: linkType === 'customUrl' ? trim(values[customUrlKey] || '') : null,
  };
};

export const createCarouselPayload = (values) => ({
  title: trim(values.title),
  description: trim(values.description || ''),
  imageUrl: trim(values.imageUrl || ''),
  primaryButtonLabel: trim(values.primaryButtonLabel),
  ...normalizedLinkTarget(values),
  sortOrder: asNumber(values.sortOrder),
  isActive: values.isActive !== false,
});

export const getNavigationFormValues = (item) => (
  item
    ? {
        ...EMPTY_NAVIGATION_FORM,
        label: item.label || '',
        description: item.description || '',
        itemType: item.itemType || 'link',
        parentId: item.parentId || '',
        icon: item.icon || 'info',
        linkType: item.linkType || item.linkTarget?.type || 'product',
        productId: item.productId || item.linkTarget?.productId || '',
        categoryId: item.categoryId || item.linkTarget?.categoryId || '',
        customUrl: item.customUrl || item.linkTarget?.customUrl || '',
        featuredTitle: item.featuredTitle || item.featured?.title || '',
        featuredDescription: item.featuredDescription || item.featured?.description || '',
        featuredImageUrl: item.featuredImageUrl || item.featured?.imageUrl || '',
        featuredLinkLabel: item.featuredLinkLabel || item.featured?.linkLabel || '',
        featuredLinkType: item.featuredLinkType || item.featured?.linkTarget?.type || 'customUrl',
        featuredProductId: item.featuredProductId || item.featured?.linkTarget?.productId || '',
        featuredCategoryId: item.featuredCategoryId || item.featured?.linkTarget?.categoryId || '',
        featuredCustomUrl: item.featuredCustomUrl || item.featured?.linkTarget?.customUrl || '',
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive !== false,
      }
    : EMPTY_NAVIGATION_FORM
);

export const validateNavigationForm = (values) => {
  const errors = {};
  if (!trim(values.label)) errors.label = 'Label is required.';
  const isTopLevelMegaMenu = values.itemType === 'mega_menu' && !values.parentId;
  if (!isTopLevelMegaMenu) validateLinkTarget(values, errors);
  if (trim(values.featuredLinkLabel || '') || trim(values.featuredTitle || '')) {
    validateLinkTarget(values, errors, 'featured');
  }
  return errors;
};

export const createNavigationPayload = (values) => {
  const isTopLevelMegaMenu = values.itemType === 'mega_menu' && !values.parentId;
  const linkTarget = isTopLevelMegaMenu
    ? { linkType: null, productId: null, categoryId: null, customUrl: null }
    : normalizedLinkTarget(values);

  return {
    label: trim(values.label),
    description: trim(values.description || ''),
    itemType: values.itemType,
    parentId: values.parentId || null,
    icon: values.icon || '',
    ...linkTarget,
    featuredTitle: trim(values.featuredTitle || ''),
    featuredDescription: trim(values.featuredDescription || ''),
    featuredImageUrl: trim(values.featuredImageUrl || ''),
    featuredLinkLabel: trim(values.featuredLinkLabel || ''),
    ...normalizedLinkTarget(values, 'featured'),
    sortOrder: asNumber(values.sortOrder),
    isActive: values.isActive !== false,
  };
};
```

- [ ] **Step 4: Add shared link fields**

Create `frontend/src/components/admin/storefront/LinkTargetFields.jsx`:

```jsx
import React from 'react';
import { FormLayout, Selector, TextInput } from '@astryxdesign/core';
import { LINK_TYPE_OPTIONS } from './storefrontFormUtils';

const toProductOptions = (products) => products.map((product) => ({
  value: product.id,
  label: product.name || product.title || product.id,
}));

const toCategoryOptions = (categories) => categories.map((category) => ({
  value: category.id,
  label: category.name || category.id,
}));

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

export const LinkTargetFields = ({
  categories,
  errors,
  fieldPrefix = '',
  products,
  updateField,
  values,
}) => {
  const toFieldName = (fieldName) => {
    if (!fieldPrefix) return fieldName;
    return `${fieldPrefix}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
  };
  const linkTypeKey = toFieldName('linkType');
  const productIdKey = toFieldName('productId');
  const categoryIdKey = toFieldName('categoryId');
  const customUrlKey = toFieldName('customUrl');
  const linkType = values[linkTypeKey];

  return (
    <FormLayout>
      <Selector
        label={fieldPrefix ? 'Featured link type' : 'Link type'}
        options={LINK_TYPE_OPTIONS}
        value={linkType}
        onChange={(value) => updateField(linkTypeKey, value)}
        width="100%"
      />
      {linkType === 'product' && (
        <Selector
          label="Product target"
          options={toProductOptions(products)}
          value={values[productIdKey] || undefined}
          onChange={(value) => updateField(productIdKey, value)}
          placeholder="Select product"
          status={fieldStatus(errors[productIdKey])}
          width="100%"
        />
      )}
      {linkType === 'category' && (
        <Selector
          label="Category target"
          options={toCategoryOptions(categories)}
          value={values[categoryIdKey] || undefined}
          onChange={(value) => updateField(categoryIdKey, value)}
          placeholder="Select category"
          status={fieldStatus(errors[categoryIdKey])}
          width="100%"
        />
      )}
      {linkType === 'customUrl' && (
        <TextInput
          label="Custom URL"
          value={values[customUrlKey]}
          onChange={(value) => updateField(customUrlKey, value)}
          placeholder="/products or https://example.com"
          status={fieldStatus(errors[customUrlKey])}
          width="100%"
        />
      )}
    </FormLayout>
  );
};

export default LinkTargetFields;
```

- [ ] **Step 5: Run form utility tests**

Run:

```powershell
cd frontend
node src/components/admin/storefront/storefrontFormUtils.test.js
```

Expected: PASS.

- [ ] **Step 6: Commit Task 6**

```powershell
git add frontend/src/components/admin/storefront/storefrontFormUtils.js frontend/src/components/admin/storefront/storefrontFormUtils.test.js frontend/src/components/admin/storefront/LinkTargetFields.jsx
git commit -m "feat: add storefront admin form helpers"
```

---

### Task 7: Admin Storefront Manager UI And Routing

**Files:**
- Create: `frontend/src/components/admin/storefront/CarouselSlideForm.jsx`
- Create: `frontend/src/components/admin/storefront/CarouselSlideTable.jsx`
- Create: `frontend/src/components/admin/storefront/NavigationItemForm.jsx`
- Create: `frontend/src/components/admin/storefront/NavigationItemTable.jsx`
- Create: `frontend/src/views/admin/AdminStorefrontView.jsx`
- Create: `frontend/src/views/admin/AdminStorefrontView.structure.test.js`
- Modify: `frontend/src/layouts/AdminLayout.jsx`
- Modify: `frontend/src/routes/AppRoutes.jsx`

- [ ] **Step 1: Write the failing admin structure test**

Create `frontend/src/views/admin/AdminStorefrontView.structure.test.js`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./AdminStorefrontView.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../../layouts/AdminLayout.jsx', import.meta.url), 'utf8');
const carouselFormSource = readFileSync(new URL('../../components/admin/storefront/CarouselSlideForm.jsx', import.meta.url), 'utf8');
const navigationFormSource = readFileSync(new URL('../../components/admin/storefront/NavigationItemForm.jsx', import.meta.url), 'utf8');
const linkFieldsSource = readFileSync(new URL('../../components/admin/storefront/LinkTargetFields.jsx', import.meta.url), 'utf8');

test('AdminStorefrontView loads carousel navigation products and categories', () => {
  assert.match(viewSource, /<Heading level=\{1\}>Storefront<\/Heading>/);
  assert.match(viewSource, /<TabList/);
  assert.match(viewSource, /<Tab value="carousel" label="Carousel" \/>/);
  assert.match(viewSource, /<Tab value="navigation" label="Navigation" \/>/);
  assert.match(viewSource, /storefrontContentApi\.getAdminCarousel\(\)/);
  assert.match(viewSource, /storefrontContentApi\.getAdminNavigation\(\)/);
  assert.match(viewSource, /productApi\.getProducts\(\{ page: 1, limit: 100 \}\)/);
  assert.match(viewSource, /categoryApi\.getCategories\(\)/);
  assert.match(viewSource, /<CarouselSlideTable/);
  assert.match(viewSource, /<NavigationItemTable/);
});

test('admin storefront route and side nav are protected by the admin layout', () => {
  assert.match(routesSource, /import AdminStorefrontView from '\.\.\/views\/admin\/AdminStorefrontView';/);
  assert.match(
    routesSource,
    /<Route element=\{<AdminRoute \/>\}>[\s\S]*?<Route element=\{<AdminLayout \/>\}>[\s\S]*?<Route path="\/admin\/storefront" element=\{<AdminStorefrontView \/>\} \/>/
  );
  assert.match(layoutSource, /label="Storefront"/);
  assert.match(layoutSource, /href="\/admin\/storefront"/);
  assert.match(layoutSource, /location\.pathname\.startsWith\('\/admin\/storefront'\)/);
});

test('storefront forms use product and category selectors instead of pasted internal URLs', () => {
  assert.match(carouselFormSource, /<LinkTargetFields/);
  assert.match(navigationFormSource, /<LinkTargetFields/);
  assert.match(linkFieldsSource, /label="Product target"/);
  assert.match(linkFieldsSource, /label="Category target"/);
  assert.match(linkFieldsSource, /placeholder="Select product"/);
  assert.match(linkFieldsSource, /placeholder="Select category"/);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
cd frontend
node src/views/admin/AdminStorefrontView.structure.test.js
```

Expected: FAIL because the admin view and route do not exist.

- [ ] **Step 3: Add `CarouselSlideTable.jsx`**

Create `frontend/src/components/admin/storefront/CarouselSlideTable.jsx`:

```jsx
import React, { useMemo } from 'react';
import { Badge, Button, HStack, MoreMenu, Text, VStack, pixel, proportional } from '@astryxdesign/core';
import AdminTable from '../AdminTable';
import { describeLinkTarget } from '../../storefront/storefrontLinkUtils';

export const CarouselSlideTable = ({
  error,
  isDeleting,
  isLoading,
  onCreate,
  onDelete,
  onEdit,
  onRetry,
  onToggleActive,
  slides,
}) => {
  const columns = useMemo(() => [
    {
      key: 'order',
      header: 'Order',
      width: pixel(80),
      renderCell: (slide) => <Text hasTabularNumbers>{slide.sortOrder}</Text>,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(110),
      renderCell: (slide) => (
        <Badge variant={slide.isActive ? 'green' : 'gray'} label={slide.isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      key: 'slide',
      header: 'Slide',
      width: proportional(2),
      renderCell: (slide) => (
        <VStack gap={0.5}>
          <Text weight="semibold">{slide.title}</Text>
          <Text type="supporting">{slide.description || 'No description'}</Text>
        </VStack>
      ),
    },
    {
      key: 'target',
      header: 'Link target',
      width: proportional(1.4),
      renderCell: (slide) => describeLinkTarget({
        type: slide.linkType,
        productId: slide.productId,
        categoryId: slide.categoryId,
        customUrl: slide.customUrl,
      }),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(120),
      align: 'end',
      renderCell: (slide) => (
        <MoreMenu
          label={`Actions for ${slide.title}`}
          isDisabled={isDeleting}
          items={[
            { label: 'Edit', onClick: () => onEdit(slide) },
            { label: slide.isActive ? 'Deactivate' : 'Activate', onClick: () => onToggleActive(slide) },
            { label: 'Delete', onClick: () => onDelete(slide) },
          ]}
        />
      ),
    },
  ], [isDeleting, onDelete, onEdit, onToggleActive]);

  return (
    <AdminTable
      columns={columns}
      data={slides}
      isLoading={isLoading}
      error={error}
      errorTitle="Unable to load carousel slides"
      onRetry={onRetry}
      emptyTitle="No carousel slides yet"
      emptyDescription="Create the first slide to publish homepage carousel content."
      emptyActions={(
        <HStack gap={2}>
          <Button label="Create slide" variant="primary" onClick={onCreate} />
        </HStack>
      )}
    />
  );
};

export default CarouselSlideTable;
```

- [ ] **Step 4: Add `CarouselSlideForm.jsx`**

Create `frontend/src/components/admin/storefront/CarouselSlideForm.jsx`:

```jsx
import React, { useEffect, useId, useState } from 'react';
import {
  Button,
  Dialog,
  DialogHeader,
  FormLayout,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  NumberInput,
  Switch,
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../../common/Alert';
import LinkTargetFields from './LinkTargetFields';
import {
  createCarouselPayload,
  getCarouselFormValues,
  validateCarouselForm
} from './storefrontFormUtils';

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

export const CarouselSlideForm = ({
  categories,
  isOpen,
  onOpenChange,
  onSubmit,
  products,
  slide,
}) => {
  const formId = useId();
  const [values, setValues] = useState(() => getCarouselFormValues(slide));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(getCarouselFormValues(slide));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, slide]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCarouselForm(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(createCarouselPayload(values));
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error?.message || 'Unable to save the carousel slide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={720}>
      <Layout
        header={(
          <DialogHeader
            title={slide ? 'Edit carousel slide' : 'Create carousel slide'}
            subtitle="Saved active slides publish immediately."
            onOpenChange={onOpenChange}
            hasDivider
          />
        )}
        content={(
          <LayoutContent isScrollable>
            <form id={formId} onSubmit={handleSubmit}>
              <VStack gap={4}>
                {submitError && <Alert title="Unable to save slide" description={submitError} />}
                <FormLayout>
                  <TextInput label="Title" value={values.title} onChange={(value) => updateField('title', value)} status={fieldStatus(errors.title)} isRequired width="100%" />
                  <TextArea label="Description" value={values.description} onChange={(value) => updateField('description', value)} rows={3} isOptional width="100%" />
                  <TextInput label="Image URL" value={values.imageUrl} onChange={(value) => updateField('imageUrl', value)} status={fieldStatus(errors.imageUrl)} placeholder="https://example.com/hero.jpg" isRequired={values.isActive} width="100%" />
                  <TextInput label="Button label" value={values.primaryButtonLabel} onChange={(value) => updateField('primaryButtonLabel', value)} status={fieldStatus(errors.primaryButtonLabel)} isRequired width="100%" />
                  <NumberInput label="Sort order" value={values.sortOrder} onChange={(value) => updateField('sortOrder', value)} step={1} isIntegerOnly width="100%" />
                  <Switch label="Active" value={values.isActive} onChange={(checked) => updateField('isActive', checked)} />
                </FormLayout>
                <LinkTargetFields
                  categories={categories}
                  errors={errors}
                  products={products}
                  updateField={updateField}
                  values={values}
                />
              </VStack>
            </form>
          </LayoutContent>
        )}
        footer={(
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} isDisabled={isSubmitting} />
              <Button label={slide ? 'Save changes' : 'Create slide'} type="submit" form={formId} variant="primary" isLoading={isSubmitting} />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default CarouselSlideForm;
```

- [ ] **Step 5: Add `NavigationItemTable.jsx`**

Create `frontend/src/components/admin/storefront/NavigationItemTable.jsx`:

```jsx
import React, { useMemo } from 'react';
import { Badge, Button, HStack, MoreMenu, Text, VStack, pixel, proportional } from '@astryxdesign/core';
import AdminTable from '../AdminTable';
import { describeLinkTarget } from '../../storefront/storefrontLinkUtils';

const getDisplayRows = (items) => {
  const topLevel = items.filter((item) => !item.parentId);
  const childrenByParentId = new Map();
  items.filter((item) => item.parentId).forEach((item) => {
    const children = childrenByParentId.get(item.parentId) || [];
    children.push({ ...item, label: `- ${item.label}` });
    childrenByParentId.set(item.parentId, children);
  });

  return topLevel.flatMap((item) => [item, ...(childrenByParentId.get(item.id) || [])]);
};

export const NavigationItemTable = ({
  error,
  isDeleting,
  isLoading,
  items,
  onCreate,
  onCreateChild,
  onDelete,
  onEdit,
  onRetry,
  onToggleActive,
}) => {
  const rows = useMemo(() => getDisplayRows(items), [items]);
  const columns = useMemo(() => [
    {
      key: 'order',
      header: 'Order',
      width: pixel(80),
      renderCell: (item) => <Text hasTabularNumbers>{item.sortOrder}</Text>,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(110),
      renderCell: (item) => (
        <Badge variant={item.isActive ? 'green' : 'gray'} label={item.isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      key: 'label',
      header: 'Navigation item',
      width: proportional(2),
      renderCell: (item) => (
        <VStack gap={0.5}>
          <Text weight={item.parentId ? undefined : 'semibold'}>{item.label}</Text>
          <Text type="supporting">{item.itemType === 'mega_menu' ? 'Mega menu' : describeLinkTarget({ type: item.linkType, productId: item.productId, categoryId: item.categoryId, customUrl: item.customUrl })}</Text>
        </VStack>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: pixel(120),
      align: 'end',
      renderCell: (item) => (
        <MoreMenu
          label={`Actions for ${item.label}`}
          isDisabled={isDeleting}
          items={[
            { label: 'Edit', onClick: () => onEdit(item) },
            ...(item.itemType === 'mega_menu' && !item.parentId ? [{ label: 'Add child link', onClick: () => onCreateChild(item) }] : []),
            { label: item.isActive ? 'Deactivate' : 'Activate', onClick: () => onToggleActive(item) },
            { label: 'Delete', onClick: () => onDelete(item) },
          ]}
        />
      ),
    },
  ], [isDeleting, onCreateChild, onDelete, onEdit, onToggleActive]);

  return (
    <AdminTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      error={error}
      errorTitle="Unable to load storefront navigation"
      onRetry={onRetry}
      emptyTitle="No navigation items yet"
      emptyDescription="Create top-level links or mega menus for the storefront."
      emptyActions={(
        <HStack gap={2}>
          <Button label="Create navigation item" variant="primary" onClick={onCreate} />
        </HStack>
      )}
    />
  );
};

export default NavigationItemTable;
```

- [ ] **Step 6: Add `NavigationItemForm.jsx`**

Create `frontend/src/components/admin/storefront/NavigationItemForm.jsx`:

```jsx
import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogHeader,
  FormLayout,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  NumberInput,
  Selector,
  Switch,
  TextArea,
  TextInput,
  VStack
} from '@astryxdesign/core';
import Alert from '../../common/Alert';
import LinkTargetFields from './LinkTargetFields';
import {
  NAV_ICON_OPTIONS,
  NAV_ITEM_TYPE_OPTIONS,
  createNavigationPayload,
  getNavigationFormValues,
  validateNavigationForm
} from './storefrontFormUtils';

const fieldStatus = (message) => (
  message ? { type: 'error', message } : undefined
);

export const NavigationItemForm = ({
  categories,
  isOpen,
  item,
  onOpenChange,
  onSubmit,
  parentOptions,
  products,
}) => {
  const formId = useId();
  const [values, setValues] = useState(() => getNavigationFormValues(item));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues(getNavigationFormValues(item));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, item]);

  const parentSelectorOptions = useMemo(
    () => parentOptions.map((parent) => ({
      label: parent.label,
      value: parent.id,
    })),
    [parentOptions]
  );

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateNavigationForm(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(createNavigationPayload(values));
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error?.message || 'Unable to save the navigation item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTopLevelMegaMenu = values.itemType === 'mega_menu' && !values.parentId;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={760}>
      <Layout
        header={(
          <DialogHeader
            title={item?.id ? 'Edit navigation item' : 'Create navigation item'}
            subtitle="Saved active items publish immediately."
            onOpenChange={onOpenChange}
            hasDivider
          />
        )}
        content={(
          <LayoutContent isScrollable>
            <form id={formId} onSubmit={handleSubmit}>
              <VStack gap={4}>
                {submitError && <Alert title="Unable to save navigation item" description={submitError} />}
                <FormLayout>
                  <Selector
                    label="Item type"
                    options={NAV_ITEM_TYPE_OPTIONS}
                    value={values.itemType}
                    onChange={(value) => updateField('itemType', value)}
                    width="100%"
                    isDisabled={Boolean(values.parentId)}
                  />
                  <Selector
                    label="Parent mega menu"
                    options={parentSelectorOptions}
                    value={values.parentId || undefined}
                    onChange={(value) => updateField('parentId', value || '')}
                    placeholder="Top-level item"
                    width="100%"
                  />
                  <TextInput
                    label="Label"
                    value={values.label}
                    onChange={(value) => updateField('label', value)}
                    status={fieldStatus(errors.label)}
                    isRequired
                    width="100%"
                  />
                  <TextArea
                    label="Description"
                    value={values.description}
                    onChange={(value) => updateField('description', value)}
                    rows={3}
                    isOptional
                    width="100%"
                  />
                  <Selector
                    label="Icon"
                    options={NAV_ICON_OPTIONS}
                    value={values.icon}
                    onChange={(value) => updateField('icon', value)}
                    width="100%"
                  />
                  <NumberInput
                    label="Sort order"
                    value={values.sortOrder}
                    onChange={(value) => updateField('sortOrder', value)}
                    step={1}
                    isIntegerOnly
                    width="100%"
                  />
                  <Switch
                    label="Active"
                    value={values.isActive}
                    onChange={(checked) => updateField('isActive', checked)}
                  />
                </FormLayout>
                {!isTopLevelMegaMenu && (
                  <LinkTargetFields
                    categories={categories}
                    errors={errors}
                    products={products}
                    updateField={updateField}
                    values={values}
                  />
                )}
                {isTopLevelMegaMenu && (
                  <VStack gap={4}>
                    <TextInput label="Featured title" value={values.featuredTitle} onChange={(value) => updateField('featuredTitle', value)} width="100%" />
                    <TextArea label="Featured description" value={values.featuredDescription} onChange={(value) => updateField('featuredDescription', value)} rows={3} isOptional width="100%" />
                    <TextInput label="Featured image URL" value={values.featuredImageUrl} onChange={(value) => updateField('featuredImageUrl', value)} width="100%" />
                    <TextInput label="Featured link label" value={values.featuredLinkLabel} onChange={(value) => updateField('featuredLinkLabel', value)} width="100%" />
                    <LinkTargetFields
                      categories={categories}
                      errors={errors}
                      fieldPrefix="featured"
                      products={products}
                      updateField={updateField}
                      values={values}
                    />
                  </VStack>
                )}
              </VStack>
            </form>
          </LayoutContent>
        )}
        footer={(
          <LayoutFooter hasDivider>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} isDisabled={isSubmitting} />
              <Button label={item?.id ? 'Save changes' : 'Create navigation item'} type="submit" form={formId} variant="primary" isLoading={isSubmitting} />
            </HStack>
          </LayoutFooter>
        )}
      />
    </Dialog>
  );
};

export default NavigationItemForm;
```

- [ ] **Step 7: Add `AdminStorefrontView.jsx`**

Create `frontend/src/views/admin/AdminStorefrontView.jsx`:

```jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertDialog,
  Button,
  Heading,
  HStack,
  Tab,
  TabList,
  Text,
  Toolbar,
  VStack
} from '@astryxdesign/core';
import { categoryApi } from '../../api/categoryApi';
import { productApi } from '../../api/productApi';
import { storefrontContentApi } from '../../api/storefrontContentApi';
import CarouselSlideForm from '../../components/admin/storefront/CarouselSlideForm';
import CarouselSlideTable from '../../components/admin/storefront/CarouselSlideTable';
import NavigationItemForm from '../../components/admin/storefront/NavigationItemForm';
import NavigationItemTable from '../../components/admin/storefront/NavigationItemTable';
import Alert from '../../components/common/Alert';

export const AdminStorefrontView = () => {
  const [activeTab, setActiveTab] = useState('carousel');
  const [slides, setSlides] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [editingNavItem, setEditingNavItem] = useState(null);
  const [childParent, setChildParent] = useState(null);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [isNavFormOpen, setIsNavFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadStorefront = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [slideResponse, navResponse, productResponse, categoryResponse] = await Promise.all([
        storefrontContentApi.getAdminCarousel(),
        storefrontContentApi.getAdminNavigation(),
        productApi.getProducts({ page: 1, limit: 100 }),
        categoryApi.getCategories(),
      ]);
      setSlides(slideResponse?.data?.slides || []);
      setNavItems(navResponse?.data?.items || []);
      setProducts(productResponse?.data?.items || []);
      setCategories(categoryResponse?.data?.categories || []);
    } catch (error) {
      setSlides([]);
      setNavItems([]);
      setProducts([]);
      setCategories([]);
      setLoadError(error?.message || 'Unable to load storefront content.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStorefront();
  }, [loadStorefront]);

  const topLevelMegaMenus = useMemo(
    () => navItems.filter((item) => !item.parentId && item.itemType === 'mega_menu'),
    [navItems]
  );

  const openCreateSlide = () => {
    setEditingSlide(null);
    setIsSlideFormOpen(true);
  };

  const openCreateNavItem = () => {
    setEditingNavItem(null);
    setChildParent(null);
    setIsNavFormOpen(true);
  };

  const openCreateChild = (parent) => {
    setEditingNavItem({ parentId: parent.id, itemType: 'link' });
    setChildParent(parent);
    setIsNavFormOpen(true);
  };

  const saveSlide = async (payload) => {
    if (editingSlide?.id) {
      await storefrontContentApi.updateCarouselSlide(editingSlide.id, payload);
      setFeedback({ title: 'Slide updated', description: `${payload.title} was updated.` });
    } else {
      await storefrontContentApi.createCarouselSlide(payload);
      setFeedback({ title: 'Slide created', description: `${payload.title} was created.` });
    }
    await loadStorefront();
  };

  const saveNavItem = async (payload) => {
    const nextPayload = childParent ? { ...payload, parentId: childParent.id, itemType: 'link' } : payload;
    if (editingNavItem?.id) {
      await storefrontContentApi.updateNavigationItem(editingNavItem.id, nextPayload);
      setFeedback({ title: 'Navigation item updated', description: `${nextPayload.label} was updated.` });
    } else {
      await storefrontContentApi.createNavigationItem(nextPayload);
      setFeedback({ title: 'Navigation item created', description: `${nextPayload.label} was created.` });
    }
    await loadStorefront();
  };

  const toggleSlideActive = async (slide) => {
    await storefrontContentApi.updateCarouselSlide(slide.id, { ...slide, isActive: !slide.isActive });
    await loadStorefront();
  };

  const toggleNavActive = async (item) => {
    await storefrontContentApi.updateNavigationItem(item.id, { ...item, isActive: !item.isActive });
    await loadStorefront();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === 'slide') {
        await storefrontContentApi.deleteCarouselSlide(deleteTarget.item.id);
      } else {
        await storefrontContentApi.deleteNavigationItem(deleteTarget.item.id);
      }
      setDeleteTarget(null);
      setFeedback({ title: 'Storefront content deleted', description: 'The item was removed from storefront configuration.' });
      await loadStorefront();
    } catch (error) {
      setFeedback({ title: 'Unable to delete item', description: error?.message || 'The storefront item could not be deleted.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <VStack gap={6} width="100%">
      <HStack gap={4} align="center" justify="between" wrap="wrap" width="100%">
        <VStack gap={1}>
          <Heading level={1}>Storefront</Heading>
          <Text color="secondary">Manage homepage carousel slides and customer navigation.</Text>
        </VStack>
        <Button label="Refresh" variant="secondary" onClick={loadStorefront} isDisabled={isLoading} />
      </HStack>

      {feedback && <Alert title={feedback.title} description={feedback.description} />}

      <TabList value={activeTab} onChange={setActiveTab} aria-label="Storefront sections">
        <Tab value="carousel" label="Carousel" />
        <Tab value="navigation" label="Navigation" />
      </TabList>

      {activeTab === 'carousel' && (
        <VStack gap={4}>
          <Toolbar label="Carousel manager" endContent={<Button label="Create slide" variant="primary" onClick={openCreateSlide} />} />
          <CarouselSlideTable
            slides={slides}
            isLoading={isLoading}
            error={loadError}
            isDeleting={isDeleting}
            onCreate={openCreateSlide}
            onEdit={(slide) => { setEditingSlide(slide); setIsSlideFormOpen(true); }}
            onToggleActive={toggleSlideActive}
            onDelete={(slide) => setDeleteTarget({ kind: 'slide', item: slide })}
            onRetry={loadStorefront}
          />
        </VStack>
      )}

      {activeTab === 'navigation' && (
        <VStack gap={4}>
          <Toolbar label="Navigation manager" endContent={<Button label="Create navigation item" variant="primary" onClick={openCreateNavItem} />} />
          <NavigationItemTable
            items={navItems}
            isLoading={isLoading}
            error={loadError}
            isDeleting={isDeleting}
            onCreate={openCreateNavItem}
            onCreateChild={openCreateChild}
            onEdit={(item) => { setEditingNavItem(item); setChildParent(null); setIsNavFormOpen(true); }}
            onToggleActive={toggleNavActive}
            onDelete={(item) => setDeleteTarget({ kind: 'nav', item })}
            onRetry={loadStorefront}
          />
        </VStack>
      )}

      <CarouselSlideForm
        categories={categories}
        isOpen={isSlideFormOpen}
        onOpenChange={setIsSlideFormOpen}
        onSubmit={saveSlide}
        products={products}
        slide={editingSlide}
      />
      <NavigationItemForm
        categories={categories}
        isOpen={isNavFormOpen}
        items={navItems}
        onOpenChange={setIsNavFormOpen}
        onSubmit={saveNavItem}
        parentOptions={topLevelMegaMenus}
        products={products}
        item={editingNavItem}
      />
      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setDeleteTarget(null);
        }}
        title="Delete storefront item?"
        description={deleteTarget ? `${deleteTarget.item.label || deleteTarget.item.title} will be removed from storefront configuration.` : 'This item will be removed.'}
        actionLabel="Delete item"
        isActionLoading={isDeleting}
        onAction={confirmDelete}
      />
    </VStack>
  );
};

export default AdminStorefrontView;
```

- [ ] **Step 8: Wire route and admin side nav**

Modify `frontend/src/routes/AppRoutes.jsx`:

```jsx
import AdminStorefrontView from '../views/admin/AdminStorefrontView';
```

Add under the existing admin routes:

```jsx
<Route path="/admin/storefront" element={<AdminStorefrontView />} />
```

Modify `frontend/src/layouts/AdminLayout.jsx`:

Import a suitable existing icon:

```jsx
  AdminIcon,
```

Add a side-nav item after `Dashboard`:

```jsx
<SideNavItem
  label="Storefront"
  href="/admin/storefront"
  icon={<AdminIcon />}
  as={Link}
  isSelected={location.pathname.startsWith('/admin/storefront')}
/>
```

- [ ] **Step 9: Run admin UI tests**

Run:

```powershell
cd frontend
node src/components/admin/storefront/storefrontFormUtils.test.js
node src/views/admin/AdminStorefrontView.structure.test.js
```

Expected: PASS.

- [ ] **Step 10: Commit Task 7**

```powershell
git add frontend/src/components/admin/storefront frontend/src/views/admin/AdminStorefrontView.jsx frontend/src/views/admin/AdminStorefrontView.structure.test.js frontend/src/layouts/AdminLayout.jsx frontend/src/routes/AppRoutes.jsx
git commit -m "feat: add storefront admin manager"
```

---

### Task 8: Full Verification And Manual Smoke

**Files:**
- Modify if stale: `README.md`
- Modify if stale: `docs/demo-checklist.md`

- [ ] **Step 1: Run backend verification**

Run:

```powershell
cd backend
node --test src/models/storefrontContent.model.test.js src/controllers/storefrontContent.controller.test.js src/models/report.model.test.js src/controllers/report.controller.test.js
```

Expected: PASS.

- [ ] **Step 2: Run frontend focused verification**

Run:

```powershell
cd frontend
node src/api/storefrontContentApi.test.js
node src/components/storefront/storefrontLinkUtils.test.js
node src/components/home/HomeHero.structure.test.js
node src/components/layout/StorefrontMegaNav.structure.test.js
node src/components/admin/storefront/storefrontFormUtils.test.js
node src/views/admin/AdminStorefrontView.structure.test.js
node src/views/responsiveDemoRoutes.structure.test.js
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```powershell
cd frontend
npm run build
```

Expected: Vite build exits 0.

- [ ] **Step 4: Run backend app smoke with local server**

Start backend:

```powershell
cd backend
npm run dev
```

In another PowerShell:

```powershell
$baseUrl = 'http://localhost:5000/api'
Invoke-RestMethod "$baseUrl/storefront/carousel"
Invoke-RestMethod "$baseUrl/storefront/navigation"
```

Expected: both public endpoints return `success = true` with `data.slides` and `data.items`.

- [ ] **Step 5: Manual admin smoke**

Run frontend:

```powershell
cd frontend
npm run dev
```

Manual checks in browser:

```text
1. Sign in as admin@example.com / admin123.
2. Open http://localhost:5173/admin/storefront.
3. Create a carousel slide linked to a product from the product selector.
4. Open http://localhost:5173/ and confirm the carousel CTA opens /products/:id.
5. Create a carousel slide linked to a category from the category selector.
6. Confirm the carousel CTA opens /products?categoryId=:id.
7. Create a simple navigation link and confirm it appears in the storefront top nav.
8. Create a mega menu, then create a child link under it, and confirm the child appears in the storefront mega menu.
9. Deactivate a slide or nav item and confirm it disappears from the public storefront without deleting the admin row.
10. Change sort order values and confirm public order follows the saved order.
```

- [ ] **Step 6: Update docs only if they are stale**

If the README admin feature list does not mention storefront content management, add one concise bullet under `Admin features`. If `docs/demo-checklist.md` has a current demo checklist section, add manual smoke evidence after completing Step 5.

Use this README wording:

```md
- Manage storefront carousel slides and customer navigation links from the admin Storefront page.
```

Use this demo checklist row only after manual smoke passes:

```md
| Admin storefront content manager | Passed - user verified | Admin created product/category-linked carousel slides, simple nav links, mega-menu child links, inactive toggles, and sort-order changes from `/admin/storefront`. |
```

- [ ] **Step 7: Check full diff and formatting**

Run:

```powershell
git diff --check
git status --short
```

Expected: `git diff --check` exits 0. `git status --short` contains only files related to storefront content manager plus any pre-existing unrelated user changes.

- [ ] **Step 8: Final commit**

```powershell
git add backend frontend README.md docs/demo-checklist.md
git commit -m "feat: add storefront content manager"
```

If README or `docs/demo-checklist.md` were not changed, omit them from `git add`.

---

## Final Acceptance Checklist

- [ ] `GET /api/storefront/carousel` returns active, sorted slides only.
- [ ] `GET /api/storefront/navigation` returns active, sorted top-level nav items and children only.
- [ ] Admin storefront endpoints require admin authentication.
- [ ] Admin can create, edit, delete, activate/deactivate carousel slides.
- [ ] Admin can create, edit, delete, activate/deactivate top-level simple nav items.
- [ ] Admin can create, edit, delete, activate/deactivate mega menus and child links.
- [ ] Product/category link targets are selected from existing records.
- [ ] Custom URLs still work for special internal or external links.
- [ ] Homepage carousel no longer derives slides from the first products.
- [ ] Storefront navigation no longer uses hardcoded shop/brand arrays.
- [ ] Inactive or broken product/category targets are hidden from public storefront output.
- [ ] Deleting storefront content does not delete products or categories.
- [ ] Focused backend tests pass.
- [ ] Focused frontend tests pass.
- [ ] `npm run build` passes in `frontend`.
