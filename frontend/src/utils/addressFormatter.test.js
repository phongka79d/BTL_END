import assert from 'node:assert/strict';
import test from 'node:test';
import { formatVietnamAddress } from './addressFormatter.js';

test('Vietnam address preview trims and joins detail, street, ward, and province in order', () => {
  assert.equal(formatVietnamAddress({
    detail: '  Số 12  ',
    streetName: '  Đường Lê Lợi',
    wardName: 'Phường Bến Nghé ',
    provinceName: ' TP. Hồ Chí Minh  '
  }), 'Số 12, Đường Lê Lợi, Phường Bến Nghé, TP. Hồ Chí Minh');
});

test('Vietnam address preview omits empty parts and safely handles invalid inputs', () => {
  assert.equal(formatVietnamAddress({ detail: '   ', streetName: 'Đường A', wardName: '', provinceName: null }), 'Đường A');
  assert.equal(formatVietnamAddress(null), '');
  assert.equal(formatVietnamAddress([]), '');
});
