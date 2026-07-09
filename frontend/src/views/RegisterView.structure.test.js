import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./RegisterView.jsx', import.meta.url), 'utf8');

test('RegisterView validates password with the shared password policy', () => {
  assert.match(source, /import \{ validatePasswordPolicy \} from '\.\.\/utils\/passwordPolicy';/);
  assert.match(source, /validatePasswordPolicy\(password\)/);
  assert.doesNotMatch(source, /password\.length < 6|6 characters/);
});
