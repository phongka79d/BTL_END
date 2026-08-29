import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./MainLayout.jsx', import.meta.url), 'utf8');

test('MainLayout renders Staff and Admin tabs conditionally based on capability and role', () => {
  // Check permission & admin checks
  assert.match(source, /canAccessStaff\s*=\s*isAuthenticated\s*&&\s*hasPermission\(PERMISSIONS\.ORDERS_VIEW_ALL\)/);
  assert.match(source, /canAccessAdmin\s*=\s*isAuthenticated\s*&&\s*isAdmin/);

  // Check Staff button in header
  assert.match(source, /canAccessStaff\s*&&\s*\(/);
  assert.match(source, /navigate\('\/staff'\)/);

  // Check Admin button in header
  assert.match(source, /canAccessAdmin\s*&&\s*\(/);
  assert.match(source, /navigate\('\/admin'\)/);
});
