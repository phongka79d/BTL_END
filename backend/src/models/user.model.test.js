const assert = require('node:assert/strict');
const { after, beforeEach, test } = require('node:test');
const { Prisma } = require('@prisma/client');

const databasePath = require.resolve('../config/database');
const originalDatabaseModule = require.cache[databasePath];
const originalUserModelModule = require.cache[require.resolve('./user.model')];

const users = [
  { id: 'customer-1', username: 'alpha customer', email: 'c1@example.com', fullName: 'Customer One', role: 'customer', createdAt: new Date('2026-06-09T00:00:00Z') },
  { id: 'customer-2', username: 'customer two', email: 'c2@example.com', fullName: 'Alpha Customer Two', role: 'customer', createdAt: new Date('2026-06-07T00:00:00Z') },
  { id: 'customer-other', username: 'customer other', email: 'other@example.com', fullName: 'Customer Other', role: 'customer', createdAt: new Date('2026-06-08T00:00:00Z') },
  { id: 'staff-1', username: 'staff one', email: 'alpha-staff@example.com', fullName: 'Staff One', role: 'staff', createdAt: new Date('2026-06-06T00:00:00Z') },
  { id: 'staff-2', username: 'Alpha Staff Two', email: 's2@example.com', fullName: 'Staff Two', role: 'staff', createdAt: new Date('2026-06-04T00:00:00Z') },
  { id: 'staff-other', username: 'staff other', email: 's3@example.com', fullName: 'Staff Other', role: 'staff', createdAt: new Date('2026-06-05T00:00:00Z') },
  { id: 'admin-1', username: 'admin one', email: 'a1@example.com', fullName: 'Alpha Admin One', role: 'admin', createdAt: new Date('2026-06-03T00:00:00Z') },
  { id: 'admin-2', username: 'admin two', email: 'alpha-admin@example.com', fullName: 'Admin Two', role: 'admin', createdAt: new Date('2026-06-02T00:00:00Z') },
  { id: 'admin-other', username: 'admin other', email: 'a3@example.com', fullName: 'Admin Other', role: 'admin', createdAt: new Date('2026-06-01T00:00:00Z') },
].map((user) => ({
  ...user,
  passwordHash: 'must-not-be-returned',
  address: 'Số 1, Phố Một, Phường Ba Đình, Hà Nội',
  addressProvinceCode: '01',
  addressProvinceName: 'Hà Nội',
  addressWardCode: '00001',
  addressWardName: 'Phường Ba Đình',
  addressStreetRef: 'street-1',
  addressStreetName: 'Phố Một',
  addressDetail: 'Số 1',
}));

const countQueries = [];
const findManyQueries = [];
const matchesWhere = (user, where) => {
  if (where.role !== undefined && user.role !== where.role) return false;
  if (where.OR && !where.OR.some((condition) => {
    const [field, filter] = Object.entries(condition)[0];
    return user[field].toLocaleLowerCase().includes(filter.contains.toLocaleLowerCase());
  })) return false;
  return true;
};
const prisma = {
  user: {
    count: async ({ where }) => {
      countQueries.push(where);
      return users.filter((user) => matchesWhere(user, where)).length;
    },
    findMany: async (query) => {
      findManyQueries.push(query);
      for (const field of Object.keys(query.select)) {
        assert.ok(Object.hasOwn(Prisma.UserScalarFieldEnum, field), `Unknown User select field: ${field}`);
      }
      const rows = users
        .filter((user) => matchesWhere(user, query.where))
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(query.skip, query.skip + query.take);
      return rows.map((user) => Object.fromEntries(
        Object.entries(query.select)
          .filter(([, selected]) => selected)
          .map(([field]) => [field, user[field]])
      ));
    },
  },
};

require.cache[databasePath] = {
  id: databasePath,
  filename: databasePath,
  loaded: true,
  exports: prisma,
};
const userModel = require('./user.model');

beforeEach(() => {
  countQueries.length = 0;
  findManyQueries.length = 0;
});

after(() => {
  delete require.cache[require.resolve('./user.model')];
  if (originalUserModelModule) require.cache[require.resolve('./user.model')] = originalUserModelModule;
  if (originalDatabaseModule) {
    require.cache[databasePath] = originalDatabaseModule;
  } else {
    delete require.cache[databasePath];
  }
});

test('findAll combines each role with keyword search before counting and paginating safe rows', async () => {
  const expectedByRole = {
    customer: 'customer-2',
    staff: 'staff-2',
    admin: 'admin-2',
  };

  for (const [role, expectedId] of Object.entries(expectedByRole)) {
    const result = await userModel.findAll({ role, keyword: 'alpha', page: 2, limit: 1 });

    assert.deepEqual(result.items.map(({ id }) => id), [expectedId]);
    assert.equal(result.items[0].role, role);
    assert.deepEqual(result.pagination, { page: 2, limit: 1, total: 2, totalPages: 2 });
    assert.deepEqual(countQueries.at(-1), findManyQueries.at(-1).where);
    assert.equal(findManyQueries.at(-1).where.role, role);
    assert.ok(findManyQueries.at(-1).where.OR);

    const row = result.items[0];
    assert.equal(row.address, 'Số 1, Phố Một, Phường Ba Đình, Hà Nội');
    assert.equal(row.addressProvinceCode, '01');
    assert.equal(row.addressProvinceName, 'Hà Nội');
    assert.equal(row.addressWardCode, '00001');
    assert.equal(row.addressWardName, 'Phường Ba Đình');
    assert.equal(row.addressStreetRef, 'street-1');
    assert.equal(row.addressStreetName, 'Phố Một');
    assert.equal(row.addressDetail, 'Số 1');
    assert.equal(Object.hasOwn(row, 'passwordHash'), false);
  }
});

test('findAll treats undefined and empty role as unfiltered and preserves pagination defaults', async () => {
  for (const params of [{}, { role: '' }]) {
    const result = await userModel.findAll(params);

    assert.deepEqual(result.items.map(({ id }) => id), [
      'customer-1', 'customer-other', 'customer-2',
      'staff-1', 'staff-other', 'staff-2',
      'admin-1', 'admin-2', 'admin-other',
    ]);
    assert.deepEqual(result.pagination, { page: 1, limit: 10, total: 9, totalPages: 1 });
    assert.equal(Object.hasOwn(findManyQueries.at(-1).where, 'role'), false);
  }
});

test('findAll rejects unknown and non-string roles with HTTP 400 before querying', async () => {
  for (const role of ['manager', null, 3, {}]) {
    await assert.rejects(userModel.findAll({ role }), (error) => {
      assert.equal(error.status, 400);
      assert.equal(error.statusCode, 400);
      return true;
    });
  }

  assert.equal(countQueries.length, 0);
  assert.equal(findManyQueries.length, 0);
});
