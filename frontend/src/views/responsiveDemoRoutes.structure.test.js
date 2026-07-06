import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readView = (name) => readFileSync(new URL(`./${name}`, import.meta.url), 'utf8');
const readLayout = (name) => readFileSync(
  new URL(`../layouts/${name}`, import.meta.url),
  'utf8'
);
const readComponent = (path) => readFileSync(
  new URL(`../components/${path}`, import.meta.url),
  'utf8'
);

test('customer demo grids fit practical mobile viewports', () => {
  const productDetail = readView('ProductDetailView.jsx');
  const cart = readView('CartView.jsx');
  const checkout = readView('CheckoutView.jsx');

  for (const source of [productDetail, cart, checkout]) {
    assert.doesNotMatch(source, /columns=\{\{ minWidth: 360, max: 2 \}\}/);
  }

  assert.equal(
    (productDetail.match(/columns=\{\{ minWidth: 280, max: 2 \}\}/g) || []).length,
    3
  );
  assert.match(cart, /columns=\{\{ minWidth: 280, max: 2 \}\}/);
  assert.equal(
    (checkout.match(/columns=\{\{ minWidth: 280, max: 2 \}\}/g) || []).length,
    2
  );
});

test('checkout loading copy does not use a fixed mobile-overflow width', () => {
  const checkout = readView('CheckoutView.jsx');

  assert.doesNotMatch(checkout, /<Skeleton width="320px"/);
  assert.match(
    checkout,
    /<Skeleton width="100%" height="var\(--spacing-5\)" radius="rounded" \/>/
  );
});

test('customer shell uses internal scrolling and compact tablet navigation', () => {
  const mainLayout = readLayout('MainLayout.jsx');

  assert.match(mainLayout, /const \{ isMobile \} = useAppShellMobile\(\)/);
  assert.match(mainLayout, /isIconOnly: isMobile/);
  assert.match(
    mainLayout,
    /<AppShell height="fill" mobileNav=\{\{ breakpoint: 'lg' \}\} topNav=\{topNav\}>/
  );
});

test('auth card remains constrained to the mobile viewport', () => {
  const authLayout = readLayout('AuthLayout.jsx');

  assert.match(
    authLayout,
    /<Card\s+width="100%"\s+maxWidth="calc\(var\(--spacing-10\) \* 10\)"\s+padding=\{6\}/
  );
  assert.match(authLayout, /minWidth: 0/);
});

test('customer and admin order tables are constrained scroll containers', () => {
  const orderHistory = readView('OrderHistoryView.jsx');
  const adminTable = readComponent('admin/AdminTable.jsx');

  for (const source of [orderHistory, adminTable]) {
    assert.match(
      source,
      /<Card padding=\{0\} style=\{\{ width: '100%', minWidth: 0 \}\}>/
    );
  }
});

test('empty cart renders one Browse products action', () => {
  const cartSources = [
    readView('CartView.jsx'),
    readComponent('cart/CartItemList.jsx')
  ].join('\n');

  assert.equal(
    (cartSources.match(/label="Browse products"/g) || []).length,
    1
  );
});
