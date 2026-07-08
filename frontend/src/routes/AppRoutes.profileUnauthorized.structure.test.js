import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./AppRoutes.jsx', import.meta.url), 'utf8');

test('app routes wire profile and unauthorized pages to concrete views', () => {
  assert.match(source, /import ProfileView from '\.\.\/views\/ProfileView';/);
  assert.match(source, /import UnauthorizedView from '\.\.\/views\/UnauthorizedView';/);
  assert.match(source, /<Route path="\/unauthorized" element=\{<UnauthorizedView \/>\} \/>/);
  assert.match(source, /<Route path="\/profile" element=\{<ProfileView \/>\} \/>/);
  assert.doesNotMatch(source, /Unauthorized Access \(Placeholder\)/);
  assert.doesNotMatch(source, /Profile Page \(Placeholder\)/);
});
