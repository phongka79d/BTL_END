import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./userApi.js', import.meta.url), 'utf8');

test('user API helper exposes admin list and role update calls', () => {
  assert.match(source, /import \{ apiClient \} from '\.\/apiClient'/);
  assert.match(source, /const buildUserQuery = \(filters = \{\}\) => \{/);
  assert.match(source, /params\.set\('keyword', filters\.keyword\)/);
  assert.match(source, /params\.set\('page', String\(filters\.page\)\)/);
  assert.match(source, /params\.set\('limit', String\(filters\.limit\)\)/);
  assert.match(source, /getAdminUsers:\s*\(filters = \{\}\)\s*=>\s*apiClient\.get\(`\/admin\/users\$\{buildUserQuery\(filters\)\}`\)/);
  assert.match(source, /updateAdminUser:\s*\(userId,\s*payload\)\s*=>\s*apiClient\.put\(`\/admin\/users\/\$\{userId\}`,\s*payload\)/);
  assert.match(source, /createAdminUser:\s*\(payload\)\s*=>\s*apiClient\.post\('\/admin\/users',\s*payload\)/);
  assert.match(source, /updateUserRole:\s*\(userId,\s*role\)\s*=>\s*apiClient\.put\(`\/admin\/users\/\$\{userId\}\/role`,\s*\{ role \}\)/);
  assert.match(source, /updateUserBlocked:\s*\(userId,\s*isBlocked\)\s*=>\s*apiClient\.put\(`\/admin\/users\/\$\{userId\}\/block`,\s*\{ isBlocked \}\)/);
});
