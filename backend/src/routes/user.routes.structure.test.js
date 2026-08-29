const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const source = readFileSync(__dirname + '/user.routes.js', 'utf8');

test('user routes expose protected admin user list and role update endpoints', () => {
  assert.match(source, /router\.get\('\/',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_VIEW_ALL\),\s*userController\.getUsers\);/);
  assert.match(source, /router\.put\('\/:id',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_VIEW_ALL\),\s*userController\.updateAdminUser\);/);
  assert.match(source, /router\.put\('\/:id\/role',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_MANAGE_ROLE\),\s*userController\.updateUserRole\);/);
  assert.match(source, /router\.put\('\/:id\/block',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_BLOCK\),\s*userController\.updateUserBlocked\);/);
  assert.match(source, /router\.get\('\/admin\/users',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_VIEW_ALL\),\s*userController\.getUsers\);/);
  assert.match(source, /router\.put\('\/admin\/users\/:id',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_VIEW_ALL\),\s*userController\.updateAdminUser\);/);
  assert.match(source, /router\.put\('\/admin\/users\/:id\/role',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_MANAGE_ROLE\),\s*userController\.updateUserRole\);/);
  assert.match(source, /router\.put\('\/admin\/users\/:id\/block',\s*protect,\s*requirePermission\(PERMISSIONS\.USERS_BLOCK\),\s*userController\.updateUserBlocked\);/);
});
