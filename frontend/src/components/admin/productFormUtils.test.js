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
      name: 'Vui lòng nhập tên sản phẩm.',
      brand: 'Vui lòng nhập thương hiệu.',
      price: 'Vui lòng nhập giá.',
      quantity: 'Số lượng phải là số nguyên không âm.',
      categoryId: 'Vui lòng chọn danh mục.'
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
      quantity: 'Số lượng phải là số nguyên không âm.',
    }
  );
});

test('validateProductForm accepts zero and reports negative quantity distinctly', () => {
  assert.equal(validateProductForm({ ...validProduct, quantity: 0 }).quantity, undefined);
  assert.equal(
    validateProductForm({ ...validProduct, quantity: '-1' }).quantity,
    'Số lượng không được là số âm.'
  );
  assert.equal(
    validateProductForm({ ...validProduct, quantity: '-999' }).quantity,
    'Số lượng không được là số âm.'
  );
  assert.equal(
    validateProductForm({ ...validProduct, quantity: '' }).quantity,
    'Số lượng phải là số nguyên không âm.'
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
