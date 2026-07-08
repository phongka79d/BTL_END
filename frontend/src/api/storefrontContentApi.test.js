import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./storefrontContentApi.js', import.meta.url), 'utf8');

test('storefront content API helper uses apiClient for public and admin endpoints', () => {
  assert.match(source, /import \{ apiClient \} from '.\/apiClient';/);
  assert.match(source, /getCarousel:\s*\(\)\s*=>\s*apiClient\.get\('\/storefront\/carousel'\)/);
  assert.match(source, /getNavigation:\s*\(\)\s*=>\s*apiClient\.get\('\/storefront\/navigation'\)/);
  assert.match(source, /getFeaturedProducts:\s*\(\)\s*=>\s*apiClient\.get\('\/storefront\/featured-products'\)/);
  assert.match(source, /getAdminCarousel:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/storefront\/carousel'\)/);
  assert.match(source, /createCarouselSlide:\s*\(payload\)\s*=>\s*apiClient\.post\('\/admin\/storefront\/carousel', payload\)/);
  assert.match(source, /updateCarouselSlide:\s*\(id, payload\)\s*=>\s*apiClient\.put\(`\/admin\/storefront\/carousel\/\$\{id\}`, payload\)/);
  assert.match(source, /deleteCarouselSlide:\s*\(id\)\s*=>\s*apiClient\.delete\(`\/admin\/storefront\/carousel\/\$\{id\}`\)/);
  assert.match(source, /getAdminNavigation:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/storefront\/navigation'\)/);
  assert.match(source, /createNavigationItem:\s*\(payload\)\s*=>\s*apiClient\.post\('\/admin\/storefront\/navigation', payload\)/);
  assert.match(source, /updateNavigationItem:\s*\(id, payload\)\s*=>\s*apiClient\.put\(`\/admin\/storefront\/navigation\/\$\{id\}`, payload\)/);
  assert.match(source, /deleteNavigationItem:\s*\(id\)\s*=>\s*apiClient\.delete\(`\/admin\/storefront\/navigation\/\$\{id\}`\)/);
  assert.match(source, /getAdminFeaturedProducts:\s*\(\)\s*=>\s*apiClient\.get\('\/admin\/storefront\/featured-products'\)/);
  assert.match(source, /createFeaturedProduct:\s*\(payload\)\s*=>\s*apiClient\.post\('\/admin\/storefront\/featured-products', payload\)/);
  assert.match(source, /updateFeaturedProduct:\s*\(id, payload\)\s*=>\s*apiClient\.put\(`\/admin\/storefront\/featured-products\/\$\{id\}`, payload\)/);
  assert.match(source, /deleteFeaturedProduct:\s*\(id\)\s*=>\s*apiClient\.delete\(`\/admin\/storefront\/featured-products\/\$\{id\}`\)/);
  assert.match(source, /updateStorefrontSettings:\s*\(payload\)\s*=>\s*apiClient\.put\('\/admin\/storefront\/settings', payload\)/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /API_BASE_URL|supabase/i);
});
