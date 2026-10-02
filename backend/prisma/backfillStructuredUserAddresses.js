'use strict';

const path = require('node:path');

const USER_ADDRESS_FIELDS = Object.freeze([
  ['addressProvinceCode', 'provinceCode'],
  ['addressProvinceName', 'provinceName'],
  ['addressWardCode', 'wardCode'],
  ['addressWardName', 'wardName'],
  ['addressStreetRef', 'streetRef'],
  ['addressStreetName', 'streetName'],
  ['addressDetail', 'detail'],
]);
const USER_ADDRESS_FIELD_NAMES = USER_ADDRESS_FIELDS.map(([name]) => name);
const USER_SELECT = Object.freeze({
  id: true,
  address: true,
  ...Object.fromEntries(USER_ADDRESS_FIELD_NAMES.map((field) => [field, true])),
});

const USAGE = `Backfill structured two-level Vietnam addresses from User.address.

Usage: node prisma/backfillStructuredUserAddresses.js [--apply --backup-confirmed [--allow-remote-db]]

Default mode is a dry run. --apply requires --backup-confirmed.
Remote database mutation also requires --allow-remote-db. The command only
connects through DATABASE_URL and never changes User.address or Order records.`;

const parseCliArgs = (argv) => {
  const options = {
    mode: 'dry-run',
    backupConfirmed: false,
    allowRemoteDb: false,
    help: false,
    errors: [],
  };
  let apply = false;

  for (const arg of argv) {
    switch (arg) {
      case '--apply':
        apply = true;
        break;
      case '--backup-confirmed':
        options.backupConfirmed = true;
        break;
      case '--allow-remote-db':
        options.allowRemoteDb = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        options.errors.push('Unsupported argument.');
    }
  }

  if (options.backupConfirmed && !apply) {
    options.errors.push('--backup-confirmed only makes sense together with --apply.');
  }
  if (options.allowRemoteDb && !apply) {
    options.errors.push('--allow-remote-db only makes sense together with --apply.');
  }
  options.mode = apply ? 'apply' : 'dry-run';
  return options;
};

const normalizeHostname = (hostname) => String(hostname ?? '').toLowerCase().replace(/^\[|\]$/g, '');
const isLoopbackHostname = (hostname) =>
  hostname === 'localhost' || hostname === '::1' || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

// Deliberately inspects only DATABASE_URL. DIRECT_URL is neither a connection
// fallback nor a mutation-safety input for this cutover.
const resolveDatabaseTarget = (env = process.env) => {
  const rawDatabaseUrl = env?.DATABASE_URL;
  if (typeof rawDatabaseUrl !== 'string' || rawDatabaseUrl.trim() === '') {
    return { error: 'DATABASE_URL is not set. Configure the application database URL before running this CLI.' };
  }

  let parsed;
  try {
    parsed = new URL(rawDatabaseUrl.trim());
  } catch {
    return { error: 'DATABASE_URL is not a valid connection URL.' };
  }
  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    return { error: 'DATABASE_URL must use the postgresql:// scheme.' };
  }

  const host = normalizeHostname(parsed.hostname);
  if (!host || !parsed.pathname.replace(/^\/+/, '')) {
    return { error: 'DATABASE_URL must include both a host and a database name.' };
  }
  return { target: { host, isLocal: isLoopbackHostname(host) } };
};

const resolveApplyGuard = ({ apply, backupConfirmed, allowRemoteDb, target }) => {
  if (!apply) return { ok: true, issues: [] };

  const issues = [];
  if (!backupConfirmed) {
    issues.push('--backup-confirmed is required: take a database backup and confirm it before applying.');
  }
  if (!target.isLocal && !allowRemoteDb) {
    issues.push('Refusing to modify a remote database; pass --allow-remote-db only after confirming the backup and target.');
  }
  return { ok: issues.length === 0, issues };
};

const hasValue = (value) => typeof value === 'string' && value.trim() !== '';

const buildUserAddressSnapshot = (user) => Object.fromEntries(
  USER_ADDRESS_FIELD_NAMES.map((field) => [field, user[field] ?? null])
);

const mapMatchedAddress = (address) => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) return null;
  const data = {};
  for (const [field, source] of USER_ADDRESS_FIELDS) {
    if (!hasValue(address[source])) return null;
    data[field] = address[source];
  }
  return data;
};

const isCompleteAddress = (user) => USER_ADDRESS_FIELD_NAMES.every((field) => hasValue(user[field]));

/**
 * Resolve every legacy value before the first database write. The resulting
 * compare-and-set predicates include both the original free-form address and
 * all seven original structured fields, so concurrent user edits are skipped.
 */
