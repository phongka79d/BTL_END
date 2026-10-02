const test = require('node:test');
const assert = require('node:assert/strict');
const userController = require('./user.controller');
const userModel = require('../models/user.model');
const emailService = require('../services/email.service');
const addressService = require('../services/address.service');

const ADDRESS_DATASET = {
  provinces: [{ code: '01', name: 'Thành phố Hà Nội', type: 'thành phố' }],
  wards: [{ code: '00070', provinceCode: '01', name: 'Phường Hoàn Kiếm', type: 'phường' }],
};
const STREET_RECORD = {
  ref: 'street-01',
  name: 'Phố Đinh Tiên Hoàng',
  provinceCode: '01',
  wardCode: '00070',
};
const SELECTED_ADDRESS = {
  provinceCode: '01',
  wardCode: '00070',
  streetRef: 'street-01',
  detail: 'Số 12, ngách 3',
};
const CANONICAL_USER_ADDRESS_FIELDS = {
  address: 'Số 12, ngách 3, Phố Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội',
  addressProvinceCode: '01',
  addressProvinceName: 'Thành phố Hà Nội',
  addressWardCode: '00070',
  addressWardName: 'Phường Hoàn Kiếm',
  addressStreetRef: 'street-01',
  addressStreetName: 'Phố Đinh Tiên Hoàng',
  addressDetail: 'Số 12, ngách 3',
};

const defaultAddressProvider = {
  resolveStreet: async (ref) => ref === STREET_RECORD.ref ? { ...STREET_RECORD } : null,
};

const createMockResponse = () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
};

const withStubs = async (stubs, run) => {
  const originals = {
    findByEmail: userModel.findByEmail,
    create: userModel.create,
    sendAccountCredentialsEmail: emailService.sendAccountCredentialsEmail,
    resolveAddress: addressService.resolveAddress,
    toUserAddressFields: addressService.toUserAddressFields,
  };
  const service = addressService.createAddressService({
    dataset: ADDRESS_DATASET,
    provider: stubs.addressProvider || defaultAddressProvider,
  });

  userModel.findByEmail = stubs.findByEmail;
  userModel.create = stubs.create;
  emailService.sendAccountCredentialsEmail = stubs.sendAccountCredentialsEmail;
  addressService.resolveAddress = service.resolveAddress;
  addressService.toUserAddressFields = service.toUserAddressFields;

  try {
    return await run();
  } finally {
    userModel.findByEmail = originals.findByEmail;
    userModel.create = originals.create;
    emailService.sendAccountCredentialsEmail = originals.sendAccountCredentialsEmail;
    addressService.resolveAddress = originals.resolveAddress;
    addressService.toUserAddressFields = originals.toUserAddressFields;
  }
};

test('createUser provisions a staff account, hashes the password and emails credentials', async () => {
  let createdPayload = null;
  let emailedPayload = null;

  await withStubs(
    {
      findByEmail: async () => null,
      create: async (payload) => {
        createdPayload = payload;
        return { id: 'user_1', ...payload };
      },
      sendAccountCredentialsEmail: async (payload) => {
        emailedPayload = payload;
        return { delivery: 'console' };
      }
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'nhanvien01',
            email: 'nhanvien01@example.com',
            password: 'Matkhau123!',
            fullName: 'Nguyễn Văn A',
            role: 'staff'
          }
        },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.emailDelivery, 'console');
    }
  );

  assert.equal(createdPayload.role, 'staff');
  assert.equal(createdPayload.username, 'nhanvien01');
  assert.deepEqual({
    address: createdPayload.address,
    addressProvinceCode: createdPayload.addressProvinceCode,
    addressWardCode: createdPayload.addressWardCode,
    addressStreetRef: createdPayload.addressStreetRef,
    addressDetail: createdPayload.addressDetail,
  }, {
    address: null,
    addressProvinceCode: null,
    addressWardCode: null,
    addressStreetRef: null,
    addressDetail: null,
  });
  assert.ok(createdPayload.passwordHash);
  assert.notEqual(createdPayload.passwordHash, 'Matkhau123!');
  assert.equal(emailedPayload.to, 'nhanvien01@example.com');
  assert.equal(emailedPayload.role, 'staff');
});

test('createUser defaults to the staff role and never leaks the password hash', async () => {
  let createdPayload = null;

  await withStubs(
    {
      findByEmail: async () => null,
      create: async (payload) => {
        createdPayload = payload;
        return { id: 'user_2', ...payload };
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        { body: { username: 'nhanvien02', email: 'nhanvien02@example.com', password: 'Matkhau123!' } },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.data.user.passwordHash, undefined);
    }
  );

  assert.equal(createdPayload.role, 'staff');
});

