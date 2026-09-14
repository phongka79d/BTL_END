import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Bảo vệ lỗi lớp "thiếu import component JSX": ESLint core không coi định danh
 * component JSX là tham chiếu, nên ví dụ `<Heading>` mà thiếu import sẽ lọt
 * qua lint và làm trắng cả trang khi render (ReferenceError: Heading is not defined).
 *
 * Test này quét mọi file .jsx trong src/ (bỏ qua file test) và bắt buộc mọi
 * định danh component được dùng trong JSX phải được import hoặc khai báo cục bộ.
 */

const SRC_ROOT = path.dirname(fileURLToPath(import.meta.url));

// Các định danh toàn cục hợp lệ, không cần import.
const ALLOWED_GLOBALS = new Set(['React']);

const collectFiles = (dir, extension, skip) => {
  const files = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath, extension, skip));
      continue;
    }

    if (fullPath.endsWith(extension) && !skip.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
};

// Bỏ comment và chuỗi để không nhầm ví dụ trong tài liệu với JSX thật.
const stripCommentsAndStrings = (code) => {
  let out = '';
  let index = 0;

  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];

    if (char === '/' && next === '*') {
      const end = code.indexOf('*/', index + 2);
      index = end === -1 ? code.length : end + 2;
      out += ' ';
      continue;
    }

    if (char === '/' && next === '/') {
      const end = code.indexOf('\n', index);
      index = end === -1 ? code.length : end;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      index += 1;
      while (index < code.length && code[index] !== quote) {
        index += code[index] === '\\' ? 2 : 1;
      }
      index += 1;
      out += '""';
      continue;
    }

    out += char;
    index += 1;
  }

  return out;
};

const collectBoundIdentifiers = (source) => {
  const bound = new Set();

  for (const match of source.matchAll(/import\s+(?:([A-Za-z0-9_$]+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"][^'"]+['"]/g)) {
    if (match[1]) bound.add(match[1].trim());
    if (match[2]) {
      match[2].split(',').forEach((entry) => {
        const [original, alias] = entry.trim().split(/\s+as\s+/);
        const name = (alias || original || '').trim();
        if (name) bound.add(name);
      });
    }
  }

  for (const match of source.matchAll(/import\s+\*\s+as\s+([A-Za-z0-9_$]+)/g)) {
    bound.add(match[1]);
  }

  for (const match of source.matchAll(/(?:const|let|var|function|class)\s+([A-Z][A-Za-z0-9_]*)/g)) {
    bound.add(match[1]);
  }

  for (const match of source.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=/g)) {
    match[1].split(',').forEach((entry) => {
      const name = entry.trim().split(':').pop().split('=')[0].trim();
      if (name) bound.add(name);
    });
  }

  return bound;
};

const collectUsedJsxIdentifiers = (source) => {
  const used = new Set();

  for (const match of stripCommentsAndStrings(source).matchAll(/<([A-Z][A-Za-z0-9_]*)[\s/>]/g)) {
    used.add(match[1]);
  }

  return used;
};

test('every JSX component identifier is imported or declared in its module', () => {
  const offenders = [];

  for (const file of collectFiles(SRC_ROOT, '.jsx', /\.test\.(jsx?|js)$/)) {
    const source = readFileSync(file, 'utf8');
    const bound = collectBoundIdentifiers(source);
    const missing = [...collectUsedJsxIdentifiers(source)].filter(
      (name) => !bound.has(name) && !ALLOWED_GLOBALS.has(name)
    );

    if (missing.length) {
      offenders.push(`${path.relative(SRC_ROOT, file)} → ${missing.sort().join(', ')}`);
    }
  }

  assert.deepEqual(offenders, [], `Unbound JSX component identifiers:\n${offenders.join('\n')}`);
});
