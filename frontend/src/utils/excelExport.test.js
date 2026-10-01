import assert from 'node:assert/strict';
import test from 'node:test';
import { unzipSync, strFromU8 } from 'fflate';
import { buildReportFileName, createReportWorkbookBlob } from './excelExport.js';

const decodeText = (text) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

const openWorkbook = async (report) => {
  const blob = await createReportWorkbookBlob(report);
  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  const xml = (name) => strFromU8(files[name]);
  const strings = [...xml('xl/sharedStrings.xml').matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((match) => decodeText(match[1]));
  const cells = (sheet) => Object.fromEntries([...xml(`xl/worksheets/sheet${sheet}.xml`).matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)].map((match) => {
    const address = match[1].match(/\br="([^"]+)"/)[1];
    const value = match[2].match(/<v>([\s\S]*?)<\/v>/)?.[1];
    return [address, /\bt="s"/.test(match[1]) ? strings[Number(value)] : Number(value)];
  }));
  return { xml, cells };
};

test('generated workbook preserves Vietnamese text, numeric sales and applied date boundaries across three sheets', async () => {
  const workbook = await openWorkbook({
    range: { startDate: '2026-09-01', endDate: '2026-09-30' },
    revenue: { totalRevenue: '1234.50', completedOrderCount: 2 },
    orderSummary: { pending: 7, completed: 2 },
    products: [{ productId: 'p-1', name: 'Điện thoại & phụ kiện', brand: 'Thương hiệu', soldQuantity: 3, revenue: '1234.50' }],
  });
  const names = [...workbook.xml('xl/workbook.xml').matchAll(/<sheet\b[^>]*\bname="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(names, ['Revenue', 'Order Summary', 'Best Selling Products']);
  const revenue = workbook.cells(1);
  assert.equal(revenue.B2, '2026-09-01');
  assert.equal(revenue.B3, '2026-09-30');
  assert.equal(revenue.B4, 1234.5);
  assert.equal(revenue.B5, 2);
  assert.equal(workbook.cells(2).B2, 7);
  const products = workbook.cells(3);
  assert.equal(products.B2, 'Điện thoại & phụ kiện');
  assert.equal(products.C2, 'Thương hiệu');
  assert.equal(products.D2, 3);
  assert.equal(products.E2, 1234.5);
});

test('empty reports remain valid workbooks with zero totals and readable product headers', async () => {
  const workbook = await openWorkbook({});
  assert.equal(workbook.cells(1).B4, 0);
  assert.equal(workbook.cells(1).B5, 0);
  assert.equal(workbook.cells(3).B1, 'Tên sản phẩm');
  assert.equal(workbook.cells(3).A2, undefined);
});

test('product text resembling a formula remains text and absent product revenue is not invented', async () => {
  const workbook = await openWorkbook({ products: [{ productId: 'p-2', name: '=HYPERLINK("https://example.invalid", "Điện thoại")', soldQuantity: 1 }] });
  assert.equal(workbook.cells(3).B2, '=HYPERLINK("https://example.invalid", "Điện thoại")');
  assert.doesNotMatch(workbook.xml('xl/worksheets/sheet3.xml'), /<f(?:\s|>)/);
  assert.notEqual(workbook.cells(3).E2, 0);
});

test('report filename reflects applied boundaries without path or Windows filename control characters', () => {
  assert.equal(buildReportFileName({ startDate: '2026-09-01', endDate: '2026-09-30' }), 'tsshop-report-2026-09-01_2026-09-30.xlsx');
  assert.equal(buildReportFileName(null), 'tsshop-report-toan-thoi-gian.xlsx');
  assert.doesNotMatch(buildReportFileName({ startDate: 'a/b\\c:"d*e?f|g\u0000' }), /[<>:"/\\|?*\p{Cc}]/u);
});
