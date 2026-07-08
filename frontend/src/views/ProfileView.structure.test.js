import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const profileViewUrl = new URL('./ProfileView.jsx', import.meta.url);

test('profile view provides an authenticated editable profile page', () => {
  assert.equal(existsSync(profileViewUrl), true);

  const source = readFileSync(profileViewUrl, 'utf8');

  assert.match(source, /import \{ userApi \} from '\.\.\/api\/userApi';/);
  assert.match(source, /userApi\.getProfile\(\)/);
  assert.match(source, /userApi\.updateProfile\(/);
  assert.match(source, /useAuth\(\)/);
  assert.match(source, /TextInput[\s\S]*label="Username"/);
  assert.match(source, /TextInput[\s\S]*label="Full name"/);
  assert.match(source, /TextInput[\s\S]*label="Phone"/);
  assert.match(source, /TextArea[\s\S]*label="Address"/);
  assert.match(source, /label="Save profile"/);
  assert.match(source, /label="Order history"/);
  assert.doesNotMatch(source, /fetch\(|supabase|DATABASE_URL|PrismaClient/);
});
