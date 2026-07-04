import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCategoryPayload,
  getCategoryFormValues,
  validateCategoryForm
} from './categoryFormUtils.js';

test('validateCategoryForm requires a category name', () => {
  assert.deepEqual(validateCategoryForm({ name: '', description: '' }), {
    name: 'Category name is required.'
  });
});

test('category form values and payload preserve editable data and trim text', () => {
  assert.deepEqual(
    getCategoryFormValues({ name: ' Laptops ', description: ' Portable computers ' }),
    {
      name: ' Laptops ',
      description: ' Portable computers '
    }
  );

  assert.deepEqual(
    createCategoryPayload({ name: ' Laptops ', description: ' Portable computers ' }),
    {
      name: 'Laptops',
      description: 'Portable computers'
    }
  );
});
