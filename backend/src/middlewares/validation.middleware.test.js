const assert = require('node:assert/strict');
const { test } = require('node:test');
const { PASSWORD_POLICY_MESSAGE } = require('../utils/passwordPolicy');
const { validateBody } = require('./validation.middleware');

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

test('validateBody does not apply password policy unless requested', () => {
  const response = createResponse();
  let nextCalled = false;

  validateBody(['email', 'password'])(
    {
      body: {
        email: 'ada@example.com',
        password: 'old123',
      },
    },
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(response.statusCode, null);
  assert.equal(response.body, null);
  assert.equal(nextCalled, true);
});

test('validateBody applies shared password policy to registration passwords when requested', () => {
  const response = createResponse();
  let nextCalled = false;

  validateBody(['username', 'email', 'password'], { validatePasswordPolicy: true })(
    {
      body: {
        username: 'ada',
        email: 'ada@example.com',
        password: 'lowercasepassword1!',
      },
    },
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Xác thực thất bại');
  assert.deepEqual(response.body.errors, [
    {
      field: 'password',
      message: PASSWORD_POLICY_MESSAGE,
    },
  ]);
  assert.equal(nextCalled, false);
});
