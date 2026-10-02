const assert = require('node:assert/strict');
const { after, beforeEach, test } = require('node:test');
const userModel = require('../models/user.model');
const vietnamAdministrativeUnits = require('../data/vietnamAdministrativeUnits.json');
const addressService = require('../services/address.service');
const { createAddressService } = require('../services/address.service');

const province = vietnamAdministrativeUnits.provinces[0];
const ward = vietnamAdministrativeUnits.wards.find((item) => item.provinceCode === province.code);
const localAddressService = createAddressService({ dataset: vietnamAdministrativeUnits });
const originalResolveAddress = addressService.resolveAddress;
const originalToUserAddressFields = addressService.toUserAddressFields;
addressService.resolveAddress = localAddressService.resolveAddress;
addressService.toUserAddressFields = localAddressService.toUserAddressFields;
const controller = require('./auth.controller');

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

const invokeRegister = async (body) => {
  const response = createResponse();
  let forwardedError;
  await controller.register({ body }, response, (error) => {
    forwardedError = error;
  });
  return { response, forwardedError };
};

const registrationBody = (overrides = {}) => ({
  username: 'ada',
  email: 'ada@example.com',
  password: 'password',
  fullName: 'Ada Lovelace',
  phone: '0123456789',
  ...overrides,
});

let createdPayload;
beforeEach(() => {
  process.env.JWT_SECRET = 'auth-address-register-test-secret';
  createdPayload = null;
  userModel.findByEmail = async () => null;
  userModel.create = async (payload) => {
    createdPayload = payload;
    return {
      id: 'registered-user',
      username: payload.username,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    };
  };
});

after(() => {
  addressService.resolveAddress = originalResolveAddress;
  addressService.toUserAddressFields = originalToUserAddressFields;
});

test('register persists server-derived province and ward names and ignores submitted names and unknown fields', async () => {
  const detail = 'Số 12, ngõ 3, Phố Hàng Bài';
  const { response, forwardedError } = await invokeRegister(registrationBody({
    address: {
      provinceCode: province.code,
      provinceName: 'Forged Province',
      wardCode: ward.code,
      wardName: 'Forged Ward',
      [['street', 'Ref'].join('')]: 'ignored',
      [['street', 'Name'].join('')]: 'ignored',
      detail,
    },
  }));

  assert.equal(forwardedError, undefined);
  assert.equal(response.statusCode, 201);
  assert.equal(createdPayload.address, `${detail}, ${ward.name}, ${province.name}`);
  assert.equal(createdPayload.addressProvinceCode, province.code);
  assert.equal(createdPayload.addressProvinceName, province.name);
  assert.equal(createdPayload.addressWardCode, ward.code);
  assert.equal(createdPayload.addressWardName, ward.name);
  assert.equal(createdPayload.addressDetail, detail);
  assert.equal(createdPayload.role, 'customer');
});

test('register accepts an empty address and persists canonical null fields', async () => {
  const { response, forwardedError } = await invokeRegister(registrationBody({ address: '' }));

  assert.equal(forwardedError, undefined);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(
    Object.fromEntries(Object.entries(createdPayload).filter(([key]) => key.startsWith('address'))),
    {
      address: null,
      addressProvinceCode: null,
      addressProvinceName: null,
      addressWardCode: null,
      addressWardName: null,
      addressDetail: null,
    },
  );
});

test('register rejects partial, raw-text, and mismatched province/ward addresses', async () => {
  const otherProvinceWard = vietnamAdministrativeUnits.wards.find((item) => item.provinceCode !== province.code);
  const invalidAddresses = [
    { provinceCode: province.code },
    '123 Free Text Road, Hanoi',
    { provinceCode: province.code, wardCode: otherProvinceWard.code, detail: 'Số 12, Phố Hàng Bài' },
  ];

  for (const address of invalidAddresses) {
    const { response, forwardedError } = await invokeRegister(registrationBody({ address }));
    assert.equal(forwardedError, undefined);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
    assert.ok(Array.isArray(response.body.errors));
    assert.ok(response.body.errors.length > 0);
    assert.equal(createdPayload, null);
  }
});
