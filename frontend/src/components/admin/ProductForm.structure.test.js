import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./ProductForm.jsx', import.meta.url),
  'utf8'
);

test('product form keeps dialog actions reachable in a constrained viewport', () => {
  const dialogIndex = source.indexOf('<Dialog');
  const layoutIndex = source.indexOf('<Layout', dialogIndex);
  const contentIndex = source.indexOf('<LayoutContent', layoutIndex);
  const formIndex = source.indexOf('<form', contentIndex);

  assert.ok(dialogIndex >= 0, 'expected a Dialog');
  assert.ok(layoutIndex > dialogIndex, 'expected Layout inside Dialog');
  assert.ok(contentIndex > layoutIndex, 'expected LayoutContent inside Layout');
  assert.ok(formIndex > contentIndex, 'expected form inside scrollable LayoutContent');
  assert.equal(source.includes('height="auto"'), false);
  assert.match(source, /const formId = useId\(\)/);
  assert.match(source, /form=\{formId\}/);
});