test('createUser rejects duplicate emails and invalid roles', async () => {
  await withStubs(
    {
      findByEmail: async () => ({ id: 'existing_user' }),
      create: async () => {
        throw new Error('create should not be called');
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const duplicateRes = createMockResponse();
      await userController.createUser(
        { body: { username: 'dup', email: 'dup@example.com', password: 'Matkhau123!' } },
        duplicateRes,
        () => {}
      );
      assert.equal(duplicateRes.statusCode, 400);
      assert.equal(duplicateRes.body.success, false);
    }
  );

  await withStubs(
    {
      findByEmail: async () => null,
      create: async () => {
        throw new Error('create should not be called');
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const roleRes = createMockResponse();
      await userController.createUser(
        { body: { username: 'x', email: 'x@example.com', password: 'Matkhau123!', role: 'superadmin' } },
        roleRes,
        () => {}
      );
      assert.equal(roleRes.statusCode, 400);
      assert.equal(roleRes.body.success, false);
    }
  );
});

test('createUser still succeeds when the credential email cannot be delivered', async () => {
  await withStubs(
    {
      findByEmail: async () => null,
      create: async (payload) => ({ id: 'user_3', ...payload }),
      sendAccountCredentialsEmail: async () => {
        throw new Error('SMTP password OTP delivery is not configured');
      }
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        { body: { username: 'nhanvien03', email: 'nhanvien03@example.com', password: 'Matkhau123!' } },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.data.emailDelivery, 'skipped');
    }
  );
});

test('createUser rejects non-string phone values before any model invocation', async () => {
  let findByEmailCalled = false;
  let createCalled = false;

  await withStubs(
    {
      findByEmail: async () => {
        findByEmailCalled = true;
        return null;
      },
      create: async () => {
        createCalled = true;
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' })
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'phone-invalid',
            email: 'phone-invalid@example.com',
            password: 'Matkhau123!',
            phone: 987654321
          }
        },
        res,
        () => {}
      );

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, 'Số điện thoại chỉ được chứa chữ số.');
    }
  );

  assert.equal(findByEmailCalled, false);
  assert.equal(createCalled, false);
});
test('createUser persists resolver-authoritative address fields and ignores forged names and root columns', async () => {
  const selectedAddress = {
    ...SELECTED_ADDRESS,
    provinceName: 'Forged Province',
    wardName: 'Forged Ward',
    streetName: 'Forged Street',
  };
  let persisted = null;

  await withStubs(
    {
      findByEmail: async () => null,
      create: async (payload) => {
        persisted = structuredClone(payload);
        return { id: 'user_address', ...payload };
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' }),
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'address-user',
            email: 'address-user@example.com',
            password: 'Matkhau123!',
            phone: '0123456789',
            address: selectedAddress,
            addressProvinceCode: 'FORGED',
            addressProvinceName: 'Forged root province',
            addressWardCode: 'FORGED',
            addressWardName: 'Forged root ward',
            addressStreetRef: 'forged-root-street',
            addressStreetName: 'Forged root street',
            addressDetail: 'Forged root detail',
            role: 'staff',
          },
        },
        res,
        assert.fail
      );
      assert.equal(res.statusCode, 201);
    }
  );

  assert.deepEqual({
    address: persisted.address,
    addressProvinceCode: persisted.addressProvinceCode,
    addressProvinceName: persisted.addressProvinceName,
    addressWardCode: persisted.addressWardCode,
    addressWardName: persisted.addressWardName,
    addressStreetRef: persisted.addressStreetRef,
    addressStreetName: persisted.addressStreetName,
    addressDetail: persisted.addressDetail,
  }, CANONICAL_USER_ADDRESS_FIELDS);
  assert.equal(persisted.phone, '0123456789');
  assert.equal(persisted.role, 'staff');
  assert.equal(persisted.addressProvinceCode, '01');
});

test('createUser rejects invalid phone length before address resolution or model access', async () => {
  let findByEmailCalled = false;
  let providerCalled = false;
  let createCalled = false;

  await withStubs(
    {
      findByEmail: async () => {
        findByEmailCalled = true;
        return null;
      },
      create: async () => {
        createCalled = true;
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' }),
      addressProvider: {
        resolveStreet: async () => {
          providerCalled = true;
          return { ...STREET_RECORD };
        },
      },
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'phone-short',
            email: 'phone-short@example.com',
            password: 'Matkhau123!',
            phone: '12345678',
            address: SELECTED_ADDRESS,
          },
        },
        res,
        assert.fail
      );
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, 'Số điện thoại phải gồm từ 9 đến 11 chữ số.');
    }
  );

  assert.equal(findByEmailCalled, false);
  assert.equal(providerCalled, false);
  assert.equal(createCalled, false);
});

