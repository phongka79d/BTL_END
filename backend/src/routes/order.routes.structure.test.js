const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('order routes require authentication and capability permissions', () => {
  const source = readFileSync(path.join(__dirname, 'order.routes.js'), 'utf8');

  // Customer order routes
  assert.match(source, /router\.post\('\/',\s*protect,\s*orderController\.checkout\)/);
  assert.match(source, /router\.get\('\/my-orders',\s*protect,\s*orderController\.getMyOrders\)/);
  assert.match(source, /router\.get\('\/:id',\s*protect,\s*orderController\.getOrderById\)/);

  // Operational / Admin order routes with capability permissions
  assert.match(source, /router\.get\('\/',\s*protect,\s*requirePermission\(PERMISSIONS\.ORDERS_VIEW_ALL\),\s*orderController\.getAdminOrders\)/);
  assert.match(source, /router\.put\('\/:id\/status',\s*protect,\s*requirePermission\(PERMISSIONS\.ORDERS_UPDATE_STATUS\),\s*orderController\.updateOrderStatus\)/);
});
