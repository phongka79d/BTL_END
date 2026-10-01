import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PERMISSIONS,
  STAFF_AREA_CAPABILITIES,
  getRoleCapabilities
} from '../constants/permissions.js';
import {
  STAFF_ROUTE_CAPABILITIES,
  canAccessStaffCapabilities,
  canAccessStaffRoute
} from './staffRoutePermissions.js';

test('admin and staff reach every staff route while customer is denied', () => {
  Object.keys(STAFF_ROUTE_CAPABILITIES).forEach((routeKey) => {
    assert.equal(canAccessStaffRoute('admin', routeKey), true, `admin/${routeKey}`);
    assert.equal(canAccessStaffRoute('staff', routeKey), true, `staff/${routeKey}`);
    assert.equal(canAccessStaffRoute('customer', routeKey), false, `customer/${routeKey}`);
    assert.equal(canAccessStaffRoute(undefined, routeKey), false, `guest/${routeKey}`);
  });
});

test('inventory route is guarded by the stock capability, not by the orders capability', () => {
  assert.equal(STAFF_ROUTE_CAPABILITIES.inventory, PERMISSIONS.PRODUCTS_UPDATE_STOCK);
  assert.notEqual(STAFF_ROUTE_CAPABILITIES.inventory, PERMISSIONS.ORDERS_VIEW_ALL);

  // Vai trò chỉ có quyền cập nhật tồn kho vẫn vào được khu vực vận hành và trang tồn kho.
  const inventoryOnly = [PERMISSIONS.PRODUCTS_UPDATE_STOCK];
  assert.equal(canAccessStaffCapabilities(inventoryOnly, 'dashboard'), true);
  assert.equal(canAccessStaffCapabilities(inventoryOnly, 'inventory'), true);
  assert.equal(canAccessStaffCapabilities(inventoryOnly, 'orders'), false);
  assert.equal(canAccessStaffCapabilities(inventoryOnly, 'reports'), false);

  // Ngược lại, chỉ có quyền xem đơn hàng thì không mở được trang tồn kho.
  const ordersOnly = [PERMISSIONS.ORDERS_VIEW_ALL];
  assert.equal(canAccessStaffCapabilities(ordersOnly, 'dashboard'), true);
  assert.equal(canAccessStaffCapabilities(ordersOnly, 'orders'), true);
  assert.equal(canAccessStaffCapabilities(ordersOnly, 'inventory'), false);
});

test('each staff page keeps its own capability', () => {
  assert.equal(STAFF_ROUTE_CAPABILITIES.dashboard, null);
  assert.equal(STAFF_ROUTE_CAPABILITIES.orders, PERMISSIONS.ORDERS_VIEW_ALL);
  assert.equal(STAFF_ROUTE_CAPABILITIES.reviews, PERMISSIONS.REVIEWS_VIEW_ALL);
  assert.equal(STAFF_ROUTE_CAPABILITIES.reports, PERMISSIONS.REPORTS_VIEW_OPERATIONAL);
});

test('unknown route keys and missing capabilities are denied', () => {
  assert.equal(canAccessStaffCapabilities([PERMISSIONS.PRODUCTS_UPDATE_STOCK], 'unknown'), false);
  assert.equal(canAccessStaffCapabilities([], 'inventory'), false);
  assert.equal(canAccessStaffCapabilities(undefined, 'inventory'), false);
  assert.equal(canAccessStaffRoute('admin', 'unknown'), false);
});

test('customer role never gains a staff area capability', () => {
  const customerCapabilities = getRoleCapabilities('customer');

  assert.deepEqual(customerCapabilities, []);
  assert.equal(
    STAFF_AREA_CAPABILITIES.some((capability) => customerCapabilities.includes(capability)),
    false
  );
});
