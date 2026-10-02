const assert = require('node:assert/strict');
const { test } = require('node:test');
const { formatVietnamAddress } = require('./addressFormatter');

test('Vietnam address formatting trims each nonempty component in display order', () => {
  assert.equal(formatVietnamAddress({
    detail: '  Căn hộ 12  ',
    streetName: '  Đường Lê Lợi ',
    wardName: ' Phường Bến Thành ',
    provinceName: ' Thành phố Hồ Chí Minh  ',
  }), 'Căn hộ 12, Đường Lê Lợi, Phường Bến Thành, Thành phố Hồ Chí Minh');
});

test('Vietnam address formatting omits empty and non-string parts without truncating detail', () => {
  const longDetail = `${'x'.repeat(300)} `;
  const formatted = formatVietnamAddress({
    detail: longDetail,
    streetName: '',
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
