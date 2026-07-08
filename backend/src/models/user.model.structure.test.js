const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/user.model.js', 'utf8');

test('user model exposes paginated searchable admin listing without password hashes', () => {
  assert.match(source, /const findAll = async \(params = \{\}\) => \{/);
  assert.match(source, /const \{ keyword, page, limit \} = params;/);
  assert.match(source, /email:\s*\{\s*contains: keyword, mode: 'insensitive'\s*\}/);
  assert.match(source, /username:\s*\{\s*contains: keyword, mode: 'insensitive'\s*\}/);
  assert.match(source, /fullName:\s*\{\s*contains: keyword, mode: 'insensitive'\s*\}/);
  assert.match(source, /prisma\.user\.count\(\{ where \}\)/);
  assert.match(source, /select:\s*USER_SAFE_SELECT/);
  assert.match(source, /pagination:\s*\{/);
});

test('user model exposes role update constrained to safe selected fields', () => {
  assert.match(source, /const updateRole = async \(id, role\) => \{/);
  assert.match(source, /where:\s*\{ id \}/);
  assert.match(source, /data:\s*\{ role \}/);
  assert.match(source, /select:\s*USER_SAFE_SELECT/);
});
