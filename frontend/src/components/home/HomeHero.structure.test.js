import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const heroSource = readFileSync(new URL('./HomeHero.jsx', import.meta.url), 'utf8');
const homeViewSource = readFileSync(new URL('../../views/HomeView.jsx', import.meta.url), 'utf8');
const homeSkeletonSource = readFileSync(new URL('./HomeSkeleton.jsx', import.meta.url), 'utf8');

test('HomeView loads storefront carousel slides from the storefront content API', () => {
  assert.match(homeViewSource, /import \{ storefrontContentApi \} from '\.\.\/api\/storefrontContentApi';/);
  assert.doesNotMatch(homeViewSource, /homeProductQuery/);
  assert.match(homeViewSource, /import \{ productApi \} from '\.\.\/api\/productApi';/);
  assert.match(homeViewSource, /productApi\.getProducts\(\{ page, limit: allProductsPageSize, sort: allProductSort \}\)/);
  assert.match(homeViewSource, /storefrontContentApi\.getFeaturedProducts\(\)/);
  assert.match(homeViewSource, /storefrontContentApi\.getCarousel\(\)/);
  assert.match(homeViewSource, /catch\(\(\) => \(\{ data: \{ slides: \[\] \} \}\)\)/);
  assert.match(homeViewSource, /setCarouselSlides\(carouselResponse\?\.data\?\.slides \|\| \[\]\)/);
  assert.match(homeViewSource, /setFeaturedProducts\(featuredResponse\?\.data\?\.items \|\| \[\]\)/);
  assert.match(homeViewSource, /<HomeHero slides=\{carouselSlides\} \/>/);
  assert.match(homeViewSource, /<HomeAllProductsSection/);
});

test('HomeView does not render the removed homepage category section', () => {
  assert.doesNotMatch(homeViewSource, /categoryApi/);
  assert.doesNotMatch(homeViewSource, /getCategories/);
  assert.doesNotMatch(homeViewSource, /categories/);
  assert.doesNotMatch(homeViewSource, /Shop by category/);
});

test('HomeSkeleton only reserves one product section below the hero', () => {
  assert.equal((homeSkeletonSource.match(/<HomeSkeletonSection \/>/g) || []).length, 1);
});

test('HomeHero renders slide config instead of deriving slides from products', () => {
  assert.match(heroSource, /export const HomeHero = \(\{ slides = \[\] \}\)/);
  assert.match(heroSource, /const heroSlides = slides\.slice\(0, heroSlidesLimit\)/);
  assert.match(heroSource, /resolveStorefrontHref\(slide\.linkTarget\)/);
  assert.match(heroSource, /slide\.primaryButtonLabel/);
  assert.doesNotMatch(heroSource, /products\.slice/);
  assert.doesNotMatch(heroSource, /formatPrice/);
});
