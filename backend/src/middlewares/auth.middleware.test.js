const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const jwt = require('jsonwebtoken');

const userModel = require('../models/user.model');
const { protect } = require('./auth.middleware');

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
  userModel.findById = async () => null;
});

test('protect rejects blocked users even when their token is otherwise valid', async () => {
  const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET);
  userModel.findById = async () => ({
    id: 'user-1',
    username: 'blocked',
    email: 'blocked@example.com',
    passwordHash: 'hash',
    role: 'customer',
    isBlocked: true,
  });

  const response = createResponse();
  let nextCalled = false;

  await protect(
    { headers: { authorization: `Bearer ${token}` } },
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.message, 'Your account has been blocked');
  assert.equal(nextCalled, false);
});
