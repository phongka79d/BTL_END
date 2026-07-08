const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const userModel = require('../models/user.model');

const createResponse = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
  };
  return response;
};

beforeEach(() => {
  userModel.findAll = async () => ({
    items: [
      {
        id: 'user-1',
        username: 'Ada',
        email: 'ada@example.com',
        fullName: 'Ada Lovelace',
        role: 'customer',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  });
  userModel.updateRole = async (id, role) => ({
    id,
    username: 'Ada',
    email: 'ada@example.com',
    role,
  });
});

test('getUsers forwards admin search pagination query to model and returns items with pagination', async () => {
  const controller = require('./user.controller');
  let receivedParams = null;
  userModel.findAll = async (params) => {
    receivedParams = params;
    return {
      items: [{ id: 'user-1', username: 'Ada', email: 'ada@example.com', role: 'customer' }],
      pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
    };
  };

  const response = createResponse();
  await controller.getUsers(
    { query: { keyword: 'ada', page: '2', limit: '10' } },
    response,
    assert.fail
  );

  assert.deepEqual(receivedParams, { keyword: 'ada', page: '2', limit: '10' });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.data.pagination, { page: 2, limit: 10, total: 11, totalPages: 2 });
  assert.equal(response.body.data.items[0].email, 'ada@example.com');
});

test('updateUserRole rejects invalid roles and current admin self-demotion', async () => {
  const controller = require('./user.controller');

  const invalidResponse = createResponse();
  await controller.updateUserRole(
    { params: { id: 'user-1' }, body: { role: 'owner' }, user: { id: 'admin-1', role: 'admin' } },
    invalidResponse,
    assert.fail
  );
  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(invalidResponse.body.message, 'Role must be customer or admin');

  const selfResponse = createResponse();
  await controller.updateUserRole(
    { params: { id: 'admin-1' }, body: { role: 'customer' }, user: { id: 'admin-1', role: 'admin' } },
    selfResponse,
    assert.fail
  );
  assert.equal(selfResponse.statusCode, 400);
  assert.equal(selfResponse.body.message, 'You cannot demote your own admin account');
});

test('updateUserRole updates another user role through the model', async () => {
  const controller = require('./user.controller');
  let received = null;
  userModel.updateRole = async (id, role) => {
    received = { id, role };
    return { id, username: 'Ada', email: 'ada@example.com', role };
  };

  const response = createResponse();
  await controller.updateUserRole(
    { params: { id: 'user-1' }, body: { role: 'admin' }, user: { id: 'admin-1', role: 'admin' } },
    response,
    assert.fail
  );

  assert.deepEqual(received, { id: 'user-1', role: 'admin' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.user.role, 'admin');
});
