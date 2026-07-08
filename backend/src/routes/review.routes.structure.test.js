const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/review.routes.js', 'utf8');

test('review routes expose admin review list before hide action', () => {
  assert.match(source, /router\.get\('\/admin\/reviews', protect, admin, reviewController\.getAdminReviews\);/);
  assert.match(source, /router\.delete\('\/admin\/reviews\/:id', protect, admin, reviewController\.hideReview\);/);
  assert.ok(
    source.indexOf("router.get('/admin/reviews'") < source.indexOf("router.delete('/admin/reviews/:id'"),
    'admin review list route should be declared before hide route'
  );
});
