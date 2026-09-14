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
  assert.match(source, /TextInput[\s\S]*label="Tên người dùng"/);
  assert.match(source, /TextInput[\s\S]*label="Họ và tên"/);
  assert.match(source, /TextInput[\s\S]*label="Số điện thoại"/);
  assert.match(source, /TextArea[\s\S]*label="Địa chỉ"/);
  assert.match(source, /label="Lưu hồ sơ"/);
  assert.match(source, /label="Lịch sử đơn hàng"/);
  assert.match(source, /import ChangePasswordPanel from '\.\.\/components\/profile\/ChangePasswordPanel';/);
  assert.match(source, /Avatar,/);
  assert.match(source, /<Avatar\s+name=\{accountName\}\s+size="large"/);
  assert.match(source, /const EmailIcon = \(\) =>/);
  assert.match(source, /const RoleIcon = \(\) =>/);
  assert.match(source, /const PhoneIcon = \(\) =>/);
  assert.match(source, /const AddressIcon = \(\) =>/);
  assert.match(source, /ProfileInfoRow[\s\S]*label="Email"/);
  assert.match(source, /ProfileInfoRow[\s\S]*label="Vai trò"/);
  assert.match(source, /startIcon=\{<PhoneIcon \/>\}/);
  assert.match(source, /startIcon=\{<AddressIcon \/>\}/);
  assert.match(source, /<VStack gap=\{4\}>[\s\S]*<Heading level=\{2\}>Tổng quan tài khoản<\/Heading>[\s\S]*<ChangePasswordPanel \/>[\s\S]*<\/VStack>[\s\S]*<Card padding=\{4\}>/);
  assert.match(source, /<HStack gap=\{3\} justify="end" wrap="wrap"/);
  assert.match(source, /label="Đặt lại"[\s\S]*variant="ghost"/);
  assert.match(source, /<ChangePasswordPanel \/>/);
  assert.match(source, /title: 'Đã lưu hồ sơ'[\s\S]*status: 'success'/);
  assert.match(source, /title: 'Không thể lưu hồ sơ'[\s\S]*status: 'error'/);
  assert.match(source, /<Alert[\s\S]*status=\{feedback\.status\}/);
  assert.doesNotMatch(source, /<div\b|className=|xstyle=|tailwind/i);
  assert.doesNotMatch(source, /fetch\(|supabase|DATABASE_URL|PrismaClient/);
});
