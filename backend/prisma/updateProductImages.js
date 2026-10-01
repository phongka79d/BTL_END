'use strict';

/**
 * Image-only cutover CLI for seeded product images.
 *
 * Source of truth: ./seedProducts.js. Existing licensed local WebP assets are
 * retained; other models use direct manufacturer/retailer image links whose
 * reuse permissions have not been verified.
 *
 * Safety contract:
 * - Only the product.imageUrl column is ever written; price, quantity,
 *   accounts, orders and any other data are never touched.
 * - Only rows whose name + brand + category exactly match a seeded product are
 *   considered. Non-seed / user products and products absent from the database
 *   are never modified or created.
 * - A row's imageUrl is only rewritten when it is a seed placeholder
 *   (picsum.photos) or empty. Custom image URLs are preserved.
 * - Default mode is a dry run. Mutation requires --apply plus an explicit
 *   --backup-confirmed acknowledgement, and --allow-remote-db for non-local
 *   DATABASE_URL hosts.
 * - The CLI connects through the application DATABASE_URL only (never
 *   DIRECT_URL), which is printed in sanitised form before any query.
 *
 * `--qa` validates catalog/source configuration, not remote availability or
 * permission to reuse linked photos. Missing images still fail QA.
 */

const fs = require('node:fs');
const path = require('node:path');

const { productsData } = require('./seedProducts');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PRODUCTS_PUBLIC_DIR = path.join(REPO_ROOT, 'frontend', 'public', 'products');
const MANIFEST_FILES = [
  path.join(PRODUCTS_PUBLIC_DIR, 'phones-laptops.json'),
  path.join(PRODUCTS_PUBLIC_DIR, 'watches-accessories.json'),
  path.join(PRODUCTS_PUBLIC_DIR, 'linked-phones-laptops.json'),
  path.join(PRODUCTS_PUBLIC_DIR, 'linked-watches-accessories.json'),
];
const LOCAL_PRODUCT_IMAGE_PREFIX = '/products/';
const SEED_PLACEHOLDER_IMAGE_PATTERN = /^https?:\/\/(?:www\.)?picsum\.photos\//i;
const REQUIRED_LICENSE_FIELDS = ['author', 'license', 'licenseUrl', 'sourceUrl'];
const IDENTITY_SEPARATOR = '\u0000';

const USAGE = `Image-only product image cutover for the seeded catalog.

Default mode is a dry run: it prints the planned imageUrl changes and writes
nothing. Only products whose name + brand + category exactly match a seeded
product are considered, only placeholder (picsum) or empty imageUrl values are
rewritten, and only the imageUrl column is written.

Usage: node prisma/updateProductImages.js [options]

Options:
  --apply              Write the planned imageUrl updates (default: dry run).
  --backup-confirmed   Required with --apply: acknowledge that a database
                       backup was taken immediately before this run.
  --allow-remote-db    Required with --apply when DATABASE_URL points to a
                       non-local host (remote mutation is refused by default).
  --qa                 Verify catalog photo/source configuration. Remote image
                       availability and reuse permissions are not verified.
                       Exits nonzero for missing photos or invalid metadata.
  -h, --help           Show this help.

Exit codes: 0 success; 1 failure or incomplete photo QA; 2 invalid usage.`;

const normalizeImageUrl = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const isSeedPlaceholderImageUrl = (imageUrl) => {
  const normalized = normalizeImageUrl(imageUrl);
  return normalized !== null && SEED_PLACEHOLDER_IMAGE_PATTERN.test(normalized);
};

const readCategoryName = (product) => product.categoryName ?? product.category?.name ?? null;

const getProductIdentity = (product) =>
  `${product.name ?? ''}${IDENTITY_SEPARATOR}${product.brand ?? ''}${IDENTITY_SEPARATOR}${readCategoryName(product) ?? ''}`;

const productNameBrandKey = (product) =>
  `${product.name ?? product.productName ?? ''}${IDENTITY_SEPARATOR}${product.brand ?? ''}`;

/**
 * Diff the seeded image configuration against database rows.
 * Pure: never touches the database, never mutates its inputs.
 */
