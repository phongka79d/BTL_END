const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/review.controller.js', 'utf8');

test('review controller exposes admin all-review listing with optional product filter', () => {
  assert.match(source, /const getAdminReviews = async \(req, res, next\) => \{/);
  assert.match(source, /const \{ productId \} = req\.query;/);
  assert.match(source, /reviewModel\.listVisibleForAdmin\(\{ productId \}\)/);
  assert.match(source, /successResponse\(res, 200, 'Đã lấy đánh giá thành công', reviews\)/);
  assert.match(source, /getAdminReviews,/);
});
