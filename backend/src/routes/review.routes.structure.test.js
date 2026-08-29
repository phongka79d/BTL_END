const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/review.routes.js', 'utf8');

test('review routes expose admin review list before hide action', () => {
  assert.match(source, /router\.get\('\/admin\/reviews',\s*protect,\s*requirePermission\(PERMISSIONS\.REVIEWS_VIEW_ALL\),\s*reviewController\.getAdminReviews\);/);
  assert.match(source, /router\.delete\('\/admin\/reviews\/:id',\s*protect,\s*requirePermission\(PERMISSIONS\.REVIEWS_MODERATE\),\s*reviewController\.hideReview\);/);
  assert.ok(
    source.indexOf("router.get('/admin/reviews'") < source.indexOf("router.delete('/admin/reviews/:id'"),
    'admin review list route should be declared before hide route'
  );
});
