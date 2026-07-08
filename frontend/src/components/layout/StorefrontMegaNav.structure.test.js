import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./StorefrontMegaNav.jsx', import.meta.url), 'utf8');

test('StorefrontMegaNav loads public navigation config without hardcoded fallback items', () => {
  assert.match(source, /import \{ storefrontContentApi \} from '\.\.\/\.\.\/api\/storefrontContentApi';/);
  assert.match(source, /storefrontContentApi\.getNavigation\(\)/);
  assert.match(source, /useState\(\[\]\)/);
  assert.match(source, /setNavigationItems\(response\?\.data\?\.items \|\| \[\]\)/);
  assert.match(source, /setNavigationItems\(\[\]\)/);
  assert.doesNotMatch(source, /fallbackStorefrontNavigation/);
  assert.doesNotMatch(source, /fallback-shop/);
  assert.doesNotMatch(source, /New Arrivals/);
  assert.doesNotMatch(source, /Sale/);
});

test('StorefrontMegaNav renders configured simple links and mega menu children', () => {
  assert.match(source, /resolveStorefrontHref\(item\.linkTarget\)/);
  assert.match(source, /TopNavMegaMenu/);
  assert.match(source, /TopNavMegaMenuItem/);
  assert.match(source, /TopNavMegaMenuFeaturedCard/);
  assert.doesNotMatch(source, /const shopItems = \[/);
  assert.doesNotMatch(source, /const brandItems = \[/);
});
