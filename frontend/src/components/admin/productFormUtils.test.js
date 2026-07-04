import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createProductPayload,
  validateProductForm
} from './productFormUtils.js';

const validProduct = {
  name: ' Wireless Mouse ',
  brand: ' Logi ',
  description: ' Demo product ',
  price: '25.00',
  quantity: '20',
  imageUrl: ' https://example.com/mouse.jpg ',
  categoryId: 'category-1'
};

test('validateProductForm requires core product fields', () => {
  assert.deepEqual(
    validateProductForm({
      name: '',
      brand: '',
      price: '',
      quantity: '',
      categoryId: ''
    }),
    {
      name: 'Product name is required.',
      brand: 'Brand is required.',
      price: 'Price is required.',
      quantity: 'Quantity is required.',
      categoryId: 'Category is required.'
    }
  );
});

test('validateProductForm rejects invalid price and quantity values', () => {
  assert.deepEqual(
    validateProductForm({
      ...validProduct,
      price: '-1',
      quantity: '1.5'
    }),
    {
      price: 'Price must be a non-negative number.',
      quantity: 'Quantity must be a non-negative integer.'
    }
  );
});

test('createProductPayload trims text and converts numeric fields', () => {
  assert.deepEqual(createProductPayload(validProduct), {
    name: 'Wireless Mouse',
    brand: 'Logi',
    description: 'Demo product',
    price: 25,
    quantity: 20,
    imageUrl: 'https://example.com/mouse.jpg',
    categoryId: 'category-1'
  });
});