const runBackfill = async ({
  prisma,
  matchLegacyAddress,
  apply = false,
  logger = console,
} = {}) => {
  if (!prisma?.user?.findMany || !prisma?.user?.updateMany) {
    throw new Error('A Prisma client with User findMany/updateMany is required.');
  }
  const matcher = matchLegacyAddress
    || require('../src/services/addressProvider.service').matchLegacyAddress;
  if (typeof matcher !== 'function') {
    throw new Error('The production legacy address matcher is unavailable.');
  }

  const users = await prisma.user.findMany({
    where: { address: { not: null } },
    select: USER_SELECT,
  });
  if (!Array.isArray(users)) throw new Error('Prisma returned an invalid User result.');

  const staged = [];
  for (const user of users) {
    const entry = { id: user.id, status: 'empty-address' };
    if (!hasValue(user.address)) {
      staged.push(entry);
      continue;
    }
    if (isCompleteAddress(user)) {
      entry.status = 'complete';
      staged.push(entry);
      continue;
    }

    const match = await matcher(user.address);
    if (match?.status === 'ambiguous' || match?.status === 'unmatched') {
      entry.status = match.status;
      staged.push(entry);
      continue;
    }
    if (match?.status !== 'matched') {
      throw new Error('The legacy address matcher returned an invalid result.');
    }

    const data = mapMatchedAddress(match.address);
    if (!data) throw new Error('The legacy address matcher returned an invalid matched address.');
    const conflicts = USER_ADDRESS_FIELD_NAMES.some((field) =>
      hasValue(user[field]) && user[field] !== data[field]);
    if (conflicts) {
      entry.status = 'manual';
      staged.push(entry);
      continue;
    }

    entry.status = 'matched';
    entry.where = {
      id: user.id,
      address: user.address,
      ...buildUserAddressSnapshot(user),
    };
    entry.data = data;
    staged.push(entry);
  }

  const plannedMatches = staged.filter((entry) => entry.status === 'matched').length;
  let updated = 0;
  let stale = 0;
  if (apply && plannedMatches > 0) {
    const applyPlan = async (transaction) => {
      for (const entry of staged) {
        if (entry.status !== 'matched') continue;
        const result = await transaction.user.updateMany({ where: entry.where, data: entry.data });
        if (result?.count === 1) {
          entry.status = 'updated';
          updated += 1;
        } else if (result?.count === 0) {
          entry.status = 'stale';
          stale += 1;
        } else {
          throw new Error('Conditional User address update returned an invalid row count.');
        }
      }
    };

    if (typeof prisma.$transaction === 'function') {
      await prisma.$transaction((transaction) => applyPlan(transaction));
    } else {
      await applyPlan(prisma);
    }
  }

  const counts = {
    scanned: staged.length,
    complete: 0,
    emptyAddress: 0,
    matched: plannedMatches,
    ambiguous: 0,
    unmatched: 0,
    manual: 0,
    updated,
    stale,
  };
  for (const entry of staged) {
    if (entry.status === 'complete') counts.complete += 1;
    else if (entry.status === 'empty-address') counts.emptyAddress += 1;
    else if (entry.status === 'ambiguous') counts.ambiguous += 1;
    else if (entry.status === 'unmatched') counts.unmatched += 1;
    else if (entry.status === 'manual') counts.manual += 1;
  }

  logger.log(apply ? 'Address backfill results:' : 'Address backfill dry-run results:');
  for (const entry of staged) logger.log(`id=${entry.id} status=${entry.status}`);
  logger.log(
    `scanned=${counts.scanned} matched=${counts.matched} updated=${counts.updated} `
    + `ambiguous=${counts.ambiguous} unmatched=${counts.unmatched} manual=${counts.manual} `
    + `complete=${counts.complete} emptyAddress=${counts.emptyAddress} stale=${counts.stale}`
  );
  if (!apply) logger.log('Dry run only: no database changes were made.');

  return { counts, results: staged.map(({ id, status }) => ({ id, status })) };
};

const runCli = async (argv, {
  env = process.env,
  logger = console,
  prisma: suppliedPrisma,
  matchLegacyAddress,
} = {}) => {
  const write = (line = '') => logger.log(line);
  const options = parseCliArgs(argv);
  if (options.errors.length) {
    write('Invalid arguments:');
    for (const error of options.errors) write(`  - ${error}`);
    write('');
    write(USAGE);
    return 2;
  }
  if (options.help) {
    write(USAGE);
    return 0;
  }

  const { target, error } = resolveDatabaseTarget(env);
  if (error) {
    write(error);
    return 1;
  }
  const apply = options.mode === 'apply';
  const guard = resolveApplyGuard({
    apply,
    backupConfirmed: options.backupConfirmed,
    allowRemoteDb: options.allowRemoteDb,
    target,
  });
  if (!guard.ok) {
    write('Refusing to apply:');
    for (const issue of guard.issues) write(`  - ${issue}`);
    return 1;
  }

  let prisma = suppliedPrisma;
  const ownsPrisma = !prisma;
  try {
    if (!prisma) {
      const { PrismaClient } = require('@prisma/client');
      prisma = new PrismaClient();
    }
    await runBackfill({ prisma, matchLegacyAddress, apply, logger });
    return 0;
  } catch {
    // Never print provider errors, database URLs, or source addresses.
    write('Address backfill failed; inspect configuration and retry. No source addresses or credentials were logged.');
    return 1;
  } finally {
    if (ownsPrisma && prisma?.$disconnect) await prisma.$disconnect().catch(() => {});
  }
};

const main = async (argv = process.argv.slice(2)) => {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });
  const exitCode = await runCli(argv, { env: process.env, logger: console });
  process.exitCode = exitCode;
  return exitCode;
};

if (require.main === module) {
  main().catch(() => {
    console.error('Address backfill failed; inspect configuration and retry.');
    process.exitCode = 1;
  });
}

module.exports = {
  parseCliArgs,
  resolveApplyGuard,
  resolveDatabaseTarget,
  runBackfill,
  runCli,
};
