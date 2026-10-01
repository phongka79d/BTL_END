const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../config/database');
const orderModel = require('./order.model');

const insensitiveContains = (term) => ({ contains: term, mode: 'insensitive' });

const idCondition = (term) => ({ id: insensitiveContains(term) });
const shippingAddressCondition = (term) => ({ shippingAddress: insensitiveContains(term) });
const recipientNameCondition = (term) => ({ recipientName: insensitiveContains(term) });
const recipientPhoneCondition = (term) => ({ recipientPhone: insensitiveContains(term) });
const userCondition = (field, term) => ({ user: { [field]: insensitiveContains(term) } });

const customerConditions = (term) => [
  recipientNameCondition(term),
  recipientPhoneCondition(term),
  userCondition('fullName', term),
  userCondition('username', term),
  userCondition('email', term),
  userCondition('phone', term)
];

const allConditions = (term) => [
  idCondition(term),
  shippingAddressCondition(term),
  ...customerConditions(term)
];

const stubPrismaSearch = ({ total = 0 } = {}) => {
  const originalCount = prisma.order.count;
  const originalFindMany = prisma.order.findMany;
  const calls = { count: [], findMany: [] };

  prisma.order.count = async (query) => {
    calls.count.push(query);
    return total;
  };
  prisma.order.findMany = async (query) => {
    calls.findMany.push(query);
    return [{ id: 'order_1' }];
  };

  return {
    calls,
    restore: () => {
      prisma.order.count = originalCount;
      prisma.order.findMany = originalFindMany;
    }
  };
};

// Mọi điều kiện OR phải nằm gọn trong miền dữ liệu của trường tìm kiếm:
// không được có khóa nào của miền khác.
const assertNoForbiddenKeys = (where, forbiddenKeys) => {
  for (const condition of where.OR) {
    for (const key of forbiddenKeys) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(condition, key),
        false,
        `điều kiện ${JSON.stringify(condition)} không được chứa ${key}`
      );
    }
  }
};

test('listForAdmin scopes the orderId field to the order id only', async () => {
  // 'Alice' mơ hồ: cũng có thể là tên khách hàng/người nhận hoặc một phần địa chỉ.
  const term = 'Alice';
  const stub = stubPrismaSearch({ total: 11 });

  try {
    const result = await orderModel.listForAdmin({
      searchField: 'orderId',
      keyword: term,
      page: 2,
      limit: 5
    });

    const expectedWhere = { OR: [idCondition(term)] };
    assert.deepEqual(stub.calls.count, [{ where: expectedWhere }]);
    assert.deepEqual(stub.calls.findMany[0].where, expectedWhere);
    assert.equal(stub.calls.findMany[0].skip, 5);
    assert.equal(stub.calls.findMany[0].take, 5);
    assertNoForbiddenKeys(expectedWhere, ['shippingAddress', 'user', 'recipientName', 'recipientPhone']);
    assert.equal(result.pagination.page, 2);
    assert.equal(result.pagination.total, 11);
    assert.equal(result.pagination.totalPages, 3);
  } finally {
    stub.restore();
  }
});

test('listForAdmin scopes the shippingAddress field to the address only', async () => {
  const term = '12 Lê Lợi';
  const stub = stubPrismaSearch({ total: 8 });

  try {
    const result = await orderModel.listForAdmin({ searchField: 'shippingAddress', keyword: term });

    const expectedWhere = { OR: [shippingAddressCondition(term)] };
    assert.deepEqual(stub.calls.count, [{ where: expectedWhere }]);
    assert.deepEqual(stub.calls.findMany[0].where, expectedWhere);
    assertNoForbiddenKeys(expectedWhere, ['id', 'user', 'recipientName', 'recipientPhone']);
    assert.equal(result.pagination.total, 8);
  } finally {
    stub.restore();
  }
});

test('listForAdmin scopes the customer field to recipient snapshots and user identity', async () => {
  const term = '0901234567';
  const stub = stubPrismaSearch({ total: 3 });

  try {
    const result = await orderModel.listForAdmin({ searchField: 'customer', keyword: `  ${term}  ` });

    const expectedWhere = { OR: customerConditions(term) };
    assert.deepEqual(stub.calls.count, [{ where: expectedWhere }]);
    assert.deepEqual(stub.calls.findMany[0].where, expectedWhere);
    assertNoForbiddenKeys(expectedWhere, ['id', 'shippingAddress']);
    assert.equal(result.pagination.total, 3);
  } finally {
    stub.restore();
  }
});

test('listForAdmin keeps the broad union search for absent, empty, or "all" searchField', async () => {
  const term = 'Alice';
  const stub = stubPrismaSearch({ total: 5 });

  try {
    await orderModel.listForAdmin({ keyword: term });
    await orderModel.listForAdmin({ keyword: term, searchField: 'all' });
    await orderModel.listForAdmin({ keyword: term, searchField: '' });

    assert.equal(stub.calls.count.length, 3);
    assert.equal(stub.calls.findMany.length, 3);
    for (const query of stub.calls.count) {
      assert.deepEqual(query.where.OR, allConditions(term));
    }
    for (const query of stub.calls.findMany) {
      assert.deepEqual(query.where.OR, allConditions(term));
    }
  } finally {
    stub.restore();
  }
});

test('listForAdmin accepts a valid search field with an empty keyword and stays unfiltered', async () => {
  const stub = stubPrismaSearch({ total: 4 });

  try {
    const result = await orderModel.listForAdmin({ searchField: 'customer' });

    assert.deepEqual(stub.calls.count, [{ where: {} }]);
    assert.deepEqual(stub.calls.findMany[0].where, {});
    assert.equal(result.pagination.total, 4);
  } finally {
    stub.restore();
  }
});

test('listForAdmin rejects unknown or non-string search fields with a 400 even without a keyword', async () => {
  const stub = stubPrismaSearch();
  const invalidValues = [
    'bogus',
    'id',
    'ALL',
    ['orderId'],
    ['orderId', 'customer'],
    { value: 'customer' },
    0,
    5,
    true
  ];

  try {
    for (const searchField of invalidValues) {
      const label = `searchField=${JSON.stringify(searchField)}`;

      await assert.rejects(
        () => orderModel.listForAdmin({ searchField, keyword: '' }),
        (error) => error.status === 400 && error.message.includes('không hợp lệ'),
        `empty keyword, ${label}`
      );
      await assert.rejects(
        () => orderModel.listForAdmin({ searchField, keyword: 'Alice' }),
        (error) => error.status === 400 && error.message.includes('không hợp lệ'),
        `with keyword, ${label}`
      );
    }

    assert.equal(stub.calls.count.length, 0);
    assert.equal(stub.calls.findMany.length, 0);
  } finally {
    stub.restore();
  }
});

test('listForAdmin applies status, scoped keyword, and pagination to the same where for count and findMany', async () => {
  const term = 'Alice';
  const stub = stubPrismaSearch({ total: 21 });

  try {
    const result = await orderModel.listForAdmin({
      status: 'confirmed',
      searchField: 'customer',
      keyword: term,
      page: 3,
      limit: 10
    });

    const expectedWhere = { status: 'confirmed', OR: customerConditions(term) };
    assert.deepEqual(stub.calls.count, [{ where: expectedWhere }]);
    assert.deepEqual(stub.calls.findMany[0].where, expectedWhere);
    assert.equal(stub.calls.findMany[0].skip, 20);
    assert.equal(stub.calls.findMany[0].take, 10);
    assert.deepEqual(result.pagination, { page: 3, limit: 10, total: 21, totalPages: 3 });
  } finally {
    stub.restore();
  }
});
