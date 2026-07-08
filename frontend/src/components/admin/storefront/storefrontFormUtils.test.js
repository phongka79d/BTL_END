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
