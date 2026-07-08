import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./AdminStorefrontView.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../../layouts/AdminLayout.jsx', import.meta.url), 'utf8');
const carouselFormSource = readFileSync(new URL('../../components/admin/storefront/CarouselSlideForm.jsx', import.meta.url), 'utf8');
const navigationFormSource = readFileSync(new URL('../../components/admin/storefront/NavigationItemForm.jsx', import.meta.url), 'utf8');
const linkFieldsSource = readFileSync(new URL('../../components/admin/storefront/LinkTargetFields.jsx', import.meta.url), 'utf8');
const featuredManagerSource = readFileSync(new URL('../../components/admin/storefront/FeaturedProductManager.jsx', import.meta.url), 'utf8');

test('AdminStorefrontView loads carousel navigation and categories without preloading products', () => {
  assert.match(viewSource, /<Heading level=\{1\}>Storefront<\/Heading>/);
  assert.match(viewSource, /<TabList/);
  assert.match(viewSource, /<Tab value="carousel" label="Carousel" \/>/);
  assert.match(viewSource, /<Tab value="navigation" label="Navigation" \/>/);
  assert.match(viewSource, /<Tab value="featuredProducts" label="Featured products" \/>/);
  assert.match(viewSource, /storefrontContentApi\.getAdminCarousel\(\)/);
  assert.match(viewSource, /storefrontContentApi\.getAdminNavigation\(\)/);
  assert.match(viewSource, /storefrontContentApi\.getAdminFeaturedProducts\(\)/);
  assert.match(viewSource, /setFeaturedProducts\(featuredResponse\?\.data\?\.items \|\| \[\]\)/);
  assert.match(viewSource, /setFeaturedSettings\(featuredResponse\?\.data\?\.settings \|\| defaultFeaturedSettings\)/);
  assert.doesNotMatch(viewSource, /productApi\.getProducts\(\{ page: 1, limit: 100 \}\)/);
  assert.doesNotMatch(viewSource, /setProducts/);
  assert.match(viewSource, /categoryApi\.getCategories\(\)/);
  assert.match(viewSource, /<CarouselSlideTable/);
  assert.match(viewSource, /<NavigationItemTable/);
  assert.match(viewSource, /<FeaturedProductManager/);
});

test('admin storefront route and side nav are protected by the admin layout', () => {
  assert.match(routesSource, /import AdminStorefrontView from '\.\.\/views\/admin\/AdminStorefrontView';/);
  assert.match(
    routesSource,
    /<Route element=\{<AdminRoute \/>\}>[\s\S]*?<Route element=\{<AdminLayout \/>\}>[\s\S]*?<Route path="\/admin\/storefront" element=\{<AdminStorefrontView \/>\} \/>/
  );
  assert.match(layoutSource, /label="Storefront"/);
  assert.match(layoutSource, /href="\/admin\/storefront"/);
  assert.match(layoutSource, /location\.pathname\.startsWith\('\/admin\/storefront'\)/);
});

test('storefront forms use product and category selectors instead of pasted internal URLs', () => {
  assert.match(carouselFormSource, /<LinkTargetFields/);
  assert.match(navigationFormSource, /<LinkTargetFields/);
  assert.match(linkFieldsSource, /<ProductPicker/);
  assert.match(linkFieldsSource, /label="Category target"/);
  assert.match(linkFieldsSource, /placeholder="Select category"/);
  assert.match(featuredManagerSource, /<FeaturedProductBulkPicker/);
});
