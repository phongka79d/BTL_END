import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCsvContent } from './csvExport.js';

test('buildCsvContent emits an Excel-ready UTF-8 CSV with CRLF rows', () => {
  const csv = buildCsvContent(
    ['Sản phẩm', 'Số lượng'],
    [
      ['Tai nghe', 3],
      ['Bàn phím', 1],
    ]
  );

  assert.equal(csv, '\uFEFFSản phẩm,Số lượng\r\nTai nghe,3\r\nBàn phím,1');
});

test('buildCsvContent quotes cells containing separators, quotes, or newlines', () => {
  const csv = buildCsvContent(
    ['Tên'],
    [['Tai nghe, không dây'], ['Màn hình "4K"'], ['Ghi chú\nnhiều dòng'], ['a;b']]
  );

  const rows = csv.slice(1).split('\r\n');

  assert.equal(rows[1], '"Tai nghe, không dây"');
  assert.equal(rows[2], '"Màn hình ""4K"""');
  assert.equal(rows[3], '"Ghi chú\nnhiều dòng"');
  assert.equal(rows[4], '"a;b"');
});

test('buildCsvContent renders empty cells for null and undefined values', () => {
  assert.equal(buildCsvContent(['a', 'b', 'c'], [[null, undefined, 0]]), '\uFEFFa,b,c\r\n,,0');
});
