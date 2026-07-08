import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const heroSource = readFileSync(new URL('./HomeHero.jsx', import.meta.url), 'utf8');
const homeViewSource = readFileSync(new URL('../../views/HomeView.jsx', import.meta.url), 'utf8');

test('HomeView loads storefront carousel slides from the storefront content API', () => {
  assert.match(homeViewSource, /import \{ storefrontContentApi \} from '\.\.\/api\/storefrontContentApi';/);
  assert.doesNotMatch(homeViewSource, /homeProductQuery/);
  assert.doesNotMatch(homeViewSource, /productApi\.getProducts/);
  assert.match(homeViewSource, /storefrontContentApi\.getFeaturedProducts\(\)/);
  assert.match(homeViewSource, /storefrontContentApi\.getCarousel\(\)/);
  assert.match(homeViewSource, /catch\(\(\) => \(\{ data: \{ slides: \[\] \} \}\)\)/);
  assert.match(homeViewSource, /setCarouselSlides\(carouselResponse\?\.data\?\.slides \|\| \[\]\)/);
  assert.match(homeViewSource, /setProducts\(featuredResponse\?\.data\?\.items \|\| \[\]\)/);
  assert.match(homeViewSource, /<HomeHero slides=\{carouselSlides\} \/>/);
});

test('HomeHero renders slide config instead of deriving slides from products', () => {
  assert.match(heroSource, /export const HomeHero = \(\{ slides = \[\] \}\)/);
  assert.match(heroSource, /const heroSlides = slides\.slice\(0, heroSlidesLimit\)/);
  assert.match(heroSource, /resolveStorefrontHref\(slide\.linkTarget\)/);
  assert.match(heroSource, /slide\.primaryButtonLabel/);
  assert.doesNotMatch(heroSource, /products\.slice/);
  assert.doesNotMatch(heroSource, /formatPrice/);
});
