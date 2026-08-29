const test = require('node:test');
const assert = require('node:assert/strict');
const { PERMISSIONS, ROLE_CAPABILITIES, hasRolePermission } = require('../config/permissions');
const { requirePermission, requireAnyPermission } = require('./permission.middleware');

test('PERMISSIONS definition contains expected capabilities', () => {
  assert.equal(PERMISSIONS.ORDERS_VIEW_ALL, 'orders.view_all');
  assert.equal(PERMISSIONS.ORDERS_UPDATE_STATUS, 'orders.update_status');
  assert.equal(PERMISSIONS.PRODUCTS_UPDATE_STOCK, 'products.update_stock');
  assert.equal(PERMISSIONS.STOREFRONT_MANAGE, 'storefront.manage');
});

test('hasRolePermission correctly authorizes admin for all permissions', () => {
  assert.equal(hasRolePermission('admin', PERMISSIONS.ORDERS_VIEW_ALL), true);
  assert.equal(hasRolePermission('admin', PERMISSIONS.STOREFRONT_MANAGE), true);
  assert.equal(hasRolePermission('admin', PERMISSIONS.USERS_MANAGE_ROLE), true);
});

test('hasRolePermission correctly restricts staff to operational permissions', () => {
  assert.equal(hasRolePermission('staff', PERMISSIONS.ORDERS_VIEW_ALL), true);
  assert.equal(hasRolePermission('staff', PERMISSIONS.ORDERS_UPDATE_STATUS), true);
  assert.equal(hasRolePermission('staff', PERMISSIONS.PRODUCTS_UPDATE_STOCK), true);
  assert.equal(hasRolePermission('staff', PERMISSIONS.REVIEWS_MODERATE), true);
  assert.equal(hasRolePermission('staff', PERMISSIONS.REPORTS_VIEW_OPERATIONAL), true);

  // Staff should NOT have admin-only permissions
  assert.equal(hasRolePermission('staff', PERMISSIONS.STOREFRONT_MANAGE), false);
  assert.equal(hasRolePermission('staff', PERMISSIONS.USERS_MANAGE_ROLE), false);
  assert.equal(hasRolePermission('staff', PERMISSIONS.USERS_BLOCK), false);
  assert.equal(hasRolePermission('staff', PERMISSIONS.REPORTS_VIEW_REVENUE), false);
  assert.equal(hasRolePermission('staff', PERMISSIONS.PRODUCTS_DELETE), false);
});

test('hasRolePermission denies customer operational and admin permissions', () => {
  assert.equal(hasRolePermission('customer', PERMISSIONS.ORDERS_VIEW_ALL), false);
  assert.equal(hasRolePermission('customer', PERMISSIONS.PRODUCTS_UPDATE_STOCK), false);
  assert.equal(hasRolePermission('customer', PERMISSIONS.STOREFRONT_MANAGE), false);
});

test('requirePermission middleware passes when user has permission', () => {
  const req = { user: { id: 'u1', role: 'staff' } };
  let statusCode = null;
  let responseData = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  const mw = requirePermission(PERMISSIONS.ORDERS_VIEW_ALL);
  mw(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(statusCode, null);
});

test('requirePermission middleware rejects when user lacks permission', () => {
  const req = { user: { id: 'u2', role: 'staff' } };
  let statusCode = null;
  let responseData = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    }
  };
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  const mw = requirePermission(PERMISSIONS.STOREFRONT_MANAGE);
  mw(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
  assert.equal(responseData.success, false);
});
