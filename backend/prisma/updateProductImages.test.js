const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { productsData } = require('./seedProducts');
const {
  buildImageUpdatePlan,
  buildPhotoQaReport,
  isSeedPlaceholderImageUrl,
  parseCliArgs,
  resolveApplyGuard,
  resolveDatabaseTarget,
  verifySeedImageConfiguration,
} = require('./updateProductImages');

const IPHONE_SEED = {
  name: 'iPhone 15 Pro',
  brand: 'Apple',
  categoryName: 'Smartphones',
  imageUrl: '/products/smartphones/iphone-15-pro.webp',
};
const ONEPLUS_SEED = {
  name: 'OnePlus 12',
  brand: 'OnePlus',
  categoryName: 'Smartphones',
  imageUrl: null,
};
const PICSUN_IPHONE = 'https://picsum.photos/seed/iphone-15-pro/500/500';
const PICSUN_ONEPLUS = 'https://picsum.photos/seed/oneplus-12/500/500';

const dbProduct = ({ id, name, brand, categoryName, imageUrl }) => ({
  id,
  name,
  brand,
  imageUrl,
  category: { name: categoryName },
  price: 123,
  quantity: 7,
});

test('placeholder detection only matches seed placeholder hosts', () => {
  assert.equal(isSeedPlaceholderImageUrl(PICSUN_IPHONE), true);
  assert.equal(isSeedPlaceholderImageUrl('  https://picsum.photos/seed/x/500/500  '), true);
  assert.equal(isSeedPlaceholderImageUrl('https://cdn.example.com/custom.jpg'), false);
  assert.equal(isSeedPlaceholderImageUrl('https://picsum.photos.evil.example/custom.jpg'), false);
  assert.equal(isSeedPlaceholderImageUrl(null), false);
  assert.equal(isSeedPlaceholderImageUrl(''), false);
});

test('the plan rewrites placeholders to licensed paths and clears the ones with no photo', () => {
  const rows = [
    dbProduct({ id: 'p1', name: 'iPhone 15 Pro', brand: 'Apple', categoryName: 'Smartphones', imageUrl: PICSUN_IPHONE }),
    dbProduct({ id: 'p2', name: 'OnePlus 12', brand: 'OnePlus', categoryName: 'Smartphones', imageUrl: PICSUN_ONEPLUS }),
  ];

  const plan = buildImageUpdatePlan([IPHONE_SEED, ONEPLUS_SEED], rows);

  assert.deepEqual(
    plan.updates.map((update) => ({ id: update.id, imageUrl: update.data.imageUrl })),
    [
      { id: 'p1', imageUrl: '/products/smartphones/iphone-15-pro.webp' },
      { id: 'p2', imageUrl: null },
    ]
  );

  for (const update of plan.updates) {
    assert.deepEqual(Object.keys(update.data), ['imageUrl'], 'imageUrl is the only written column');
  }

  assert.deepEqual(plan.preservedCustomImages, []);
  assert.deepEqual(plan.missingSeedProducts, []);
  assert.deepEqual(plan.unmatchedDbProducts, []);
});

test('a second plan over the applied state is a no-op (idempotent second apply)', () => {
  const rows = [
    dbProduct({ id: 'p1', name: 'iPhone 15 Pro', brand: 'Apple', categoryName: 'Smartphones', imageUrl: PICSUN_IPHONE }),
    dbProduct({ id: 'p2', name: 'OnePlus 12', brand: 'OnePlus', categoryName: 'Smartphones', imageUrl: PICSUN_ONEPLUS }),
  ];

  const firstPlan = buildImageUpdatePlan([IPHONE_SEED, ONEPLUS_SEED], rows);
  const appliedRows = rows.map((row) => {
    const update = firstPlan.updates.find((entry) => entry.id === row.id);
    return update ? { ...row, imageUrl: update.data.imageUrl } : row;
  });

  const secondPlan = buildImageUpdatePlan([IPHONE_SEED, ONEPLUS_SEED], appliedRows);

  assert.equal(secondPlan.updates.length, 0);
  assert.equal(secondPlan.unchanged.length, 2);
});

