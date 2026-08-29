const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../config/database');
const orderModel = require('./order.model');

test('orderModel.listForAdmin calculates correct pagination for page 1 and page 2', async () => {
  const originalCount = prisma.order.count;
  const originalFindMany = prisma.order.findMany;

  try {
    let capturedQueries = [];
    prisma.order.count = async () => 15;
    prisma.order.findMany = async (query) => {
      capturedQueries.push(query);
      return [{ id: 'order_sample' }];
    };

    // Page 1
    const resPage1 = await orderModel.listForAdmin({ page: 1, limit: 5 });
    assert.equal(resPage1.pagination.page, 1);
    assert.equal(resPage1.pagination.limit, 5);
    assert.equal(resPage1.pagination.total, 15);
    assert.equal(resPage1.pagination.totalPages, 3);
    assert.equal(capturedQueries[0].skip, 0);
    assert.equal(capturedQueries[0].take, 5);

    // Page 2
    const resPage2 = await orderModel.listForAdmin({ page: 2, limit: 5 });
    assert.equal(resPage2.pagination.page, 2);
    assert.equal(resPage2.pagination.totalPages, 3);
    assert.equal(capturedQueries[1].skip, 5);
    assert.equal(capturedQueries[1].take, 5);
  } finally {
    prisma.order.count = originalCount;
    prisma.order.findMany = originalFindMany;
  }
});

test('orderModel.listForAdmin combines status and keyword filters and passes to both count and findMany', async () => {
  const originalCount = prisma.order.count;
  const originalFindMany = prisma.order.findMany;

  try {
    let capturedCountQuery = null;
    let capturedFindQuery = null;
    prisma.order.count = async (query) => {
      capturedCountQuery = query;
      return 1;
    };
    prisma.order.findMany = async (query) => {
      capturedFindQuery = query;
      return [{ id: 'order_1' }];
    };

    const res = await orderModel.listForAdmin({ status: 'confirmed', keyword: 'Alice', page: 1, limit: 10 });

    assert.equal(res.pagination.page, 1);
    assert.equal(res.pagination.limit, 10);
    assert.equal(capturedCountQuery.where.status, 'confirmed');
    assert.ok(Array.isArray(capturedCountQuery.where.OR));
    assert.equal(capturedFindQuery.where.status, 'confirmed');
    assert.ok(Array.isArray(capturedFindQuery.where.OR));
    assert.equal(capturedFindQuery.skip, 0);
    assert.equal(capturedFindQuery.take, 10);
  } finally {
    prisma.order.count = originalCount;
    prisma.order.findMany = originalFindMany;
  }
});

test('orderModel.listForAdmin strictly rejects invalid page numbers', async () => {
  await assert.rejects(
    async () => orderModel.listForAdmin({ page: 0 }),
    /Trang phải là số nguyên dương/
  );

  await assert.rejects(
    async () => orderModel.listForAdmin({ page: -5 }),
    /Trang phải là số nguyên dương/
  );

  await assert.rejects(
    async () => orderModel.listForAdmin({ page: 'abc' }),
    /Trang phải là số nguyên dương/
  );
});

test('orderModel.listForAdmin strictly rejects invalid limit bounds', async () => {
  await assert.rejects(
    async () => orderModel.listForAdmin({ limit: 0 }),
    /Giới hạn phải là số nguyên từ 1 đến 100/
  );

  await assert.rejects(
    async () => orderModel.listForAdmin({ limit: 150 }),
    /Giới hạn phải là số nguyên từ 1 đến 100/
  );

  await assert.rejects(
    async () => orderModel.listForAdmin({ limit: 'invalid' }),
    /Giới hạn phải là số nguyên từ 1 đến 100/
  );
});
