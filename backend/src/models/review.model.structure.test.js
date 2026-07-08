const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/review.model.js', 'utf8');

test('review model exposes admin visible review list with optional product filter', () => {
  assert.match(source, /const listVisibleForAdmin = async \(\{ productId \} = \{\}\) => \{/);
  assert.match(source, /where: \{\s*status: 'visible',\s*\.\.\.\(productId \? \{ productId \} : \{\}\),\s*\}/s);
  assert.match(source, /product: \{\s*select: \{\s*id: true,\s*name: true,\s*brand: true,\s*\},\s*\}/s);
  assert.match(source, /orderBy: \{\s*createdAt: 'desc',\s*\}/s);
  assert.match(source, /listVisibleForAdmin,/);
});
