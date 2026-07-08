import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const unauthorizedViewUrl = new URL('./UnauthorizedView.jsx', import.meta.url);

test('unauthorized view gives clear recovery actions without direct data access', () => {
  assert.equal(existsSync(unauthorizedViewUrl), true);

  const source = readFileSync(unauthorizedViewUrl, 'utf8');

  assert.match(source, /export const UnauthorizedView/);
  assert.match(source, /useAuth\(\)/);
  assert.match(source, /Access restricted/);
  assert.match(source, /label: 'Back to store'/);
  assert.match(source, /label: 'My profile'/);
  assert.match(source, /label: 'Sign in'/);
  assert.doesNotMatch(source, /fetch\(|supabase|DATABASE_URL|PrismaClient/);
});