test('blank image values are treated as missing and only filled when a photo exists', () => {
  const rows = [
    dbProduct({ id: 'blank-covered', name: 'iPhone 15 Pro', brand: 'Apple', categoryName: 'Smartphones', imageUrl: '   ' }),
    dbProduct({ id: 'blank-null', name: 'OnePlus 12', brand: 'OnePlus', categoryName: 'Smartphones', imageUrl: '' }),
  ];

  const plan = buildImageUpdatePlan([IPHONE_SEED, ONEPLUS_SEED], rows);

  assert.deepEqual(
    plan.updates.map((update) => ({ id: update.id, imageUrl: update.data.imageUrl })),
    [{ id: 'blank-covered', imageUrl: '/products/smartphones/iphone-15-pro.webp' }]
  );
  assert.deepEqual(plan.unchanged.map((entry) => entry.id), ['blank-null']);
});

test('custom images on matching products are preserved, never overwritten', () => {
  const rows = [
    dbProduct({
      id: 'custom-1',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      categoryName: 'Smartphones',
      imageUrl: 'https://cdn.example.com/uploads/iphone-hero.jpg',
    }),
  ];

  const plan = buildImageUpdatePlan([IPHONE_SEED], rows);

  assert.equal(plan.updates.length, 0);
  assert.deepEqual(plan.preservedCustomImages.map((entry) => entry.id), ['custom-1']);
  assert.equal(plan.preservedCustomImages[0].currentImageUrl, 'https://cdn.example.com/uploads/iphone-hero.jpg');
});

test('products that do not match seed name + brand + category are never touched or created', () => {
  const rows = [
    // Same name and brand but a different category: not a seeded identity.
    dbProduct({ id: 'wrong-category', name: 'iPhone 15 Pro', brand: 'Apple', categoryName: 'Laptops', imageUrl: PICSUN_IPHONE }),
    // User-created catalog product.
    dbProduct({ id: 'user-product', name: 'Custom Widget', brand: 'Acme', categoryName: 'Smartphones', imageUrl: PICSUN_ONEPLUS }),
  ];

  const plan = buildImageUpdatePlan([IPHONE_SEED], rows);

  assert.equal(plan.updates.length, 0);
  assert.deepEqual(plan.missingSeedProducts.map((entry) => entry.name), ['iPhone 15 Pro']);
  assert.deepEqual(plan.unmatchedDbProducts.map((entry) => entry.id), ['wrong-category', 'user-product']);
});

test('CLI defaults to a dry run and gates mutation behind explicit flags', () => {
  const defaults = parseCliArgs([]);
  assert.equal(defaults.mode, 'dry-run');
  assert.equal(defaults.backupConfirmed, false);
  assert.equal(defaults.allowRemoteDb, false);
  assert.deepEqual(defaults.errors, []);

  const apply = parseCliArgs(['--apply', '--backup-confirmed', '--allow-remote-db']);
  assert.equal(apply.mode, 'apply');
  assert.equal(apply.backupConfirmed, true);
  assert.equal(apply.allowRemoteDb, true);
  assert.deepEqual(apply.errors, []);

  assert.equal(parseCliArgs(['--qa']).mode, 'qa');
  assert.equal(parseCliArgs(['--help']).help, true);

  assert.match(parseCliArgs(['--apply', '--qa']).errors.join(' '), /--qa cannot be combined with --apply/);
  assert.match(parseCliArgs(['--backup-confirmed']).errors.join(' '), /--backup-confirmed only makes sense/);
  assert.match(parseCliArgs(['--allow-remote-db']).errors.join(' '), /--allow-remote-db only makes sense/);
  assert.match(parseCliArgs(['--force']).errors.join(' '), /Unsupported argument: --force/);
});

const localTarget = { host: 'localhost', isLocal: true, directUrl: { status: 'match' } };

test('apply requires a backup acknowledgement and blocks remote databases by default', () => {
  const unconfirmed = resolveApplyGuard({
    apply: true,
    backupConfirmed: false,
    allowRemoteDb: false,
    target: localTarget,
  });
  assert.equal(unconfirmed.ok, false);
  assert.match(unconfirmed.issues.join(' '), /--backup-confirmed/);

  const remoteTarget = { host: 'db.example.com', isLocal: false, directUrl: { status: 'match' } };
  const remoteBlocked = resolveApplyGuard({
    apply: true,
    backupConfirmed: true,
    allowRemoteDb: false,
    target: remoteTarget,
  });
  assert.equal(remoteBlocked.ok, false);
  assert.match(remoteBlocked.issues.join(' '), /--allow-remote-db/);

  const remoteAllowed = resolveApplyGuard({
    apply: true,
    backupConfirmed: true,
    allowRemoteDb: true,
    target: remoteTarget,
  });
  assert.equal(remoteAllowed.ok, true);

  const databaseMismatch = {
    host: 'localhost',
    isLocal: true,
    directUrl: { status: 'database-mismatch', database: 'other' },
  };
  const mismatchGuard = resolveApplyGuard({
    apply: true,
    backupConfirmed: true,
    allowRemoteDb: false,
    target: databaseMismatch,
  });
  assert.equal(mismatchGuard.ok, false);
  assert.match(mismatchGuard.issues.join(' '), /DIRECT_URL/);

  assert.equal(
    resolveApplyGuard({ apply: false, backupConfirmed: false, allowRemoteDb: false, target: localTarget }).ok,
    true
  );
});

