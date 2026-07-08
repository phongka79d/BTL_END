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
