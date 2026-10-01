import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getProductListEmptyCopy,
  normalizeCategoryId,
  removeCategoryFilter,
  resolveCategoryLabel
} from './adminProductListUtils.js';

test('normalizeCategoryId chỉ nhận chuỗi và cắt khoảng trắng thừa', () => {
  assert.equal(normalizeCategoryId('  cat-1  '), 'cat-1');
  assert.equal(normalizeCategoryId('   '), '');
  assert.equal(normalizeCategoryId(''), '');
  assert.equal(normalizeCategoryId(null), '');
  assert.equal(normalizeCategoryId(undefined), '');
  assert.equal(normalizeCategoryId(12), '');
});

test('removeCategoryFilter chỉ bỏ categoryId và giữ nguyên từ khóa, phân trang', () => {
  const params = new URLSearchParams('categoryId=cat-1&keyword=%C3%A1o&page=3');
  const next = removeCategoryFilter(params);

  assert.equal(next.get('categoryId'), null);
  assert.equal(next.get('keyword'), 'áo');
  assert.equal(next.get('page'), '3');
  // Không sửa trực tiếp tham số của React Router.
  assert.equal(params.get('categoryId'), 'cat-1');
});

test('removeCategoryFilter vẫn giữ các tham số khác khi URL không có categoryId', () => {
  const next = removeCategoryFilter(new URLSearchParams('keyword=abc&page=2'));

  assert.equal(next.get('keyword'), 'abc');
  assert.equal(next.get('page'), '2');
  assert.equal(removeCategoryFilter(new URLSearchParams()).toString(), '');
});

test('resolveCategoryLabel ưu tiên tên danh mục và dự phòng mã danh mục', () => {
  const categories = [
    { id: 1, name: 'Điện thoại' },
    { id: 'cat-2', name: 'Laptop' }
  ];

  assert.equal(resolveCategoryLabel(categories, '1'), 'Điện thoại');
  assert.equal(resolveCategoryLabel(categories, 'cat-2'), 'Laptop');
  assert.equal(resolveCategoryLabel(categories, 'cat-9'), '#cat-9');
  assert.equal(resolveCategoryLabel([], 'cat-9'), '#cat-9');
  assert.equal(resolveCategoryLabel([{ id: 'cat-3', name: '' }], 'cat-3'), '#cat-3');
  assert.equal(resolveCategoryLabel(categories, ''), '');
  assert.equal(resolveCategoryLabel(categories, '   '), '');
});

test('getProductListEmptyCopy mô tả đúng trạng thái rỗng khi lọc theo danh mục', () => {
  const categoryOnly = getProductListEmptyCopy({
    categoryId: 'cat-1',
    categoryLabel: 'Điện thoại'
  });

  assert.equal(categoryOnly.title, 'Danh mục chưa có sản phẩm');
  assert.equal(categoryOnly.action, 'clearCategory');
  assert.equal(categoryOnly.actionLabel, 'Xóa bộ lọc danh mục');
  assert.match(categoryOnly.description, /Điện thoại/);
});

test('getProductListEmptyCopy giữ từ khóa khi kết hợp danh mục và tìm kiếm', () => {
  const combined = getProductListEmptyCopy({
    categoryId: 'cat-1',
    categoryLabel: 'Điện thoại',
    keyword: '  iphone  '
  });

  assert.equal(combined.title, 'Không có sản phẩm phù hợp');
  assert.equal(combined.action, 'clearCategory');
  assert.match(combined.description, /iphone/);
  assert.match(combined.description, /Điện thoại/);

  const fallbackLabel = getProductListEmptyCopy({ categoryId: 'cat-9' });
  assert.match(fallbackLabel.description, /#cat-9/);

  const blankKeyword = getProductListEmptyCopy({
    categoryId: 'cat-1',
    categoryLabel: 'Điện thoại',
    keyword: '   '
  });
  assert.equal(blankKeyword.title, 'Danh mục chưa có sản phẩm');
  assert.equal(blankKeyword.action, 'clearCategory');
});

test('getProductListEmptyCopy giữ nội dung tìm kiếm và trạng thái chưa có sản phẩm', () => {
  const searchOnly = getProductListEmptyCopy({ keyword: 'iphone' });
  assert.equal(searchOnly.action, 'clearSearch');
  assert.equal(searchOnly.actionLabel, 'Xóa tìm kiếm');

  const empty = getProductListEmptyCopy();
  assert.equal(empty.action, 'create');
  assert.equal(empty.actionLabel, 'Tạo sản phẩm');

  const blankKeyword = getProductListEmptyCopy({ keyword: '   ' });
  assert.equal(blankKeyword.action, 'create');
});
