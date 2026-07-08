const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const bcrypt = require('bcrypt');

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
  process.env.JWT_SECRET = 'test-secret';
  userModel.findByEmail = async () => null;
});

test('login rejects blocked users before issuing a token', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('blocked123', 4);
  userModel.findByEmail = async () => ({
    id: 'user-1',
    username: 'blocked',
    email: 'blocked@example.com',
    fullName: 'Blocked User',
    passwordHash,
    role: 'customer',
    isBlocked: true,
  });

  const response = createResponse();
  await controller.login(
    { body: { email: 'blocked@example.com', password: 'blocked123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.message, 'Your account has been blocked');
  assert.equal(response.body.data, undefined);
});
