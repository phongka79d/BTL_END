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

test('AdminUserView creates accounts through the dedicated dialog and API', () => {
  assert.match(viewSource, /import UserCreateDialog from '\.\.\/\.\.\/components\/admin\/UserCreateDialog';/);
  assert.match(viewSource, /userApi\.createAdminUser\(payload\)/);
  assert.match(viewSource, /label="Thêm tài khoản"/);
  assert.match(viewSource, /<UserCreateDialog[\s\S]*onSubmit=\{handleCreateUser\}/);
  assert.match(viewSource, /emailDelivery/);
});

test('AdminUserView provides admin user manager UI states', () => {
  assert.match(viewSource, /Quản lý người dùng/);
  assert.match(viewSource, /Tìm kiếm người dùng/);
  assert.match(viewSource, /Không thể tải người dùng/);
  assert.match(viewSource, /Đã cập nhật vai trò/);
  assert.match(viewSource, /Đã khóa người dùng/);
  assert.match(viewSource, /Đã cập nhật hồ sơ/);
  assert.match(viewSource, /Đã tạo tài khoản/);
});

test('UserManagementTable provides three-dot admin user actions and status badges', () => {
  assert.match(tableSource, /MoreMenu/);
  assert.match(tableSource, /AdminTable/);
  assert.match(tableSource, /Đổi thành Quản trị viên/);
  assert.match(tableSource, /Đổi thành Nhân viên vận hành/);
  assert.match(tableSource, /Đổi thành Khách hàng/);
  assert.match(tableSource, /Khóa người dùng/);
  assert.match(tableSource, /Mở khóa người dùng/);
  assert.match(tableSource, /Chỉnh sửa hồ sơ/);
  assert.match(tableSource, /Bị khóa/);
  assert.match(tableSource, /Đang hoạt động/);
  assert.match(tableSource, /Không có người dùng phù hợp/);
  assert.match(tableSource, /Chưa có người dùng/);
  assert.match(tableSource, /isSelf/);
});

test('admin user route is registered behind the admin layout', () => {
  assert.match(routesSource, /import AdminUserView from '\.\.\/views\/admin\/AdminUserView';/);
  assert.match(routesSource, /<Route path="\/admin\/users" element=\{<AdminUserView \/>\} \/>/);
});
