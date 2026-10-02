'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  parseCliArgs,
  resolveDatabaseTarget,
  runBackfill,
  runCli,
} = require('./backfillStructuredUserAddresses');

const ADDRESS_FIELDS = [
  'addressProvinceCode',
  'addressProvinceName',
  'addressWardCode',
  'addressWardName',
  'addressDetail',
];
const MATCHED = {
  status: 'matched',
  address: {
    provinceCode: '79',
    provinceName: 'Thành phố Hồ Chí Minh',
    wardCode: '26734',
    wardName: 'Phường Bến Thành',
    detail: '12A Lê Lợi',
  },
};
const LEGACY_EXACT = '12A Lê Lợi, Phường Bến Thành, Thành phố Hồ Chí Minh';
const LEGACY_AMBIGUOUS = 'Nguyễn Huệ, Thành phố Hồ Chí Minh';
const LEGACY_UNMATCHED = 'rural address with no verified match';

const userRow = (id, address, structured = {}) => ({
  id,
  address,
  ...Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, structured[field] ?? null])),
});

const makePrisma = (users, orders = [], { onTransaction } = {}) => {
  const state = {
    users: structuredClone(users),
    orders: structuredClone(orders),
  };
  const updateCalls = [];
  const prisma = {
    user: {
      async findMany({ where, select }) {
        assert.deepEqual(where, { address: { not: null } });
        return state.users
          .filter((user) => user.address !== null)
          .map((user) => Object.fromEntries(Object.keys(select).map((field) => [field, user[field]])));
      },
      async updateMany({ where, data }) {
        updateCalls.push({ where: structuredClone(where), data: structuredClone(data) });

        const user = state.users.find((row) => row.id === where.id);
        if (!user || Object.entries(where).some(([field, value]) => user[field] !== value)) return { count: 0 };
        Object.assign(user, data);
        return { count: 1 };
      },
    },
    async $transaction(callback) {
      onTransaction?.(state);
      return callback(prisma);
    },
  };
  return { prisma, state, updateCalls };
};

const captureLogger = () => {
  const lines = [];
  return { lines, logger: { log: (line) => lines.push(String(line)) } };
};

const matcherFor = (entries) => async (legacyText) => {
  if (!Object.hasOwn(entries, legacyText)) throw new Error(`Unexpected legacy address: ${legacyText}`);
  const result = entries[legacyText];
  return typeof result === 'function' ? result() : structuredClone(result);
};

const originalStructured = Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, null]));

test('dry run stages exact, ambiguous, unmatched, and conflicting partial records without mutation', async () => {
  const users = [
    userRow('matched-id', LEGACY_EXACT),
    userRow('ambiguous-id', LEGACY_AMBIGUOUS),
    userRow('unmatched-id', LEGACY_UNMATCHED),
    userRow('conflict-id', LEGACY_EXACT, { addressWardCode: 'wrong-ward' }),
    userRow('complete-id', 'old but preserved', {
      addressProvinceCode: MATCHED.address.provinceCode,
      addressProvinceName: MATCHED.address.provinceName,
      addressWardCode: MATCHED.address.wardCode,
      addressWardName: MATCHED.address.wardName,
      addressDetail: MATCHED.address.detail,
    }),
  ];
  const orders = [{ id: 'historical-order', shippingAddress: 'historic free-form value' }];
  const { prisma, state, updateCalls } = makePrisma(users, orders);
  const before = structuredClone(state);
  const { logger, lines } = captureLogger();
  const result = await runBackfill({
    prisma,
    matchLegacyAddress: matcherFor({
      [LEGACY_EXACT]: MATCHED,
      [LEGACY_AMBIGUOUS]: { status: 'ambiguous' },
      [LEGACY_UNMATCHED]: { status: 'unmatched' },
    }),
    logger,
  });

  assert.deepEqual(state, before);
  assert.equal(updateCalls.length, 0);
  assert.deepEqual(result.counts, {
    scanned: 5,
    complete: 1,
    emptyAddress: 0,
    matched: 1,
    ambiguous: 1,
    unmatched: 1,
    manual: 1,
    updated: 0,
    stale: 0,
  });
  assert.deepEqual(result.results.map(({ id, status }) => [id, status]), [
    ['matched-id', 'matched'],
    ['ambiguous-id', 'ambiguous'],
    ['unmatched-id', 'unmatched'],
    ['conflict-id', 'manual'],
    ['complete-id', 'complete'],
  ]);
  assert(lines.some((line) => line.includes('id=matched-id status=matched')));
  assert(lines.some((line) => line.includes('id=conflict-id status=manual')));
  assert(!lines.join('\n').includes(LEGACY_EXACT));
  assert(!lines.join('\n').includes('historical free-form value'));

});

