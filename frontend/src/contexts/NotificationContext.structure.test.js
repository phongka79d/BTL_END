import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const contextUrl = new URL('./NotificationContext.jsx', import.meta.url);
const appUrl = new URL('../App.jsx', import.meta.url);
const alertUrl = new URL('../components/common/Alert.jsx', import.meta.url);

test('notification context wraps Astryx toast viewport at top end', () => {
  assert.equal(existsSync(contextUrl), true);

  const source = readFileSync(contextUrl, 'utf8');

  assert.match(source, /ToastViewport/);
  assert.match(source, /position="topEnd"/);
  assert.match(source, /maxVisible=\{4\}/);
  assert.match(source, /useToast/);
  assert.match(source, /success:/);
  assert.match(source, /error:/);
  assert.match(source, /warning:/);
  assert.match(source, /info:/);
  assert.match(source, /autoHideDuration/);
});

test('notification severity changes the badge only while toast background stays neutral', () => {
  const source = readFileSync(contextUrl, 'utf8');

  assert.match(source, /error:\s*\{[\s\S]*badgeVariant:\s*'error'[\s\S]*toastType:\s*'info'/);
  assert.doesNotMatch(source, /toastType:\s*'error'/);
});

test('app installs notification provider around routes', () => {
  const source = readFileSync(appUrl, 'utf8');

  assert.match(source, /import \{ NotificationProvider \} from '\.\/contexts\/NotificationContext';/);
  assert.match(source, /<NotificationProvider>[\s\S]*<AppRoutes \/>[\s\S]*<\/NotificationProvider>/);
});

test('shared alert emits toast notifications instead of rendering local cards', () => {
  const source = readFileSync(alertUrl, 'utf8');

  assert.match(source, /useNotification/);
  assert.match(source, /notification\[/);
  assert.doesNotMatch(source, /<Card|<VStack|<Text/);
});
