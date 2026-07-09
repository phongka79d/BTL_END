const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { after, beforeEach, test } = require('node:test');

const servicePath = require.resolve('./email.service');
const nodemailerPath = require.resolve('nodemailer');
const originalNodemailerModule = require.cache[nodemailerPath];
const originalConsoleInfo = console.info;
const envKeys = [
  'NODE_ENV',
  'PASSWORD_OTP_DELIVERY_MODE',
  'PASSWORD_OTP_EXPIRES_MINUTES',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

const resetEnv = () => {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
};

const setEnv = (values) => {
  for (const key of envKeys) {
    delete process.env[key];
  }

  Object.assign(process.env, values);
};

const loadEmailServiceWithNodemailer = (nodemailer) => {
  delete require.cache[servicePath];
  require.cache[nodemailerPath] = {
    id: nodemailerPath,
    filename: nodemailerPath,
    loaded: true,
    exports: nodemailer,
  };

  return require('./email.service');
};

beforeEach(() => {
  resetEnv();
  console.info = () => {};
  delete require.cache[servicePath];
});

after(() => {
  delete require.cache[servicePath];
  console.info = originalConsoleInfo;
  resetEnv();

  if (originalNodemailerModule) {
    require.cache[nodemailerPath] = originalNodemailerModule;
  } else {
    delete require.cache[nodemailerPath];
  }
});

test('email service sends password change otp from backend only', () => {
  const source = readFileSync(path.join(__dirname, 'email.service.js'), 'utf8');

  assert.match(source, /sendPasswordChangeOtpEmail/);
  assert.match(source, /nodemailer/);
  assert.match(source, /SMTP_HOST/);
  assert.match(source, /PASSWORD_OTP_DELIVERY_MODE/);
  assert.doesNotMatch(source, /supabase|createClient|fetch\(/i);
});

test('console mode returns console delivery without creating smtp transport', async () => {
  const createTransportCalls = [];
  const { sendPasswordChangeOtpEmail } = loadEmailServiceWithNodemailer({
    createTransport: (...args) => {
      createTransportCalls.push(args);
      throw new Error('SMTP transport should not be created in console mode');
    },
  });
  setEnv({
    NODE_ENV: 'development',
    PASSWORD_OTP_DELIVERY_MODE: '  CoNsOlE ',
  });

  const result = await sendPasswordChangeOtpEmail({ to: 'user@example.com', otp: '123456' });

  assert.deepEqual(result, { delivery: 'console' });
  assert.equal(createTransportCalls.length, 0);
});

test('production without explicit smtp delivery mode fails closed', async () => {
  const createTransportCalls = [];
  const { sendPasswordChangeOtpEmail } = loadEmailServiceWithNodemailer({
    createTransport: (...args) => {
      createTransportCalls.push(args);
      return { sendMail: async () => {} };
    },
  });
  setEnv({ NODE_ENV: 'production' });

  await assert.rejects(
    sendPasswordChangeOtpEmail({ to: 'user@example.com', otp: '123456' }),
    /PASSWORD_OTP_DELIVERY_MODE=smtp is required in production/
  );
  assert.equal(createTransportCalls.length, 0);
});

test('smtp mode builds expected sendMail payload', async () => {
  const createTransportCalls = [];
  const sendMailCalls = [];
  const { sendPasswordChangeOtpEmail } = loadEmailServiceWithNodemailer({
    createTransport: (...args) => {
      createTransportCalls.push(args);
      return { sendMail: async (payload) => sendMailCalls.push(payload) };
    },
  });
  setEnv({
    NODE_ENV: 'production',
    PASSWORD_OTP_DELIVERY_MODE: 'SMTP',
    PASSWORD_OTP_EXPIRES_MINUTES: '15',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '465',
    SMTP_USER: 'smtp-user',
    SMTP_PASS: 'smtp-pass',
    SMTP_FROM: 'no-reply@example.com',
  });

  const result = await sendPasswordChangeOtpEmail({ to: 'user@example.com', otp: '123456' });

  assert.deepEqual(result, { delivery: 'smtp' });
  assert.deepEqual(createTransportCalls, [[{
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'smtp-user',
      pass: 'smtp-pass',
    },
  }]]);
  assert.deepEqual(sendMailCalls, [{
    from: 'no-reply@example.com',
    to: 'user@example.com',
    subject: 'Your TechMart password change OTP',
    text: 'Your password change OTP is 123456. It expires in 15 minutes.',
  }]);
});

test('smtp mode fails clearly when smtp port is invalid', async () => {
  const createTransportCalls = [];
  const { sendPasswordChangeOtpEmail } = loadEmailServiceWithNodemailer({
    createTransport: (...args) => {
      createTransportCalls.push(args);
      return { sendMail: async () => {} };
    },
  });
  setEnv({
    PASSWORD_OTP_DELIVERY_MODE: 'smtp',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 'not-a-port',
    SMTP_FROM: 'no-reply@example.com',
  });

  await assert.rejects(
    sendPasswordChangeOtpEmail({ to: 'user@example.com', otp: '123456' }),
    /SMTP_PORT must be a positive integer/
  );
  assert.equal(createTransportCalls.length, 0);
});

test('smtp mode fails clearly when smtp credentials are partial', async () => {
  const createTransportCalls = [];
  const { sendPasswordChangeOtpEmail } = loadEmailServiceWithNodemailer({
    createTransport: (...args) => {
      createTransportCalls.push(args);
      return { sendMail: async () => {} };
    },
  });
  setEnv({
    PASSWORD_OTP_DELIVERY_MODE: 'smtp',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '587',
    SMTP_USER: 'smtp-user',
    SMTP_FROM: 'no-reply@example.com',
  });

  await assert.rejects(
    sendPasswordChangeOtpEmail({ to: 'user@example.com', otp: '123456' }),
    /SMTP_USER and SMTP_PASS must both be set or both be empty/
  );
  assert.equal(createTransportCalls.length, 0);
});
