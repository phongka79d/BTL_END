import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./AdminUserView.jsx', import.meta.url), 'utf8');
const tableSource = readFileSync(new URL('../../components/admin/UserManagementTable.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');

test('AdminUserView loads searchable paginated users and updates roles', () => {
  assert.match(viewSource, /import \{ userApi \} from '\.\.\/\.\.\/api\/userApi';/);
  assert.match(viewSource, /import UserManagementTable, \{ getUserDisplayName \} from '\.\.\/\.\.\/components\/admin\/UserManagementTable';/);
  assert.match(viewSource, /import UserProfileDialog from '\.\.\/\.\.\/components\/admin\/UserProfileDialog';/);
  assert.match(viewSource, /import Pagination from '\.\.\/\.\.\/components\/common\/Pagination';/);
  assert.match(viewSource, /userApi\.getAdminUsers\(\{\s*keyword: search,\s*page,\s*limit: DEFAULT_PAGINATION\.limit\s*\}\)/);
  assert.match(viewSource, /userApi\.updateUserRole\(target\.id, nextRole\)/);
  assert.match(viewSource, /userApi\.updateUserBlocked\(target\.id, nextBlockedState\)/);
  assert.match(viewSource, /userApi\.updateAdminUser\(editingUser\.id, payload\)/);
  assert.match(viewSource, /setUsers\(response\?\.data\?\.items \|\| \[\]\)/);
  assert.match(viewSource, /setPagination\(response\?\.data\?\.pagination \|\| \{/);
  assert.match(viewSource, /<UserManagementTable/);
  assert.match(viewSource, /<Pagination[\s\S]*page=\{pagination\.page\}[\s\S]*totalPages=\{pagination\.totalPages\}[\s\S]*onPageChange=\{setPage\}/);
});

test('AdminUserView provides admin user manager UI states', () => {
  assert.match(viewSource, /Manage Users/);
  assert.match(viewSource, /Search users/);
  assert.match(viewSource, /Unable to load users/);
  assert.match(viewSource, /Role updated/);
  assert.match(viewSource, /User blocked/);
  assert.match(viewSource, /Profile updated/);
});

test('UserManagementTable provides three-dot admin user actions and status badges', () => {
  assert.match(tableSource, /MoreMenu/);
  assert.match(tableSource, /AdminTable/);
  assert.match(tableSource, /Change to admin/);
  assert.match(tableSource, /Change to customer/);
  assert.match(tableSource, /Block user/);
  assert.match(tableSource, /Unblock user/);
  assert.match(tableSource, /Edit profile/);
  assert.match(tableSource, /Blocked/);
  assert.match(tableSource, /Active/);
  assert.match(tableSource, /No matching users/);
  assert.match(tableSource, /No users yet/);
  assert.match(tableSource, /isSelf/);
});

test('admin user route is registered behind the admin layout', () => {
  assert.match(routesSource, /import AdminUserView from '\.\.\/views\/admin\/AdminUserView';/);
  assert.match(routesSource, /<Route path="\/admin\/users" element=\{<AdminUserView \/>\} \/>/);
});
