import assert from 'node:assert/strict';
import test from 'node:test';
import { formatVietnamAddress } from './addressFormatter.js';

test('Vietnam address preview trims and joins detail, ward, and province in order', () => {
  assert.equal(formatVietnamAddress({
    detail: '  Số 12, ngõ 5, Phố Hàng Bài  ',
    wardName: 'Phường Bến Nghé ',
    provinceName: ' TP. Hồ Chí Minh  '
  }), 'Số 12, ngõ 5, Phố Hàng Bài, Phường Bến Nghé, TP. Hồ Chí Minh');
});

test('Vietnam address preview omits empty parts and safely handles invalid inputs', () => {
  assert.equal(formatVietnamAddress({ detail: '   ', wardName: '', provinceName: null }), '');
  assert.equal(formatVietnamAddress(null), '');
  assert.equal(formatVietnamAddress([]), '');
});