const buildImageUpdatePlan = (seedProducts, dbProducts) => {
  const dbProductsByIdentity = new Map();
  for (const dbProduct of dbProducts) {
    const identity = getProductIdentity(dbProduct);
    if (!dbProductsByIdentity.has(identity)) {
      dbProductsByIdentity.set(identity, []);
    }
    dbProductsByIdentity.get(identity).push(dbProduct);
  }

  const updates = [];
  const preservedCustomImages = [];
  const unchanged = [];
  const missingSeedProducts = [];
  const matchedDbProductIds = new Set();

  for (const seedProduct of seedProducts) {
    const candidates = dbProductsByIdentity.get(getProductIdentity(seedProduct)) ?? [];
    if (candidates.length === 0) {
      missingSeedProducts.push({
        name: seedProduct.name,
        brand: seedProduct.brand,
        categoryName: readCategoryName(seedProduct),
        imageUrl: seedProduct.imageUrl ?? null,
      });
      continue;
    }

    const nextImageUrl = normalizeImageUrl(seedProduct.imageUrl);
    for (const candidate of candidates) {
      matchedDbProductIds.add(candidate.id);
      const currentImageUrl = normalizeImageUrl(candidate.imageUrl);
      const summary = {
        id: candidate.id,
        name: candidate.name,
        brand: candidate.brand,
        categoryName: readCategoryName(candidate),
        currentImageUrl,
      };

      if (currentImageUrl === nextImageUrl) {
        unchanged.push(summary);
        continue;
      }

      if (currentImageUrl === null || isSeedPlaceholderImageUrl(currentImageUrl)) {
        updates.push({
          ...summary,
          nextImageUrl,
          // Prisma payload: imageUrl is the only column this CLI ever writes.
          data: { imageUrl: nextImageUrl },
        });
        continue;
      }

      preservedCustomImages.push(summary);
    }
  }

  const unmatchedDbProducts = dbProducts
    .filter((dbProduct) => !matchedDbProductIds.has(dbProduct.id))
    .map((dbProduct) => ({
      id: dbProduct.id,
      name: dbProduct.name,
      brand: dbProduct.brand,
      categoryName: readCategoryName(dbProduct),
      currentImageUrl: normalizeImageUrl(dbProduct.imageUrl),
    }));

  return { updates, preservedCustomImages, unchanged, missingSeedProducts, unmatchedDbProducts };
};

/**
 * Apply a plan produced by buildImageUpdatePlan through Prisma.
 * Runs as one transaction so a failure leaves every imageUrl untouched.
 */
const applyImageUpdatePlan = async (prisma, plan) => {
  if (plan.updates.length === 0) {
    return { updated: 0 };
  }

  await prisma.$transaction(
    plan.updates.map((update) =>
      prisma.product.update({ where: { id: update.id }, data: update.data })
    )
  );

  return { updated: plan.updates.length };
};

const loadProductImageManifests = (manifestFiles = MANIFEST_FILES) => {
  const entries = [];
  for (const manifestFile of manifestFiles) {
    const parsed = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    for (const entry of parsed) {
      entries.push({ ...entry, manifestFile });
    }
  }
  return entries;
};

/**
 * Verify seeded photos against local assets or HTTPS links and source
 * manifests. Licensed local photos retain attribution; linked photos are
 * explicitly marked as having unverified reuse permission.
 */