test('apply updates only verified exact matches, leaves legacy and historical order addresses intact', async () => {
  const users = [
    userRow('exact-id', LEGACY_EXACT),
    userRow('ambiguous-id', LEGACY_AMBIGUOUS),
    userRow('unmatched-id', LEGACY_UNMATCHED),
    userRow('conflict-id', LEGACY_EXACT, { addressWardCode: 'wrong-ward' }),
    userRow('compatible-partial-id', '12A Lê Lợi', { addressProvinceCode: MATCHED.address.provinceCode }),
  ];
  const orders = [{ id: 'old-order', shippingAddress: 'historic snapshot', shippingProvinceCode: null }];
  const { prisma, state, updateCalls } = makePrisma(users, orders);
  const originalAddresses = new Map(users.map((user) => [user.id, user.address]));
  const originalUsers = structuredClone(state.users);
  const originalOrders = structuredClone(state.orders);
  const result = await runBackfill({
    prisma,
    matchLegacyAddress: matcherFor({
      [LEGACY_EXACT]: MATCHED,
      [LEGACY_AMBIGUOUS]: { status: 'ambiguous' },
      [LEGACY_UNMATCHED]: { status: 'unmatched' },
      '12A Lê Lợi': MATCHED,
    }),
    apply: true,
    logger: captureLogger().logger,
  });

  assert.equal(result.counts.updated, 2);
  assert.equal(updateCalls.length, 2);
  for (const call of updateCalls) {
    assert.deepEqual(Object.keys(call.data).sort(), [...ADDRESS_FIELDS].sort());
    assert.deepEqual(Object.keys(call.where).sort(), ['address', 'id', ...ADDRESS_FIELDS].sort());
    assert.equal(call.where.address, originalAddresses.get(call.where.id));
  }
  for (const id of ['exact-id', 'compatible-partial-id']) {
    const updated = state.users.find((user) => user.id === id);
    assert.equal(updated.address, originalAddresses.get(id));
    assert.deepEqual(ADDRESS_FIELDS.map((field) => updated[field]), [
      MATCHED.address.provinceCode,
      MATCHED.address.provinceName,
      MATCHED.address.wardCode,
      MATCHED.address.wardName,
      MATCHED.address.detail,
    ]);
  }
  for (const id of ['ambiguous-id', 'unmatched-id', 'conflict-id']) {
    const unchanged = state.users.find((user) => user.id === id);
    assert.deepEqual(unchanged, originalUsers.find((user) => user.id === id));
  }
  assert.equal(state.users.find((user) => user.id === 'conflict-id').addressWardCode, 'wrong-ward');
  assert.deepEqual(state.orders, originalOrders);
  assert.deepEqual(result.results.map(({ id, status }) => [id, status]), [
    ['exact-id', 'updated'],
    ['ambiguous-id', 'ambiguous'],
    ['unmatched-id', 'unmatched'],
    ['conflict-id', 'manual'],
    ['compatible-partial-id', 'updated'],
  ]);
});

test('conditional update skips a user whose legacy address changed after planning', async () => {
  const { prisma, state, updateCalls } = makePrisma(
    [userRow('stale-id', LEGACY_EXACT)],
    [],
    { onTransaction: (current) => {
      current.users[0].address = 'new concurrent address';
      current.users[0].addressDetail = 'concurrent structured update';
    } }
  );
  const result = await runBackfill({
    prisma,
    matchLegacyAddress: matcherFor({ [LEGACY_EXACT]: MATCHED }),
    apply: true,
    logger: captureLogger().logger,
  });

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(updateCalls[0].where, { id: 'stale-id', address: LEGACY_EXACT, ...originalStructured });
  assert.equal(state.users[0].address, 'new concurrent address');
  assert.deepEqual(ADDRESS_FIELDS.map((field) => state.users[0][field]), [
    null, null, null, null, 'concurrent structured update',
  ]);
  assert.equal(result.counts.stale, 1);
  assert.equal(result.results[0].status, 'stale');
});