test('database target resolution flags local hosts, missing env and DIRECT_URL disagreement', () => {
  const local = resolveDatabaseTarget({
    DATABASE_URL: 'postgresql://app:secret@localhost:5432/shop',
    DIRECT_URL: 'postgresql://app:secret@127.0.0.1:5432/shop',
  });
  assert.equal(local.error, undefined);
  assert.equal(local.target.host, 'localhost');
  assert.equal(local.target.port, '5432');
  assert.equal(local.target.database, 'shop');
  assert.equal(local.target.isLocal, true);
  assert.equal(local.target.directUrl.status, 'match', 'loopback aliases address the same local database');
  assert.doesNotMatch(JSON.stringify(local.target), /app|secret/, 'authentication material is never exposed');

  const remote = resolveDatabaseTarget({ DATABASE_URL: 'postgresql://app:secret@db.example.com:6543/shop' });
  assert.equal(remote.target.isLocal, false);
  assert.equal(remote.target.directUrl.status, 'missing');

  const databaseMismatch = resolveDatabaseTarget({
    DATABASE_URL: 'postgresql://app:secret@localhost:5432/shop',
    DIRECT_URL: 'postgresql://app:secret@localhost:5432/other',
  });
  assert.equal(databaseMismatch.target.directUrl.status, 'database-mismatch');

  const hostMismatch = resolveDatabaseTarget({
    DATABASE_URL: 'postgresql://app:secret@pooler.example.com:6543/shop',
    DIRECT_URL: 'postgresql://app:secret@direct.example.com:5432/shop',
  });
  assert.equal(hostMismatch.target.directUrl.status, 'host-mismatch');

  assert.ok(resolveDatabaseTarget({}).error);
  assert.ok(resolveDatabaseTarget({ DATABASE_URL: 'not a url' }).error);
  assert.ok(resolveDatabaseTarget({ DATABASE_URL: 'mysql://app@db.example.com/shop' }).error);
});

test('photo QA lists every blocker and exits nonzero while actual photos are missing', () => {
  const verification = {
    ok: true,
    covered: [{ name: 'iPhone 15 Pro', brand: 'Apple', categoryName: 'Smartphones', imageUrl: IPHONE_SEED.imageUrl }],
    missing: [{ name: 'OnePlus 12', brand: 'OnePlus', categoryName: 'Smartphones' }],
    errors: [],
  };

  const report = buildPhotoQaReport(verification, 2);
  const text = report.lines.join('\n');

  assert.equal(report.complete, false);
  assert.notEqual(report.exitCode, 0);
  assert.match(text, /Missing actual photos: 1\/2/);
  assert.match(text, /OnePlus 12 \(OnePlus \/ Smartphones\)/);
  assert.match(text, /Photo QA INCOMPLETE/);
  assert.doesNotMatch(text, /Photo QA PASS/);
});

test('photo QA fails invalid configurations even when no product lacks an image', () => {
  const verification = {
    ok: true,
    covered: [{ name: 'iPhone 15 Pro', brand: 'Apple', categoryName: 'Smartphones', imageUrl: IPHONE_SEED.imageUrl }],
    missing: [],
    errors: [],
  };

  const report = buildPhotoQaReport(verification, 1);
  assert.equal(report.complete, true);
  assert.equal(report.exitCode, 0);
  assert.match(report.lines.join('\n'), /Photo QA PASS/);

  const broken = buildPhotoQaReport(
    {
      ok: false,
      covered: [],
      missing: [],
      errors: ['iPhone 15 Pro (Apple / Smartphones): seeded image asset is missing on disk'],
    },
    40
  );
  assert.notEqual(broken.exitCode, 0);
  assert.match(broken.lines.join('\n'), /seeded image asset is missing on disk/);
});

