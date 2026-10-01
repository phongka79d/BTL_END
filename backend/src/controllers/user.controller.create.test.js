const test = require('node:test');
const assert = require('node:assert/strict');
const userController = require('./user.controller');
const userModel = require('../models/user.model');
const emailService = require('../services/email.service');

const createMockResponse = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
};

const withStubs = async (stubs, run) => {
  const originals = {
    findByEmail: userModel.findByEmail,
    create: userModel.create,
    sendAccountCredentialsEmail: emailService.sendAccountCredentialsEmail
  };

  userModel.findByEmail = stubs.findByEmail;
  userModel.create = stubs.create;
  emailService.sendAccountCredentialsEmail = stubs.sendAccountCredentialsEmail;

  try {
    return await run();
  } finally {
    userModel.findByEmail = originals.findByEmail;
    userModel.create = originals.create;
    emailService.sendAccountCredentialsEmail = originals.sendAccountCredentialsEmail;
  }
};

test('createUser provisions a staff account, hashes the password and emails credentials', async () => {
  let createdPayload = null;
  let emailedPayload = null;

  await withStubs(
    {
      findByEmail: async () => null,
      create: async (payload) => {
        createdPayload = payload;
        return { id: 'user_1', ...payload };
      },
      sendAccountCredentialsEmail: async (payload) => {
        emailedPayload = payload;
        return { delivery: 'console' };
      }
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'nhanvien01',
            email: 'nhanvien01@example.com',
            password: 'Matkhau123!',
            fullName: 'Nguyễn Văn A',
            role: 'staff'
          }
        },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.emailDelivery, 'console');
    }
  );

  assert.equal(createdPayload.role, 'staff');
  assert.equal(createdPayload.username, 'nhanvien01');
  assert.ok(createdPayload.passwordHash);
  assert.notEqual(createdPayload.passwordHash, 'Matkhau123!');
  assert.equal(emailedPayload.to, 'nhanvien01@example.com');
  assert.equal(emailedPayload.role, 'staff');
});

test('createUser defaults to the staff role and never leaks the password hash', async () => {
  let createdPayload = null;

  await withStubs(
    {
      findByEmail: async () => null,
      create: async (payload) => {
        createdPayload = payload;
        return { id: 'user_2', ...payload };
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        { body: { username: 'nhanvien02', email: 'nhanvien02@example.com', password: 'Matkhau123!' } },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.data.user.passwordHash, undefined);
    }
  );

  assert.equal(createdPayload.role, 'staff');
});

test('createUser rejects duplicate emails and invalid roles', async () => {
  await withStubs(
    {
      findByEmail: async () => ({ id: 'existing_user' }),
      create: async () => {
        throw new Error('create should not be called');
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const duplicateRes = createMockResponse();
      await userController.createUser(
        { body: { username: 'dup', email: 'dup@example.com', password: 'Matkhau123!' } },
        duplicateRes,
        () => {}
      );
      assert.equal(duplicateRes.statusCode, 400);
      assert.equal(duplicateRes.body.success, false);
    }
  );

  await withStubs(
    {
      findByEmail: async () => null,
      create: async () => {
        throw new Error('create should not be called');
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const roleRes = createMockResponse();
      await userController.createUser(
        { body: { username: 'x', email: 'x@example.com', password: 'Matkhau123!', role: 'superadmin' } },
        roleRes,
        () => {}
      );
      assert.equal(roleRes.statusCode, 400);
      assert.equal(roleRes.body.success, false);
    }
  );
});

test('createUser still succeeds when the credential email cannot be delivered', async () => {
  await withStubs(
    {
      findByEmail: async () => null,
      create: async (payload) => ({ id: 'user_3', ...payload }),
      sendAccountCredentialsEmail: async () => {
        throw new Error('SMTP password OTP delivery is not configured');
      }
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        { body: { username: 'nhanvien03', email: 'nhanvien03@example.com', password: 'Matkhau123!' } },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.data.emailDelivery, 'skipped');
    }
  );
});

test('createUser rejects non-string phone values before any model invocation', async () => {
  let findByEmailCalled = false;
  let createCalled = false;

  await withStubs(
    {
      findByEmail: async () => {
        findByEmailCalled = true;
        return null;
      },
      create: async () => {
        createCalled = true;
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'phone-invalid',
            email: 'phone-invalid@example.com',
            password: 'Matkhau123!',
            phone: 987654321
          }
        },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, 'Số điện thoại chỉ được chứa chữ số.');
    }
  );

  assert.equal(findByEmailCalled, false);
  assert.equal(createCalled, false);
});
