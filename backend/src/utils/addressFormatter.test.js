const assert = require('node:assert/strict');
const { test } = require('node:test');
const { formatVietnamAddress } = require('./addressFormatter');

test('Vietnam address formatting trims detail, ward, and province in canonical order', () => {
  assert.equal(formatVietnamAddress({
    detail: '  Số 12, ngõ 5, Phố Hàng Bài  ',
    wardName: ' Phường Hoàn Kiếm ',
    provinceName: ' Thành phố Hà Nội  ',
  }), 'Số 12, ngõ 5, Phố Hàng Bài, Phường Hoàn Kiếm, Thành phố Hà Nội');
});

test('Vietnam address formatting omits empty and non-string parts without truncating detail', () => {
  const longDetail = `${'x'.repeat(300)} `;
  const formatted = formatVietnamAddress({
    detail: longDetail,
    wardName: 'Ward',
    provinceName: null,
  });
  assert.equal(formatted, `${'x'.repeat(300)}, Ward`);
  assert.equal(formatted.length, 306);
});

test('Vietnam address formatting rejects non-object and array inputs', () => {
  for (const value of [null, undefined, 'address', [], 5]) {
    assert.equal(formatVietnamAddress(value), '');
  }
});