test('seed image verification flags missing assets, remote placeholders and incomplete attribution', () => {
  const verification = verifySeedImageConfiguration(
    [
      { name: 'Missing Asset', brand: 'TestBrand', categoryName: 'Smartphones', imageUrl: '/products/smartphones/missing-asset.webp' },
      { name: 'Remote Placeholder', brand: 'TestBrand', categoryName: 'Smartphones', imageUrl: PICSUN_ONEPLUS },
      { name: 'Unlicensed Model', brand: 'TestBrand', categoryName: 'Smartphones', imageUrl: '/products/smartphones/unlicensed-model.webp' },
      { name: 'No Photo Model', brand: 'TestBrand', categoryName: 'Smartphones', imageUrl: null },
    ],
    {
      manifests: [
        {
          productName: 'Missing Asset',
          brand: 'TestBrand',
          imageUrl: '/products/smartphones/missing-asset.webp',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:A.jpg',
          author: 'Someone',
          license: 'CC BY 4.0',
          licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        },
        {
          productName: 'Unlicensed Model',
          brand: 'TestBrand',
          imageUrl: '/products/smartphones/unlicensed-model.webp',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:B.jpg',
          author: 'Someone',
        },
      ],
      productsPublicDir: path.join(__dirname, 'no-such-asset-directory'),
    }
  );

  const errors = verification.errors.join('\n');
  assert.equal(verification.ok, false);
  assert.equal(verification.covered.length, 0);
  assert.equal(verification.missing.length, 1);
  assert.match(errors, /seeded image asset is missing on disk/);
  assert.match(errors, /missing license attribution field "license"/);
});

test('seed image verification rejects a seed path that drifts from its manifest entry', () => {
  const verification = verifySeedImageConfiguration(
    [
      { name: 'iPhone 15 Pro', brand: 'Apple', categoryName: 'Smartphones', imageUrl: '/products/smartphones/iphone-15-pro.webp' },
      { name: 'Ghost Model', brand: 'Apple', categoryName: 'Smartphones', imageUrl: '/products/smartphones/iphone-15-pro.webp' },
    ],
    {
      manifests: [
        {
          productName: 'iPhone 15 Pro',
          brand: 'Apple',
          imageUrl: '/products/smartphones/galaxy-s24-ultra.webp',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:iPhone.jpg',
          author: 'Someone',
          license: 'CC BY 4.0',
          licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        },
      ],
    }
  );

  const errors = verification.errors.join('\n');
  assert.equal(verification.ok, false);
  assert.equal(verification.covered.length, 0);
  assert.match(errors, /does not match manifest imageUrl/);
});

test('linked HTTPS photos do not require or imply a reuse license', () => {
  const product = { name: 'Linked Model', brand: 'Brand', categoryName: 'Laptops', imageUrl: 'https://cdn.example.com/model.jpg' };
  const manifest = { productName: product.name, brand: product.brand, imageUrl: product.imageUrl, sourceUrl: 'https://example.com/model', reusePermission: 'unverified' };
  const verification = verifySeedImageConfiguration([product], { manifests: [manifest] });
  assert.deepEqual(verification.errors, []);
  assert.deepEqual(verification.missing, []);
  assert.equal(verification.covered[0].reusePermission, 'unverified');
  assert.equal(verification.covered[0].license, undefined);
  assert.equal(buildPhotoQaReport(verification, 1).exitCode, 0);

  const unidentified = verifySeedImageConfiguration([product], { manifests: [{ ...manifest, reusePermission: undefined }] });
  assert.equal(unidentified.ok, false);
  assert.deepEqual(unidentified.covered, []);
});

test('linked photo verification rejects generic placeholders and non-HTTPS URLs despite complete source metadata', () => {
  for (const imageUrl of ['https://picsum.photos/seed/model/500/500', 'https://picsum.photos', 'http://cdn.example.com/model.jpg', 'not-a-url']) {
    const product = { name: 'Wrong Image', brand: 'Brand', categoryName: 'Laptops', imageUrl };
    const manifest = { productName: product.name, brand: product.brand, imageUrl, sourceUrl: 'https://example.com/model', reusePermission: 'unverified' };
    const verification = verifySeedImageConfiguration([product], { manifests: [manifest] });
    assert.equal(verification.ok, false, imageUrl);
    assert.deepEqual(verification.covered, [], imageUrl);
  }
});