const verifySeedImageConfiguration = (seedProducts, options = {}) => {
  const productsPublicDir = options.productsPublicDir ?? PRODUCTS_PUBLIC_DIR;
  const errors = [];
  const covered = [];
  const missing = [];

  let manifestEntries = options.manifests ?? null;
  if (manifestEntries === null) {
    try {
      manifestEntries = loadProductImageManifests();
    } catch (error) {
      errors.push(`Unable to read the image source manifests: ${error.message}`);
      manifestEntries = [];
    }
  }

  const manifestByIdentity = new Map();
  for (const entry of manifestEntries) {
    const identity = productNameBrandKey(entry);
    if (!manifestByIdentity.has(identity)) {
      manifestByIdentity.set(identity, []);
    }
    manifestByIdentity.get(identity).push(entry);
  }

  for (const seedProduct of seedProducts) {
    const label = `${seedProduct.name} (${seedProduct.brand} / ${readCategoryName(seedProduct)})`;
    const imageUrl = normalizeImageUrl(seedProduct.imageUrl);

    if (imageUrl === null) {
      missing.push({
        name: seedProduct.name,
        brand: seedProduct.brand,
        categoryName: readCategoryName(seedProduct),
      });
      continue;
    }

    let valid = true;

    const isLocalImage = imageUrl.startsWith(LOCAL_PRODUCT_IMAGE_PREFIX);
    if (!isLocalImage) {
      try {
        const imageLink = new URL(imageUrl);
        if (imageLink.protocol !== 'https:' || ['picsum.photos', 'www.picsum.photos'].includes(imageLink.hostname)) {
          throw new Error('not a model photo link');
        }
      } catch {
        errors.push(`${label}: seeded imageUrl must be a local /products/... asset or a non-placeholder HTTPS image link`);
        valid = false;
      }
    } else {
      const relativeAssetPath = imageUrl.slice(LOCAL_PRODUCT_IMAGE_PREFIX.length);
      const assetPath = path.join(productsPublicDir, relativeAssetPath);
      if (relativeAssetPath === '' || !fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
        errors.push(`${label}: seeded image asset is missing on disk: ${assetPath}`);
        valid = false;
      }
    }

    const manifestCandidates = manifestByIdentity.get(productNameBrandKey(seedProduct)) ?? [];
    const manifestEntry = manifestCandidates.length === 1 ? manifestCandidates[0] : null;

    if (manifestCandidates.length === 0) {
      errors.push(`${label}: no source manifest entry found for this product name and brand`);
      valid = false;
    } else if (manifestCandidates.length > 1) {
      errors.push(`${label}: duplicate source manifest entries found for this product name and brand`);
      valid = false;
    } else {
      if (manifestEntry.imageUrl !== imageUrl) {
        errors.push(
          `${label}: seeded imageUrl "${imageUrl}" does not match manifest imageUrl "${manifestEntry.imageUrl}"`
        );
        valid = false;
      }
      for (const field of isLocalImage ? REQUIRED_LICENSE_FIELDS : ['sourceUrl']) {
        const value = manifestEntry[field];
        if (typeof value !== 'string' || value.trim() === '') {
          errors.push(`${label}: manifest entry is missing ${isLocalImage ? 'license attribution' : 'source'} field "${field}"`);
          valid = false;
        }
      }
      if (!isLocalImage && manifestEntry.reusePermission !== 'unverified') {
        errors.push(`${label}: linked photo reusePermission must be explicitly unverified`);
        valid = false;
      }
    }

    if (valid) {
      covered.push({
        name: seedProduct.name,
        brand: seedProduct.brand,
        categoryName: readCategoryName(seedProduct),
        imageUrl,
        sourceUrl: manifestEntry.sourceUrl,
        ...(isLocalImage
          ? { author: manifestEntry.author, license: manifestEntry.license }
          : { reusePermission: 'unverified' }),
      });
    }
  }

  return { ok: errors.length === 0, covered, missing, errors };
};

/**
 * Build the honest photo QA report. Exits nonzero whenever photo coverage is
 * incomplete, so the output can never be mistaken for full photo acceptance.
 */
const buildPhotoQaReport = (verification, totalProducts) => {
  const total = totalProducts ?? verification.covered.length + verification.missing.length;
  const complete = verification.ok && verification.missing.length === 0;
  const lines = [];

  lines.push(
    `Photo QA: ${verification.covered.length}/${total} seeded products have model photo source configuration.`
  );
  const linkedCount = verification.covered.filter((product) => product.reusePermission === 'unverified').length;
  if (linkedCount > 0) {
    lines.push(`${linkedCount} linked photos have unverified reuse permission; remote availability is not checked by this command.`);
  }

  if (verification.errors.length > 0) {
    lines.push('Seed image configuration errors:');
    for (const error of verification.errors) {
      lines.push(`  - ${error}`);
    }
  }

  if (verification.missing.length > 0) {
    lines.push(
      `Missing actual photos: ${verification.missing.length}/${total} products have imageUrl null and no model photo source yet:`
    );
    for (const product of verification.missing) {
      lines.push(`  - ${product.name} (${product.brand} / ${product.categoryName})`);
    }
  }

  lines.push(
    complete
      ? 'Photo QA PASS: every seeded product has valid photo/source configuration.'
      : 'Photo QA INCOMPLETE: full photo acceptance is NOT met; add actual photos for the listed products.'
  );

  return { complete, exitCode: complete ? 0 : 1, lines };
};

