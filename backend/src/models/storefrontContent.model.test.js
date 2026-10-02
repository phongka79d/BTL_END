const assert = require('node:assert/strict');
const { after, beforeEach, test } = require('node:test');

const databasePath = require.resolve('../config/database');
const originalDatabaseModule = require.cache[databasePath];

const prisma = {
  $transaction: async () => {
    throw new Error('Unexpected $transaction call');
  },
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
    // Mặc định: không có mục trùng nhãn và không có mục con.
    findFirst: async () => null,
    count: async () => 0,
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
  storefrontFeaturedProduct: {
    findMany: async () => {
      throw new Error('Unexpected storefrontFeaturedProduct.findMany call');
    },
    findUnique: async () => {
      throw new Error('Unexpected storefrontFeaturedProduct.findUnique call');
    },
    create: async () => {
      throw new Error('Unexpected storefrontFeaturedProduct.create call');
    },
    update: async () => {
      throw new Error('Unexpected storefrontFeaturedProduct.update call');
    },
    delete: async () => {
      throw new Error('Unexpected storefrontFeaturedProduct.delete call');
    },
  },
  storefrontSetting: {
    findUnique: async () => {
      throw new Error('Unexpected storefrontSetting.findUnique call');
    },
    upsert: async () => {
      throw new Error('Unexpected storefrontSetting.upsert call');
    },
  },
  product: {
    findUnique: async () => {
      throw new Error('Unexpected product.findUnique call');
    },
    findMany: async () => {
      throw new Error('Unexpected product.findMany call');
    },
  },
  review: {
    groupBy: async () => {
      throw new Error('Unexpected review.groupBy call');
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
  prisma.product.findMany = async () => [];
  prisma.review.groupBy = async () => [];
  prisma.category.findUnique = async () => null;
  prisma.carouselSlide.findMany = async () => [];
  prisma.storefrontNavItem.findMany = async () => [];
  prisma.storefrontNavItem.findUnique = async () => null;
  prisma.storefrontFeaturedProduct.findMany = async () => [];
  prisma.storefrontFeaturedProduct.findUnique = async () => null;
  prisma.storefrontSetting.findUnique = async () => null;
  prisma.$transaction = async () => {
    throw new Error('Unexpected $transaction call');
  };
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
    /Không tìm thấy đích liên kết sản phẩm/
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
    /URL tùy chỉnh phải bắt đầu/
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
      {
        id: 'slide-category',
        title: 'Phone deals',
        description: 'Latest phone offers',
        imageUrl: 'https://example.com/phones.jpg',
        primaryButtonLabel: 'Shop phones',
        linkType: 'category',
        productId: null,
        categoryId: 'category-1',
        customUrl: null,
        product: null,
        category: { id: 'category-1', name: 'Phones' },
        sortOrder: 3,
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
    {
      id: 'slide-category',
      title: 'Phone deals',
      description: 'Latest phone offers',
      imageUrl: 'https://example.com/phones.jpg',
      primaryButtonLabel: 'Shop phones',
      linkTarget: {
        type: 'category',
        productId: null,
        categoryId: 'category-1',
        customUrl: null,
      },
      sortOrder: 3,
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

test('createNavigationItem allows simple links without featured card data', async () => {
  prisma.product.findUnique = async (query) => {
    assert.deepEqual(query, { where: { id: 'product-1' }, select: { id: true } });
    return { id: 'product-1' };
  };

  prisma.storefrontNavItem.create = async (query) => {
    assert.deepEqual(query, {
      data: {
        parentId: null,
        label: 'Products',
        description: null,
        itemType: 'link',
        icon: 'info',
        linkType: 'product',
        productId: 'product-1',
        categoryId: null,
        customUrl: null,
        featuredTitle: null,
        featuredDescription: null,
        featuredImageUrl: null,
        featuredLinkLabel: null,
        featuredLinkType: null,
        featuredProductId: null,
        featuredCategoryId: null,
        featuredCustomUrl: null,
        sortOrder: 1,
        isActive: true,
      },
    });
    return { id: 'nav-products', ...query.data };
  };

  const result = await storefrontContentModel.createNavigationItem({
    label: 'Products',
    itemType: 'link',
    icon: 'info',
    linkType: 'product',
    productId: 'product-1',
    featuredLinkType: 'customUrl',
    featuredCustomUrl: '',
    sortOrder: 1,
    isActive: true,
  });

  assert.equal(result.id, 'nav-products');
});

test('createNavigationItem allows top-level mega menus without featured card data', async () => {
  prisma.storefrontNavItem.create = async (query) => {
    assert.equal(query.data.itemType, 'mega_menu');
    assert.equal(query.data.linkType, null);
    assert.equal(query.data.featuredLinkType, null);
    assert.equal(query.data.featuredCustomUrl, null);
    return { id: 'nav-shop', ...query.data };
  };

  const result = await storefrontContentModel.createNavigationItem({
    label: 'Shop',
    itemType: 'mega_menu',
    featuredLinkType: 'customUrl',
    featuredCustomUrl: '',
    sortOrder: 1,
    isActive: true,
  });

  assert.equal(result.id, 'nav-shop');
});

test('findPublicFeaturedProducts returns active configured products capped by storefront settings', async () => {
  prisma.storefrontSetting.findUnique = async (query) => {
    assert.deepEqual(query, {
      where: { id: 'home' },
      select: { featuredProductLimit: true },
    });
    return { featuredProductLimit: 2 };
  };

  prisma.storefrontFeaturedProduct.findMany = async (query) => {
    assert.deepEqual(query, {
      where: { isActive: true },
      take: 2,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return [
      {
        id: 'featured-1',
        product: { id: 'product-1', name: 'Featured mouse' },
      },
    ];
  };

  prisma.review.groupBy = async (query) => {
    assert.deepEqual(query.where, {
      productId: { in: ['product-1'] },
      status: 'visible',
    });
    return [{ productId: 'product-1', _avg: { rating: 5 }, _count: { _all: 1 } }];
  };

  assert.deepEqual(await storefrontContentModel.findPublicFeaturedProducts(), {
    items: [
      {
        id: 'product-1',
        name: 'Featured mouse',
        reviewSummary: {
          averageRating: 5,
          reviewCount: 1,
        },
      },
    ],
    settings: {
      featuredProductLimit: 2,
    },
  });
});

test('findPublicFeaturedProducts falls back to latest products when none are configured', async () => {
  prisma.storefrontSetting.findUnique = async () => ({ featuredProductLimit: 3 });
  prisma.storefrontFeaturedProduct.findMany = async () => [];

  prisma.product.findMany = async (query) => {
    assert.deepEqual(query, {
      take: 3,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return [{ id: 'latest-1', name: 'Latest keyboard' }];
  };

  assert.deepEqual(await storefrontContentModel.findPublicFeaturedProducts(), {
    items: [
      {
        id: 'latest-1',
        name: 'Latest keyboard',
        reviewSummary: {
          averageRating: null,
          reviewCount: 0,
        },
      },
    ],
    settings: {
      featuredProductLimit: 3,
    },
  });
});

test('updateStorefrontSettings persists a bounded featured product limit', async () => {
  prisma.storefrontSetting.upsert = async (query) => {
    assert.deepEqual(query, {
      where: { id: 'home' },
      update: { featuredProductLimit: 8 },
      create: { id: 'home', featuredProductLimit: 8 },
    });
    return { id: 'home', featuredProductLimit: 8 };
  };

  assert.deepEqual(await storefrontContentModel.updateStorefrontSettings({ featuredProductLimit: 8 }), {
    featuredProductLimit: 8,
  });
});

test('createFeaturedProductsBulk skips duplicates and auto-indexes after the current featured order', async () => {
  prisma.product.findMany = async (query) => {
    assert.deepEqual(query, {
      where: { id: { in: ['product-1', 'product-2', 'product-3'] } },
      select: { id: true },
    });
    return [
      { id: 'product-1' },
      { id: 'product-2' },
      { id: 'product-3' },
    ];
  };

  let featuredFindManyCall = 0;
  prisma.storefrontFeaturedProduct.findMany = async (query) => {
    featuredFindManyCall += 1;
    if (featuredFindManyCall === 1) {
      assert.deepEqual(query, {
        where: { productId: { in: ['product-1', 'product-2', 'product-3'] } },
        select: { productId: true },
      });
      return [{ productId: 'product-2' }];
    }

    assert.deepEqual(query, {
      orderBy: { sortOrder: 'desc' },
      take: 1,
      select: { sortOrder: true },
    });
    return [{ sortOrder: 4 }];
  };

  const createdRows = [];
  prisma.storefrontFeaturedProduct.create = async (query) => {
    createdRows.push(query.data);
    return { id: `featured-${createdRows.length}`, ...query.data };
  };

  assert.deepEqual(await storefrontContentModel.createFeaturedProductsBulk({
    productIds: ['product-1', 'product-2', 'product-1', 'product-3'],
  }), {
    items: [
      { id: 'featured-1', productId: 'product-1', sortOrder: 5, isActive: true },
      { id: 'featured-2', productId: 'product-3', sortOrder: 6, isActive: true },
    ],
    skippedProductIds: ['product-2'],
  });
});

test('reorderFeaturedProducts renumbers submitted featured products to unique sequential order', async () => {
  prisma.storefrontFeaturedProduct.findMany = async (query) => {
    assert.deepEqual(query, {
      where: { id: { in: ['featured-2', 'featured-1', 'featured-3'] } },
      select: { id: true },
    });
    return [
      { id: 'featured-1' },
      { id: 'featured-2' },
      { id: 'featured-3' },
    ];
  };

  const updates = [];
  prisma.storefrontFeaturedProduct.update = (query) => {
    updates.push(query);
    return Promise.resolve({ id: query.where.id, sortOrder: query.data.sortOrder });
  };
  prisma.$transaction = async (operations) => Promise.all(operations);

  assert.deepEqual(await storefrontContentModel.reorderFeaturedProducts({
    orderedIds: ['featured-2', 'featured-1', 'featured-2', 'featured-3'],
  }), {
    items: [
      { id: 'featured-2', sortOrder: 1 },
      { id: 'featured-1', sortOrder: 2 },
      { id: 'featured-3', sortOrder: 3 },
    ],
  });

  assert.deepEqual(updates, [
    { where: { id: 'featured-2' }, data: { sortOrder: 1 } },
    { where: { id: 'featured-1' }, data: { sortOrder: 2 } },
    { where: { id: 'featured-3' }, data: { sortOrder: 3 } },
  ]);
});