test('createUser accepts absent, null, and empty optional addresses as empty persisted address data', async () => {
  for (const address of [undefined, null, {}]) {
    let persisted = null;
    await withStubs(
      {
        findByEmail: async () => null,
        create: async (payload) => {
          persisted = structuredClone(payload);
          return { id: 'user_empty_address', ...payload };
        },
        sendAccountCredentialsEmail: async () => ({ delivery: 'console' }),
      },
      async () => {
        const body = {
          username: 'empty-address',
          email: 'empty-address@example.com',
          password: 'Matkhau123!',
          phone: '',
        };
        if (address !== undefined) body.address = address;
        const response = createMockResponse();
        await userController.createUser({ body }, response, assert.fail);
        assert.equal(response.statusCode, 201);
      }
    );
    assert.deepEqual({
      address: persisted.address,
      addressProvinceCode: persisted.addressProvinceCode,
      addressProvinceName: persisted.addressProvinceName,
      addressWardCode: persisted.addressWardCode,
      addressWardName: persisted.addressWardName,
      addressStreetRef: persisted.addressStreetRef,
      addressStreetName: persisted.addressStreetName,
      addressDetail: persisted.addressDetail,
    }, {
      address: null,
      addressProvinceCode: null,
      addressProvinceName: null,
      addressWardCode: null,
      addressWardName: null,
      addressStreetRef: null,
      addressStreetName: null,
      addressDetail: null,
    });
    assert.equal(persisted.phone, null);
  }
});

test('createUser returns a safe 503 and does not persist when street verification is unavailable', async () => {
  let findByEmailCalled = false;
  let createCalled = false;

  await withStubs(
    {
      findByEmail: async () => {
        findByEmailCalled = true;
        return null;
      },
      create: async () => {
        createCalled = true;
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' }),
      addressProvider: {
        resolveStreet: async () => {
          throw new Error('provider credential=private');
        },
      },
    },
    async () => {
      const res = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'provider-down',
            email: 'provider-down@example.com',
            password: 'Matkhau123!',
            address: SELECTED_ADDRESS,
          },
        },
        res,
        assert.fail
      );
      assert.equal(res.statusCode, 503);
      assert.equal(res.body.message, 'Không thể xác thực địa chỉ lúc này. Vui lòng thử lại.');
      assert.equal(res.body.errors[0].field, 'address');
      assert.doesNotMatch(res.body.message, /private/);
    }
  );

  assert.equal(findByEmailCalled, false);
  assert.equal(createCalled, false);
});

test('createUser rejects partial hierarchy and typed streets without writing', async () => {
  for (const address of [
    { provinceCode: '01', wardCode: '00070', detail: 'Số 12, ngách 3' },
    { ...SELECTED_ADDRESS, streetRef: 'Phố Đinh Tiên Hoàng' },
    { ...SELECTED_ADDRESS, wardCode: '99999' },
  ]) {
    let createCalled = false;
    await withStubs(
      {
        findByEmail: async () => {
          assert.fail('invalid address must fail before email lookup');
        },
        create: async () => {
          createCalled = true;
        },
        sendAccountCredentialsEmail: async () => ({ delivery: 'console' }),
      },
      async () => {
        const response = createMockResponse();
        await userController.createUser(
          {
            body: {
              username: 'invalid-address',
              email: 'invalid-address@example.com',
              password: 'Matkhau123!',
              address,
            },
          },
          response,
          assert.fail
        );
        assert.equal(response.statusCode, 400);
        assert.equal(response.body.success, false);
      }
    );
    assert.equal(createCalled, false);
  }
});

test('createUser forwards unexpected storage failures to next', async () => {
  const failure = new Error('database insert failed');
  const forwarded = [];

  await withStubs(
    {
      findByEmail: async () => null,
      create: async () => {
        throw failure;
      },
      sendAccountCredentialsEmail: async () => ({ delivery: 'console' }),
    },
    async () => {
      const response = createMockResponse();
      await userController.createUser(
        {
          body: {
            username: 'db-error',
            email: 'db-error@example.com',
            password: 'Matkhau123!',
          },
        },
        response,
        (error) => forwarded.push(error)
      );
      assert.equal(response.statusCode, null);
      assert.equal(response.body, null);
    }
  );
  assert.deepEqual(forwarded, [failure]);
});