test('rerunning apply skips complete records and is idempotent', async () => {
  const { prisma, state, updateCalls } = makePrisma([userRow('repeat-id', LEGACY_EXACT)]);
  const matcher = matcherFor({ [LEGACY_EXACT]: MATCHED });
  const first = await runBackfill({ prisma, matchLegacyAddress: matcher, apply: true, logger: captureLogger().logger });
  const afterFirst = structuredClone(state.users[0]);
  const second = await runBackfill({
    prisma,
    matchLegacyAddress: async () => { throw new Error('complete address should not be rematched'); },
    apply: true,
    logger: captureLogger().logger,
  });

  assert.equal(first.counts.updated, 1);
  assert.equal(second.counts.updated, 0);
  assert.equal(second.counts.complete, 1);
  assert.equal(updateCalls.length, 1);
  assert.deepEqual(state.users[0], afterFirst);
});

test('provider outage after earlier staged matches performs zero writes', async () => {
  const users = [userRow('would-match-id', LEGACY_EXACT), userRow('provider-fails-id', 'second private address')];
  const { prisma, state, updateCalls } = makePrisma(users);
  const before = structuredClone(state);
  const { logger, lines } = captureLogger();
  let calls = 0;

  await assert.rejects(runBackfill({
    prisma,
    matchLegacyAddress: async () => {
      calls += 1;
      if (calls === 1) return structuredClone(MATCHED);
      throw new Error('provider failure containing a credential and private address');
    },
    apply: true,
    logger,
  }));

  assert.equal(calls, 2);
  assert.equal(updateCalls.length, 0);
  assert.deepEqual(state, before);
  assert.deepEqual(lines, []);
});

test('CLI defaults to dry run, uses DATABASE_URL only, and rejects unsafe apply flags', async () => {
  assert.equal(parseCliArgs([]).mode, 'dry-run');
  assert.equal(parseCliArgs(['-h']).help, true);
  assert.equal(parseCliArgs(['--help']).help, true);
  assert(parseCliArgs(['--backup-confirmed']).errors.length > 0);
  assert(parseCliArgs(['--allow-remote-db']).errors.length > 0);
  assert(parseCliArgs(['--apply', '--unknown']).errors.length > 0);
  assert(resolveDatabaseTarget({ DIRECT_URL: 'postgresql://remote/db' }).error);

  const local = resolveDatabaseTarget({
    DATABASE_URL: 'postgresql://user:secret@localhost:5432/localdb',
    DIRECT_URL: 'postgresql://other:secret@remote.example/prod',
  });
  assert.equal(local.target.isLocal, true);
  assert(!JSON.stringify(local).includes('secret'));

  const remote = { DATABASE_URL: 'postgresql://user:secret@remote.example/prod' };
  let queries = 0;
  const unusedPrisma = {
    user: {
      findMany: async () => { queries += 1; return []; },
      updateMany: async () => { throw new Error('no record can require an update'); },
    },
  };
  const { logger, lines } = captureLogger();
  const missingBackup = await runCli(['--apply'], { env: { DATABASE_URL: 'postgresql://localhost/local' }, prisma: unusedPrisma, logger });
  const remoteWithoutFlag = await runCli(['--apply', '--backup-confirmed'], { env: remote, prisma: unusedPrisma, logger });
  assert.equal(missingBackup, 1);
  assert.equal(remoteWithoutFlag, 1);
  assert.equal(queries, 0);
  assert(!lines.join('\n').includes('secret'));

  const defaultDryRun = await runCli([], {
    env: { DATABASE_URL: 'postgresql://localhost/local' },
    prisma: unusedPrisma,
    matchLegacyAddress: matcherFor({}),
    logger,
  });
  assert.equal(defaultDryRun, 0);
  assert.equal(queries, 1);

  const accepted = await runCli(['--apply', '--backup-confirmed'], {
    env: { DATABASE_URL: 'postgresql://localhost/local', DIRECT_URL: 'postgresql://different-host/prod' },
    prisma: unusedPrisma,
    matchLegacyAddress: matcherFor({}),
    logger,
  });
  assert.equal(accepted, 0);
  assert.equal(queries, 2);

  const remoteAccepted = await runCli(['--apply', '--backup-confirmed', '--allow-remote-db'], {
    env: remote,
    prisma: unusedPrisma,
    matchLegacyAddress: matcherFor({}),
    logger,
  });
  assert.equal(remoteAccepted, 0);
  assert.equal(queries, 3);
});
