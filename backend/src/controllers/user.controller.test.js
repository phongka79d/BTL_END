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
        isBlocked: false,
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
  userModel.updateAdminProfile = async (id, data) => ({
    id,
    email: 'ada@example.com',
    role: 'customer',
    isBlocked: false,
    ...data,
  });
  userModel.updateBlocked = async (id, isBlocked) => ({
    id,
    username: 'Ada',
    email: 'ada@example.com',
    role: 'customer',
    isBlocked,
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

test('updateUserRole rejects invalid roles and any current admin self role change', async () => {
  const controller = require('./user.controller');

  const invalidResponse = createResponse();
  await controller.updateUserRole(
    { params: { id: 'user-1' }, body: { role: 'owner' }, user: { id: 'admin-1', role: 'admin' } },
    invalidResponse,
    assert.fail
  );
  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(invalidResponse.body.message, 'Vai trò phải là customer, staff hoặc admin');

  const selfResponse = createResponse();
  await controller.updateUserRole(
    { params: { id: 'admin-1' }, body: { role: 'admin' }, user: { id: 'admin-1', role: 'admin' } },
    selfResponse,
    assert.fail
  );
  assert.equal(selfResponse.statusCode, 400);
  assert.equal(selfResponse.body.message, 'Bạn không thể thay đổi vai trò quản trị viên của chính mình');
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

test('updateAdminUser updates only soft profile fields and ignores role permission fields', async () => {
  const controller = require('./user.controller');
  let received = null;
  userModel.updateAdminProfile = async (id, data) => {
    received = { id, data };
    return { id, email: 'ada@example.com', role: 'customer', isBlocked: false, ...data };
  };

  const response = createResponse();
  await controller.updateAdminUser(
    {
      params: { id: 'user-1' },
      body: {
        username: ' ada ',
        fullName: ' Ada Lovelace ',
        phone: '0987654321',
        address: ' London ',
        role: 'admin',
        isBlocked: true,
      },
      user: { id: 'admin-1', role: 'admin' },
    },
    response,
    assert.fail
  );

  assert.deepEqual(received, {
    id: 'user-1',
    data: {
      username: 'ada',
      fullName: 'Ada Lovelace',
      phone: '0987654321',
      address: 'London',
    },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.user.username, 'ada');
});

test('updateAdminUser rejects empty username and empty profile payload', async () => {
  const controller = require('./user.controller');

  const emptyUsernameResponse = createResponse();
  await controller.updateAdminUser(
    { params: { id: 'user-1' }, body: { username: ' ' }, user: { id: 'admin-1', role: 'admin' } },
    emptyUsernameResponse,
    assert.fail
  );
  assert.equal(emptyUsernameResponse.statusCode, 400);
  assert.equal(emptyUsernameResponse.body.message, 'Tên người dùng không được để trống');

  const emptyPayloadResponse = createResponse();
  await controller.updateAdminUser(
    { params: { id: 'user-1' }, body: { role: 'admin' }, user: { id: 'admin-1', role: 'admin' } },
    emptyPayloadResponse,
    assert.fail
  );
  assert.equal(emptyPayloadResponse.statusCode, 400);
  assert.equal(emptyPayloadResponse.body.message, 'Chưa cung cấp trường có thể chỉnh sửa để cập nhật');
});

test('updateUserBlocked blocks other users but rejects current admin self-block', async () => {
  const controller = require('./user.controller');
  let received = null;
  userModel.updateBlocked = async (id, isBlocked) => {
    received = { id, isBlocked };
    return { id, username: 'Ada', email: 'ada@example.com', role: 'customer', isBlocked };
  };

  const selfResponse = createResponse();
  await controller.updateUserBlocked(
    { params: { id: 'admin-1' }, body: { isBlocked: true }, user: { id: 'admin-1', role: 'admin' } },
    selfResponse,
    assert.fail
  );
  assert.equal(selfResponse.statusCode, 400);
  assert.equal(selfResponse.body.message, 'Bạn không thể khóa tài khoản quản trị viên của chính mình');

  const response = createResponse();
  await controller.updateUserBlocked(
    { params: { id: 'user-1' }, body: { isBlocked: true }, user: { id: 'admin-1', role: 'admin' } },
    response,
    assert.fail
  );

  assert.deepEqual(received, { id: 'user-1', isBlocked: true });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.user.isBlocked, true);
});

test('updateProfile rejects invalid phone values before model invocation', async () => {
  const controller = require('./user.controller');
  let updateCalled = false;
  userModel.update = async () => {
    updateCalled = true;
  };

  const response = createResponse();
  await controller.updateProfile(
    { user: { id: 'user-1' }, body: { phone: 987654321 } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Số điện thoại chỉ được chứa chữ số.');
  assert.equal(updateCalled, false);
});

test('updateAdminUser rejects invalid phone values before model invocation', async () => {
  const controller = require('./user.controller');
  let updateCalled = false;
  userModel.updateAdminProfile = async () => {
    updateCalled = true;
  };

  const response = createResponse();
  await controller.updateAdminUser(
    {
      params: { id: 'user-1' },
      body: { phone: '09-123' },
      user: { id: 'admin-1', role: 'admin' },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Số điện thoại chỉ được chứa chữ số.');
  assert.equal(updateCalled, false);
});