const parseCliArgs = (argv) => {
  const options = { mode: 'dry-run', backupConfirmed: false, allowRemoteDb: false, help: false, errors: [] };
  let apply = false;
  let qa = false;

  for (const arg of argv) {
    switch (arg) {
      case '--apply':
        apply = true;
        break;
      case '--qa':
        qa = true;
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
        options.errors.push(`Unsupported argument: ${arg}`);
    }
  }

  if (apply && qa) {
    options.errors.push('--qa cannot be combined with --apply.');
  }
  if (options.backupConfirmed && !apply) {
    options.errors.push('--backup-confirmed only makes sense together with --apply.');
  }
  if (options.allowRemoteDb && !apply) {
    options.errors.push('--allow-remote-db only makes sense together with --apply.');
  }

  options.mode = qa && !apply ? 'qa' : apply ? 'apply' : 'dry-run';

  return options;
};

const normalizeHostname = (hostname) =>
  String(hostname ?? '')
    .toLowerCase()
    .replace(/^\[|\]$/g, '');

const isLoopbackHostname = (hostname) =>
  hostname === 'localhost' || hostname === '::1' || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

const canonicalHost = (hostname) => (isLoopbackHostname(hostname) ? 'localhost' : hostname);

/**
 * Resolve the CLI's database target from the environment. The CLI connects
 * through the application DATABASE_URL only; DIRECT_URL is inspected purely to
 * confirm the environment is coherent.
 */
const resolveDatabaseTarget = (env = process.env) => {
  const rawDatabaseUrl = env.DATABASE_URL;

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

  const hostname = normalizeHostname(parsed.hostname);
  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));

  if (hostname === '' || database === '') {
    return { error: 'DATABASE_URL must include both a host and a database name.' };
  }

  const target = {
    host: hostname,
    port: parsed.port || null,
    database,
    isLocal: isLoopbackHostname(hostname),
    directUrl: { status: 'missing', host: null, database: null },
  };

  const rawDirectUrl = env.DIRECT_URL;
  if (typeof rawDirectUrl === 'string' && rawDirectUrl.trim() !== '') {
    try {
      const parsedDirect = new URL(rawDirectUrl.trim());
      const directHost = normalizeHostname(parsedDirect.hostname);
      const directDatabase = decodeURIComponent(parsedDirect.pathname.replace(/^\/+/, ''));
      let status = 'match';
      if (directDatabase !== target.database) {
        status = 'database-mismatch';
      } else if (canonicalHost(directHost) !== canonicalHost(target.host)) {
        status = 'host-mismatch';
      }
      target.directUrl = { status, host: directHost, database: directDatabase };
    } catch {
      target.directUrl = { status: 'invalid', host: null, database: null };
    }
  }

  return { target };
};

/**
 * Apply-mode safety gates. Never mutates anything; returns blocking issues and
 * non-blocking warnings for display.
 */
const resolveApplyGuard = ({ apply, backupConfirmed, allowRemoteDb, target }) => {
  if (!apply) {
    return { ok: true, issues: [], warnings: [] };
  }

  const issues = [];
  const warnings = [];

  if (!backupConfirmed) {
    issues.push('--backup-confirmed is required: take a database backup and confirm it before applying.');
  }
  if (!target.isLocal && !allowRemoteDb) {
    issues.push(
      `Refusing to modify the non-local database host "${target.host}"; pass --allow-remote-db only after confirming the backup and the target.`
    );
  }
  if (target.directUrl.status === 'database-mismatch') {
    issues.push(
      `DATABASE_URL targets database "${target.database}" but DIRECT_URL targets "${target.directUrl.database}"; both must address the same database before applying.`
    );
  }
  if (target.directUrl.status === 'host-mismatch') {
    warnings.push(
      `DATABASE_URL and DIRECT_URL use different hosts ("${target.host}" vs "${target.directUrl.host}"); expected for pooled/direct pairs, and the CLI uses DATABASE_URL only.`
    );
  }
  if (target.directUrl.status === 'missing') {
    warnings.push('DIRECT_URL is not set; the CLI uses DATABASE_URL only.');
  }
  if (target.directUrl.status === 'invalid') {
    warnings.push('DIRECT_URL is not a valid connection URL; the CLI uses DATABASE_URL only.');
  }

  return { ok: issues.length === 0, issues, warnings };
};

const describeDatabaseTarget = (target) => {
  const port = target.port ? `:${target.port}` : '';
  return `postgresql://${target.host}${port}/${target.database} (${target.isLocal ? 'local' : 'REMOTE'})`;
};

const describeImageValue = (imageUrl) => (imageUrl === null ? 'null (no actual photo)' : imageUrl);

