const { run } = require('node:test');
const { spec } = require('node:test/reporters');
const path = require('node:path');
const fs = require('node:fs');

/**
 * Tìm kiếm đệ quy tất cả các tệp kiểm thử *.test.js trong thư mục src
 */
const findTestFiles = (dir) => {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
      results.push(fullPath);
    }
  }
  return results;
};

const testFiles = findTestFiles(path.join(__dirname));

console.log(`Đang chạy ${testFiles.length} tệp kiểm thử backend...`);

const testStream = run({ files: testFiles });

testStream.on('test:fail', () => {
  process.exitCode = 1;
});

testStream
  .compose(spec)
  .pipe(process.stdout);
