const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const expressApp = require('../app');
const vietnamAdministrativeUnits = require('../data/vietnamAdministrativeUnits.json');
const { createAddressController, createStreetRateLimiter } = require('./address.controller');
const { createAddressService } = require('../services/address.service');

let server;
let baseUrl;

test.before(async () => {
  server = expressApp.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

const request = async (path, headers = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { connection: 'close', ...headers }
  });
  return {
    status: response.status,
    retryAfter: response.headers.get('retry-after'),
    body: await response.json()
  };
};

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const invoke = async (handler, req) => {
  const response = createResponse();
  let forwardedError;
  await handler(req, response, (error) => {
    forwardedError = error;
  });
  return { response, forwardedError };
};

test('mounted public province and ward endpoints return data.items without authentication', async () => {
  const provinces = await request('/api/addresses/provinces');
  assert.equal(provinces.status, 200);
  assert.equal(provinces.body.success, true);
  assert.ok(Array.isArray(provinces.body.data.items));
  assert.ok(provinces.body.data.items.some((province) => province.code === '01'));

  const wards = await request('/api/addresses/wards?provinceCode=01');
  assert.equal(wards.status, 200);
  assert.equal(wards.body.success, true);
  assert.ok(Array.isArray(wards.body.data.items));
  assert.ok(wards.body.data.items.some((ward) => ward.provinceCode === '01'));
});

test('address endpoints reject array and object query values, short searches, and wrong ward hierarchy', async () => {
  const repeatedProvince = new URLSearchParams([
    ['provinceCode', '01'],
    ['provinceCode', '04']
  ]);
  const repeated = await request(`/api/addresses/wards?${repeatedProvince}`);
  assert.equal(repeated.status, 400);
  assert.equal(repeated.body.success, false);

  const controller = createAddressController(createAddressService({
    dataset: vietnamAdministrativeUnits,
    provider: null
  }));
  for (const provinceCode of [['01'], { code: '01' }]) {
    const { response, forwardedError } = await invoke(controller.getWards, {
      query: { provinceCode }
    });
    assert.equal(forwardedError, undefined);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
  }

  const shortQuery = await request('/api/addresses/streets?provinceCode=01&wardCode=00004&q=x');
  assert.equal(shortQuery.status, 400);
  const foreignWard = vietnamAdministrativeUnits.wards.find((ward) => ward.provinceCode !== '01');
  assert.ok(foreignWard);
  const wrongHierarchyQuery = new URLSearchParams([
    ['provinceCode', '01'],
    ['wardCode', foreignWard.code],
    ['q', 'road']
  ]);
  const wrongHierarchy = await request(`/api/addresses/streets?${wrongHierarchyQuery}`);
  assert.equal(wrongHierarchy.status, 400);

  for (const query of [['road'], { contains: 'road' }]) {
    const { response, forwardedError } = await invoke(controller.getStreets, {
      query: { provinceCode: '01', wardCode: '00004', q: query }
    });
    assert.equal(forwardedError, undefined);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
  }
});

test('local address reads remain available without a provider while street lookup returns 503', async () => {
  const service = createAddressService({ dataset: vietnamAdministrativeUnits, provider: null });
  const controller = createAddressController(service);

  const provinces = await invoke(controller.getProvinces, { query: {} });
  assert.equal(provinces.response.statusCode, 200);
  assert.ok(Array.isArray(provinces.response.body.data.items));

  const wards = await invoke(controller.getWards, { query: { provinceCode: '01' } });
  assert.equal(wards.response.statusCode, 200);
  assert.ok(Array.isArray(wards.response.body.data.items));

  const streets = await invoke(controller.getStreets, {
    query: { provinceCode: '01', wardCode: '00004', q: 'road' }
  });
  assert.equal(streets.response.statusCode, 503);
  assert.equal(streets.response.body.success, false);
  assert.deepEqual(streets.response.body.errors, []);
});

test('service field errors are retained in the controller error envelope', async () => {
  const fieldErrors = { provinceCode: 'Invalid province', wardCode: 'Required' };
  const failure = Object.assign(new Error('Address validation failed'), {
    statusCode: 400,
    errors: fieldErrors
  });
  const controller = createAddressController({
    listWards: async () => { throw failure; }
  });
  const { response, forwardedError } = await invoke(controller.getWards, {
    query: { provinceCode: 'invalid' }
  });

  assert.equal(forwardedError, undefined);
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Address validation failed',
    errors: fieldErrors
  });
});

test('street limiter isolates req.ip clients, resets windows, honors Retry-After, and ignores X-Forwarded-For', () => {
  let currentTime = 10_000;
  const limiter = createStreetRateLimiter({ limit: 1, windowMs: 2_000, now: () => currentTime });
  const attempt = (ip, forwardedFor) => {
    const response = createResponse();
    response.headers = {};
    response.set = (name, value) => {
      response.headers[name.toLowerCase()] = value;
      return response;
    };
    let continued = false;
    limiter({
      ip,
      headers: { 'x-forwarded-for': forwardedFor },
      socket: { remoteAddress: '127.0.0.1' }
    }, response, () => { continued = true; });
    return { response, continued };
  };

  assert.equal(attempt('client-a', '203.0.113.10').continued, true);
  const blocked = attempt('client-a', '198.51.100.99');
  assert.equal(blocked.continued, false);
  assert.equal(blocked.response.statusCode, 429);
  assert.equal(blocked.response.headers['retry-after'], '2');
  assert.equal(blocked.response.body.success, false);

  assert.equal(attempt('client-b', '203.0.113.10').continued, true);
  currentTime += 2_000;
  assert.equal(attempt('client-a', '198.51.100.99').continued, true);
});

test('mounted street route responds 429 with Retry-After after the per-client limit', async () => {
  let lastResponse;
  for (let attempt = 0; attempt < 61; attempt += 1) {
    lastResponse = await request(
      '/api/addresses/streets?provinceCode=01&wardCode=99999&q=road',
      { 'x-forwarded-for': `203.0.113.${attempt + 1}` }
    );
  }

  assert.equal(lastResponse.status, 429);
  assert.equal(lastResponse.body.success, false);
  assert.match(lastResponse.retryAfter || '', /^\d+$/);
  assert.ok(Number(lastResponse.retryAfter) >= 1);
});
