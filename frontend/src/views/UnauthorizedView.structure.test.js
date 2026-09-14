import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const unauthorizedViewUrl = new URL('./UnauthorizedView.jsx', import.meta.url);

test('unauthorized view gives clear recovery actions without direct data access', () => {
  assert.equal(existsSync(unauthorizedViewUrl), true);

  const source = readFileSync(unauthorizedViewUrl, 'utf8');

  assert.match(source, /export const UnauthorizedView/);
  assert.match(source, /useAuth\(\)/);
  assert.match(source, /Quyền truy cập bị hạn chế/);
  assert.match(source, /label="Quay lại cửa hàng"/);
  assert.match(source, /'Hồ sơ của tôi'/);
  assert.match(source, /'Đăng nhập'/);
  assert.doesNotMatch(source, /fetch\(|supabase|DATABASE_URL|PrismaClient/);
});
