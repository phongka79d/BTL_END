const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const loadModelWithPrisma = (prisma) => {
  const databasePath = require.resolve('../config/database');
  const modelPath = require.resolve('./passwordChangeOtp.model');

  delete require.cache[databasePath];
  delete require.cache[modelPath];

  require.cache[databasePath] = {
    id: databasePath,
    filename: databasePath,
    loaded: true,
    exports: prisma,
  };

  return require('./passwordChangeOtp.model');
};

test('password change otp model stores only hashed otp and supports invalidation', () => {
  const source = readFileSync(path.join(__dirname, 'passwordChangeOtp.model.js'), 'utf8');

  assert.match(source, /createPasswordChangeOtp/);
  assert.match(source, /invalidateActiveOtps/);
  assert.match(source, /findLatestActiveOtp/);
  assert.match(source, /incrementOtpAttempts/);
  assert.match(source, /completePasswordChange/);
  assert.match(source, /otpHash/);
  assert.doesNotMatch(source, /plainOtp|otpCode|codeText/);
  assert.match(source, /prisma\.\$transaction/);
});

test('findLatestActiveOtp only returns unused and unexpired otp records', async () => {
  const findFirstCalls = [];
  const prisma = {
    passwordChangeOtp: {
      findFirst: async (query) => {
        findFirstCalls.push(query);
        return null;
      },
    },
  };
  const { findLatestActiveOtp } = loadModelWithPrisma(prisma);

  await findLatestActiveOtp('user-1');

  assert.equal(findFirstCalls.length, 1);
  assert.equal(findFirstCalls[0].where.userId, 'user-1');
  assert.equal(findFirstCalls[0].where.usedAt, null);
  assert.ok(findFirstCalls[0].where.expiresAt.gt instanceof Date);
  assert.deepEqual(findFirstCalls[0].orderBy, { createdAt: 'desc' });
});

test('completePasswordChange atomically claims an unused unexpired otp before updating password', async () => {
  const calls = [];
  const tx = {
    passwordChangeOtp: {
      updateMany: async (query) => {
        calls.push(['claimOtp', query]);
        return { count: 1 };
      },
    },
    user: {
      update: async (query) => {
        calls.push(['updateUser', query]);
        return { id: query.where.id };
      },
    },
  };
  const prisma = {
    $transaction: async (callback) => callback(tx),
  };
  const { completePasswordChange } = loadModelWithPrisma(prisma);

  await completePasswordChange({
    otpId: 'otp-1',
    userId: 'user-1',
    passwordHash: 'new-hash',
  });

  assert.deepEqual(calls.map(([name]) => name), ['claimOtp', 'updateUser']);
  assert.equal(calls[0][1].where.id, 'otp-1');
  assert.equal(calls[0][1].where.userId, 'user-1');
  assert.equal(calls[0][1].where.usedAt, null);
  assert.ok(calls[0][1].where.expiresAt.gt instanceof Date);
  assert.strictEqual(calls[0][1].data.usedAt, calls[0][1].where.expiresAt.gt);
  assert.deepEqual(calls[1][1], {
    where: { id: 'user-1' },
    data: { passwordHash: 'new-hash' },
  });
});

test('completePasswordChange does not update password when otp claim fails', async () => {
  let userUpdateCalled = false;
  const tx = {
    passwordChangeOtp: {
      updateMany: async () => ({ count: 0 }),
    },
    user: {
      update: async () => {
        userUpdateCalled = true;
      },
    },
  };
  const prisma = {
    $transaction: async (callback) => callback(tx),
  };
  const { completePasswordChange } = loadModelWithPrisma(prisma);

  await assert.rejects(
    completePasswordChange({
      otpId: 'otp-1',
      userId: 'user-1',
      passwordHash: 'new-hash',
    }),
    /OTP is no longer valid/
  );
  assert.equal(userUpdateCalled, false);
});

test('migration enforces one active otp per user with a partial unique index', () => {
  const source = readFileSync(
    path.join(__dirname, '../../prisma/migrations/20260709000000_add_password_change_otp/migration.sql'),
    'utf8'
  );

  assert.match(
    source,
    /database-level guard so concurrent requests cannot leave multiple active OTPs for one user/
  );
  assert.match(
    source,
    /CREATE UNIQUE INDEX "PasswordChangeOtp_one_active_per_user_key" ON "PasswordChangeOtp"\("user_id"\) WHERE "used_at" IS NULL;/
  );
});