const formatImageCutoverPlan = ({ target, verification, plan }) => {
  const lines = [];
  const totalProducts = verification.covered.length + verification.missing.length;

  lines.push('Product image cutover (imageUrl column only).');
  lines.push(`Database target: ${describeDatabaseTarget(target)}`);
  if (!target.isLocal) {
    lines.push('Target host is not local; applying requires the explicit --allow-remote-db flag.');
  }
  lines.push(
    `Seed coverage: ${verification.covered.length}/${totalProducts} products have model photos configured; ${verification.missing.length} have no actual photo (imageUrl null).`
  );

  if (verification.errors.length > 0) {
    lines.push('Seed image configuration errors:');
    for (const error of verification.errors) {
      lines.push(`  - ${error}`);
    }
  }

  lines.push(`imageUrl updates planned: ${plan.updates.length}`);
  for (const update of plan.updates) {
    lines.push(
      `  - ${update.name} (${update.brand} / ${update.categoryName}): ${describeImageValue(update.currentImageUrl)} -> ${describeImageValue(update.nextImageUrl)}`
    );
  }

  if (plan.unchanged.length > 0) {
    lines.push(`Already matching the seed configuration: ${plan.unchanged.length}`);
  }
  if (plan.preservedCustomImages.length > 0) {
    lines.push(`Custom images preserved (never overwritten): ${plan.preservedCustomImages.length}`);
    for (const preserved of plan.preservedCustomImages) {
      lines.push(`  - ${preserved.name} (${preserved.brand}): ${preserved.currentImageUrl}`);
    }
  }
  if (plan.missingSeedProducts.length > 0) {
    lines.push(`Seeded products not present in this database (this CLI never creates products): ${plan.missingSeedProducts.length}`);
    for (const missing of plan.missingSeedProducts) {
      lines.push(`  - ${missing.name} (${missing.brand} / ${missing.categoryName})`);
    }
  }
  if (plan.unmatchedDbProducts.length > 0) {
    lines.push(`Non-seed products left untouched: ${plan.unmatchedDbProducts.length}`);
  }

  return lines;
};

const runCli = async (argv, { env = process.env, logger = console } = {}) => {
  const write = (line = '') => logger.log(line);
  const options = parseCliArgs(argv);

  if (options.errors.length > 0) {
    write('Invalid arguments:');
    for (const error of options.errors) {
      write(`  - ${error}`);
    }
    write('');
    write(USAGE);
    return 2;
  }

  if (options.help) {
    write(USAGE);
    return 0;
  }

  const verification = verifySeedImageConfiguration(productsData);

  if (options.mode === 'qa') {
    const report = buildPhotoQaReport(verification, productsData.length);
    for (const line of report.lines) {
      write(line);
    }
    return report.exitCode;
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

  if (apply && !verification.ok) {
    write('Refusing to apply: the seeded image configuration failed verification.');
    for (const verificationError of verification.errors) {
      write(`  - ${verificationError}`);
    }
    return 1;
  }

  if (apply && !guard.ok) {
    write('Refusing to apply:');
    for (const issue of guard.issues) {
      write(`  - ${issue}`);
    }
    return 1;
  }

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const dbProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        brand: true,
        imageUrl: true,
        category: { select: { name: true } },
      },
    });

    const plan = buildImageUpdatePlan(productsData, dbProducts);

    for (const line of formatImageCutoverPlan({ target, verification, plan })) {
      write(line);
    }
    for (const warning of guard.warnings) {
      write(`Note: ${warning}`);
    }

    if (!apply) {
      write('');
      write(
        `Dry run only: no database changes were made. Apply with: node prisma/updateProductImages.js --apply --backup-confirmed${
          target.isLocal ? '' : ' --allow-remote-db'
        }`
      );
      return 0;
    }

    const { updated } = await applyImageUpdatePlan(prisma, plan);
    write('');
    write(`Applied ${updated} imageUrl update(s).`);
    write('This command is idempotent: re-running it reports no further imageUrl updates.');
    return 0;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};

const main = async (argv = process.argv.slice(2)) => {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });
  const exitCode = await runCli(argv, { env: process.env, logger: console });
  process.exitCode = exitCode;
  return exitCode;
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  buildImageUpdatePlan,
  buildPhotoQaReport,
  isSeedPlaceholderImageUrl,
  loadProductImageManifests,
  parseCliArgs,
  resolveApplyGuard,
  resolveDatabaseTarget,
  verifySeedImageConfiguration,
};
