const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const expressApp = require('../app');
const vietnamAdministrativeUnits = require('../data/vietnamAdministrativeUnits.json');
const { createAddressController } = require('./address.controller');
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

const request = async (path) => {
  const response = await fetch(`${baseUrl}${path}`);
  return { status: response.status, body: await response.json() };
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
  },
});

const invoke = async (handler, req) => {
  const res = createResponse();
  let forwarded;
  await handler(req, res, (error) => { forwarded = error; });
  return { res, forwarded };
};

test('public province and ward endpoints return bundled data without authentication', async () => {
  const provinces = await request('/api/addresses/provinces');
  assert.equal(provinces.status, 200);
  assert.equal(provinces.body.success, true);
  assert.equal(provinces.body.data.items.length, vietnamAdministrativeUnits.provinces.length);

  const firstProvince = vietnamAdministrativeUnits.provinces[0];
  const wards = await request(`/api/addresses/wards?provinceCode=${firstProvince.code}`);
  assert.equal(wards.status, 200);
  assert.ok(wards.body.data.items.length > 0);
  assert.ok(wards.body.data.items.every((ward) => ward.provinceCode === firstProvince.code));
});

test('ward endpoint rejects invalid parent province input', async () => {
  const missing = await request('/api/addresses/wards');
  assert.equal(missing.status, 400);
  assert.equal(missing.body.success, false);
});

test('address controller returns invalid province errors', async () => {
  const service = createAddressService({ dataset: vietnamAdministrativeUnits });
  const controller = createAddressController(service);
  const { res, forwarded } = await invoke(controller.getWards, { query: { provinceCode: 'invalid' } });

  assert.equal(forwarded, undefined);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, 'Mã tỉnh/thành phố không hợp lệ');
  assert.deepEqual(res.body.errors, []);
});

test('address controller returns structured service errors without forwarding them', async () => {
  const service = {
    listWards: async () => {
      const error = new Error('Ward is outside the selected province');
      error.statusCode = 400;
      error.errors = [{ field: 'wardCode', message: error.message }];
      throw error;
    },
  };
  const controller = createAddressController(service);
  const { res, forwarded } = await invoke(controller.getWards, { query: { provinceCode: 'invalid' } });

  assert.equal(forwarded, undefined);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body.errors, [{ field: 'wardCode', message: 'Ward is outside the selected province' }]);
});
test('removed street endpoint returns 404', async () => {
  assert.equal((await request('/api/addresses/streets')).status, 404);
});
