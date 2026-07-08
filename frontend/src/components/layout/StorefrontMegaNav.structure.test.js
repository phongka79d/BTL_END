import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./StorefrontMegaNav.jsx', import.meta.url), 'utf8');

test('StorefrontMegaNav loads public navigation config and keeps a fallback', () => {
  assert.match(source, /import \{ storefrontContentApi \} from '\.\.\/\.\.\/api\/storefrontContentApi';/);
  assert.match(source, /fallbackStorefrontNavigation/);
  assert.match(source, /storefrontContentApi\.getNavigation\(\)/);
  assert.match(source, /setNavigationItems\(response\?\.data\?\.items \|\| fallbackStorefrontNavigation\)/);
});

test('StorefrontMegaNav renders configured simple links and mega menu children', () => {
  assert.match(source, /resolveStorefrontHref\(item\.linkTarget\)/);
  assert.match(source, /TopNavMegaMenu/);
  assert.match(source, /TopNavMegaMenuItem/);
  assert.match(source, /TopNavMegaMenuFeaturedCard/);
  assert.doesNotMatch(source, /const shopItems = \[/);
  assert.doesNotMatch(source, /const brandItems = \[/);
});
