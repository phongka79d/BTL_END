import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./RegisterView.jsx', import.meta.url), 'utf8');

test('RegisterView validates password with the shared password policy', () => {
  assert.match(source, /import \{ validatePasswordPolicy \} from '\.\.\/utils\/passwordPolicy';/);
  assert.match(source, /validatePasswordPolicy\(password\)/);
  assert.doesNotMatch(source, /password\.length < 6|6 characters/);
});

test('RegisterView uses the tsshop title in registration copy', () => {
  assert.match(source, /Welcome to tsshop/);
  assert.match(source, /Join tsshop to start shopping/);
  assert.doesNotMatch(source, /TechMart/);
});
