import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewSource = readFileSync(new URL('./AdminUserView.jsx', import.meta.url), 'utf8');
const routesSource = readFileSync(new URL('../../routes/AppRoutes.jsx', import.meta.url), 'utf8');

test('AdminUserView loads searchable paginated users and updates roles', () => {
  assert.match(viewSource, /import \{ userApi \} from '\.\.\/\.\.\/api\/userApi';/);
  assert.match(viewSource, /import AdminTable from '\.\.\/\.\.\/components\/admin\/AdminTable';/);
  assert.match(viewSource, /import Pagination from '\.\.\/\.\.\/components\/common\/Pagination';/);
  assert.match(viewSource, /userApi\.getAdminUsers\(\{\s*keyword: search,\s*page,\s*limit: DEFAULT_PAGINATION\.limit\s*\}\)/);
  assert.match(viewSource, /userApi\.updateUserRole\(target\.id, nextRole\)/);
  assert.match(viewSource, /setUsers\(response\?\.data\?\.items \|\| \[\]\)/);
  assert.match(viewSource, /setPagination\(response\?\.data\?\.pagination \|\| \{/);
  assert.match(viewSource, /<AdminTable/);
  assert.match(viewSource, /<Pagination[\s\S]*page=\{pagination\.page\}[\s\S]*totalPages=\{pagination\.totalPages\}[\s\S]*onPageChange=\{setPage\}/);
});

test('AdminUserView provides admin user manager UI states', () => {
  assert.match(viewSource, /Manage Users/);
  assert.match(viewSource, /Search users/);
  assert.match(viewSource, /Change to admin/);
  assert.match(viewSource, /Change to customer/);
  assert.match(viewSource, /Unable to load users/);
  assert.match(viewSource, /No matching users/);
  assert.match(viewSource, /No users yet/);
  assert.match(viewSource, /Role updated/);
});

test('admin user route is registered behind the admin layout', () => {
  assert.match(routesSource, /import AdminUserView from '\.\.\/views\/admin\/AdminUserView';/);
  assert.match(routesSource, /<Route path="\/admin\/users" element=\{<AdminUserView \/>\} \/>/);
});
