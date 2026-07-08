const assert = require('node:assert/strict');
const test = require('node:test');

const { productsData } = require('./seedProducts');

test('seed contains 40 demo products balanced across existing categories', () => {
  assert.equal(productsData.length, 40);
  const categoryCounts = productsData.reduce((counts, product) => ({
    ...counts,
    [product.categoryName]: (counts[product.categoryName] || 0) + 1,
  }), {});

  assert.deepEqual(categoryCounts, {
    Smartphones: 10,
    Laptops: 10,
    Smartwatches: 10,
    Accessories: 10,
  });
});
