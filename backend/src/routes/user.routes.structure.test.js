const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/user.routes.js', 'utf8');

test('user routes expose protected admin user list and role update endpoints', () => {
  assert.match(source, /router\.get\('\/', protect, admin, userController\.getUsers\);/);
  assert.match(source, /router\.put\('\/:id\/role', protect, admin, userController\.updateUserRole\);/);
  assert.match(source, /router\.get\('\/admin\/users', protect, admin, userController\.getUsers\);/);
  assert.match(source, /router\.put\('\/admin\/users\/:id\/role', protect, admin, userController\.updateUserRole\);/);
});
