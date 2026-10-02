const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');

const userModel = require('../models/user.model');
const addressService = require('../services/address.service');

const ADDRESS_DATASET = {
  provinces: [{ code: '01', name: 'Thành phố Hà Nội', type: 'thành phố' }],
  wards: [{ code: '00070', provinceCode: '01', name: 'Phường Hoàn Kiếm', type: 'phường' }],
};
const SELECTED_ADDRESS = {
  provinceCode: '01',
  wardCode: '00070',
  detail: 'Số 12, ngách 3, Phố Đinh Tiên Hoàng',
};
const CANONICAL_USER_ADDRESS_FIELDS = {
  address: 'Số 12, ngách 3, Phố Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội',
  addressProvinceCode: '01',
  addressProvinceName: 'Thành phố Hà Nội',
  addressWardCode: '00070',
  addressWardName: 'Phường Hoàn Kiếm',
  addressDetail: 'Số 12, ngách 3, Phố Đinh Tiên Hoàng',
};
const EMPTY_USER_ADDRESS_FIELDS = {
  address: null,
  addressProvinceCode: null,
  addressProvinceName: null,
  addressWardCode: null,
  addressWardName: null,
  addressDetail: null,
};

const withLocalAddressService = async (run) => {
  const service = addressService.createAddressService({ dataset: ADDRESS_DATASET });
  const originals = {
    resolveAddress: addressService.resolveAddress,
    toUserAddressFields: addressService.toUserAddressFields,
  };
  addressService.resolveAddress = service.resolveAddress;
  addressService.toUserAddressFields = service.toUserAddressFields;
  try {
    return await run();
  } finally {
    Object.assign(addressService, originals);
  }
};

const structuredUser = () => ({ ...CANONICAL_USER_ADDRESS_FIELDS });

const createResponse = () => {
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(body) {
      response.body = body;
      return response;
    },
  };
  return response;
};

beforeEach(() => {
  userModel.findById = async () => null;
  userModel.findAll = async () => ({
    items: [
      {
        id: 'user-1',
        username: 'Ada',
        email: 'ada@example.com',
        fullName: 'Ada Lovelace',
        isBlocked: false,
        role: 'customer',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  });
  userModel.updateRole = async (id, role) => ({
    id,
    username: 'Ada',
    email: 'ada@example.com',
    role,
  });
  userModel.updateAdminProfile = async (id, data) => ({
    id,
    email: 'ada@example.com',
    role: 'customer',
    isBlocked: false,
    ...data,
  });
  userModel.updateBlocked = async (id, isBlocked) => ({
    id,
    username: 'Ada',
    email: 'ada@example.com',
    role: 'customer',
    isBlocked,
  });
});

test('getUsers accepts supported and absent roles while preserving the pagination envelope', async () => {
  const controller = require('./user.controller');
  const calls = [];
  userModel.findAll = async (params) => {
    calls.push(params);
    return {
      items: [{ id: 'user-1', username: 'Ada', email: 'ada@example.com', role: 'customer' }],
      pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
    };
  };

  for (const role of [undefined, '', 'customer', 'staff', 'admin']) {
    const query = { keyword: 'ada', page: '2', limit: '10' };
    if (role !== undefined) query.role = role;
    const response = createResponse();
    await controller.getUsers({ query }, response, assert.fail);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data.pagination, { page: 2, limit: 10, total: 11, totalPages: 2 });
    assert.equal(response.body.data.items[0].email, 'ada@example.com');
    assert.equal(response.body.data.items[0].role, 'customer');
  }

  assert.deepEqual(calls, [
    { keyword: 'ada', page: '2', limit: '10' },
    { keyword: 'ada', page: '2', limit: '10' },
    { keyword: 'ada', page: '2', limit: '10', role: 'customer' },
    { keyword: 'ada', page: '2', limit: '10', role: 'staff' },
    { keyword: 'ada', page: '2', limit: '10', role: 'admin' },
  ]);
});

test('getUsers rejects unknown, array, object, and null roles without querying the model', async () => {
  const controller = require('./user.controller');
  let findAllCalled = false;
  userModel.findAll = async () => {
    findAllCalled = true;
    return { items: [], pagination: {} };
  };

  for (const role of ['owner', ['customer', 'staff'], { value: 'customer' }, null]) {
    const response = createResponse();
    await controller.getUsers({ query: { role } }, response, assert.fail);
    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body.errors, [{
      field: 'role',
      message: 'Vai trò phải là customer, staff hoặc admin',
    }]);
  }
  assert.equal(findAllCalled, false);
});

test('updateUserRole rejects invalid roles and any current admin self role change', async () => {
  const controller = require('./user.controller');

  const invalidResponse = createResponse();
  await controller.updateUserRole(
    { params: { id: 'user-1' }, body: { role: 'owner' }, user: { id: 'admin-1', role: 'admin' } },
    invalidResponse,
    assert.fail
  );
  assert.equal(invalidResponse.statusCode, 400);
  assert.equal(invalidResponse.body.message, 'Vai trò phải là customer, staff hoặc admin');

  const selfResponse = createResponse();
  await controller.updateUserRole(
    { params: { id: 'admin-1' }, body: { role: 'admin' }, user: { id: 'admin-1', role: 'admin' } },
    selfResponse,
    assert.fail
  );
  assert.equal(selfResponse.statusCode, 400);
  assert.equal(selfResponse.body.message, 'Bạn không thể thay đổi vai trò quản trị viên của chính mình');
});

test('updateUserRole updates another user role through the model', async () => {
  const controller = require('./user.controller');
  let received = null;
  userModel.updateRole = async (id, role) => {
    received = { id, role };
    return { id, username: 'Ada', email: 'ada@example.com', role };
  };

  const response = createResponse();
  await controller.updateUserRole(
    { params: { id: 'user-1' }, body: { role: 'admin' }, user: { id: 'admin-1', role: 'admin' } },
    response,
    assert.fail
  );

  assert.deepEqual(received, { id: 'user-1', role: 'admin' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.user.role, 'admin');
});

test('updateAdminUser persists server-derived address data and ignores forged names and permissions', async () => {
  const controller = require('./user.controller');
  let persisted = null;
  userModel.updateAdminProfile = async (id, data) => {
    persisted = { id, ...structuredClone(data) };
    return { id, email: 'ada@example.com', role: 'customer', isBlocked: false, ...data };
  };

  const response = createResponse();
  await withLocalAddressService(async () => {
    await controller.updateAdminUser(
      {
        params: { id: 'user-1' },
        body: {
          username: ' ada ',
          fullName: ' Ada Lovelace ',
          phone: '0987654321',
          address: {
            ...SELECTED_ADDRESS,
            provinceName: 'Forged Province',
            wardName: 'Forged Ward',
            [['street', 'Ref'].join('')]: 'ignored',
            [['street', 'Name'].join('')]: 'ignored',
          },
          role: 'admin',
          isBlocked: true,
        },
        user: { id: 'admin-1', role: 'admin' },
      },
      response,
      assert.fail
    );
  });

  assert.deepEqual(persisted, {
    id: 'user-1',
    username: 'ada',
    fullName: 'Ada Lovelace',
    phone: '0987654321',
    ...CANONICAL_USER_ADDRESS_FIELDS,
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.user.username, 'ada');
  assert.equal(response.body.data.user.role, 'customer');
  assert.equal(response.body.data.user.isBlocked, false);
});

test('updateAdminUser rejects empty username and empty profile payload', async () => {
  const controller = require('./user.controller');

  const emptyUsernameResponse = createResponse();
  await controller.updateAdminUser(
    { params: { id: 'user-1' }, body: { username: ' ' }, user: { id: 'admin-1', role: 'admin' } },
    emptyUsernameResponse,
    assert.fail
  );
  assert.equal(emptyUsernameResponse.statusCode, 400);
  assert.equal(emptyUsernameResponse.body.message, 'Tên người dùng không được để trống');

  const emptyPayloadResponse = createResponse();
  await controller.updateAdminUser(
    { params: { id: 'user-1' }, body: { role: 'admin' }, user: { id: 'admin-1', role: 'admin' } },
    emptyPayloadResponse,
    assert.fail
  );
  assert.equal(emptyPayloadResponse.statusCode, 400);
  assert.equal(emptyPayloadResponse.body.message, 'Chưa cung cấp trường có thể chỉnh sửa để cập nhật');
});

test('updateUserBlocked blocks other users but rejects current admin self-block', async () => {
  const controller = require('./user.controller');
  let received = null;
  userModel.updateBlocked = async (id, isBlocked) => {
    received = { id, isBlocked };
    return { id, username: 'Ada', email: 'ada@example.com', role: 'customer', isBlocked };
  };

  const selfResponse = createResponse();
  await controller.updateUserBlocked(
    { params: { id: 'admin-1' }, body: { isBlocked: true }, user: { id: 'admin-1', role: 'admin' } },
    selfResponse,
    assert.fail
  );
  assert.equal(selfResponse.statusCode, 400);
  assert.equal(selfResponse.body.message, 'Bạn không thể khóa tài khoản quản trị viên của chính mình');

  const response = createResponse();
  await controller.updateUserBlocked(
    { params: { id: 'user-1' }, body: { isBlocked: true }, user: { id: 'admin-1', role: 'admin' } },
    response,
    assert.fail
  );

  assert.deepEqual(received, { id: 'user-1', isBlocked: true });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.user.isBlocked, true);
});

test('updateProfile rejects invalid phone values before model invocation', async () => {
  const controller = require('./user.controller');
  let updateCalled = false;
  userModel.update = async () => {
    updateCalled = true;
  };

  const response = createResponse();
  await controller.updateProfile(
    { user: { id: 'user-1' }, body: { phone: 987654321 } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Số điện thoại chỉ được chứa chữ số.');
  assert.equal(updateCalled, false);
});
test('updateProfile persists canonical address fields from the submitted details', async () => {
  const controller = require('./user.controller');
  let persisted = null;
  userModel.update = async (id, data) => {
    persisted = { id, ...structuredClone(data) };
    return { id, ...data };
  };

  const response = createResponse();
  await withLocalAddressService(async () => {
    await controller.updateProfile(
      {
        user: { id: 'user-1' },
        body: {
          phone: '0987654321',
          address: {
            ...SELECTED_ADDRESS,
            provinceName: 'Forged Province',
            wardName: 'Forged Ward',
            [['street', 'Ref'].join('')]: 'ignored',
            [['street', 'Name'].join('')]: 'ignored',
          },
          role: 'admin',
        },
      },
      response,
      assert.fail
    );
  });

  assert.deepEqual(persisted, {
    id: 'user-1',
    phone: '0987654321',
    ...CANONICAL_USER_ADDRESS_FIELDS,
  });
  assert.equal(response.statusCode, 200);
});

test('omitting address preserves verified and empty addresses on both profile endpoints', async () => {
  const controller = require('./user.controller');
  const currentUsers = [
    structuredUser(),
    { address: null, addressProvinceCode: null, addressProvinceName: null },
  ];

  for (const endpoint of ['profile', 'admin']) {
    for (const currentUser of currentUsers) {
      let persisted = null;
      userModel.findById = async () => currentUser;
      userModel.update = async (id, data) => {
        persisted = { id, ...structuredClone(data) };
        return { id, ...data };
      };
      userModel.updateAdminProfile = async (id, data) => {
        persisted = { id, ...structuredClone(data) };
        return { id, ...data };
      };

      const response = createResponse();
      const request = endpoint === 'profile'
        ? { user: { id: 'user-1' }, body: { phone: '0987654321' } }
        : { params: { id: 'user-1' }, body: { phone: '0987654321' } };
      await controller[endpoint === 'profile' ? 'updateProfile' : 'updateAdminUser'](
        request,
        response,
        assert.fail
      );
      assert.equal(response.statusCode, 200);
      assert.deepEqual(persisted, { id: 'user-1', phone: '0987654321' });
    }
  }
});

test('legacy free-text addresses require selection for omitted or null updates on both profile endpoints', async () => {
  const controller = require('./user.controller');

  for (const endpoint of ['profile', 'admin']) {
    for (const address of [undefined, null]) {
      let writeCalled = false;
      userModel.findById = async () => ({ address: 'Old unstructured address' });
      userModel.update = async () => {
        writeCalled = true;
      };
      userModel.updateAdminProfile = async () => {
        writeCalled = true;
      };
      const body = { phone: '0987654321' };
      if (address !== undefined) body.address = address;
      const request = endpoint === 'profile'
        ? { user: { id: 'user-1' }, body }
        : { params: { id: 'user-1' }, body };
      const response = createResponse();

      await controller[endpoint === 'profile' ? 'updateProfile' : 'updateAdminUser'](
        request,
        response,
        assert.fail
      );

      assert.equal(response.statusCode, 400);
      assert.equal(response.body.errors[0].field, 'address');
      assert.match(response.body.message, /chọn lại địa chỉ/);
      assert.equal(writeCalled, false);
    }
  }
});

test('partial and mismatched province/ward addresses return 400 without persisting', async () => {
  const controller = require('./user.controller');
  const invalidAddresses = [
    { provinceCode: '01', wardCode: '00070', detail: '' },
    { provinceCode: '01', wardCode: '99999', detail: 'Số 12, Phố Đinh Tiên Hoàng' },
    { provinceCode: '79', wardCode: '00070', detail: 'Số 12, Phố Đinh Tiên Hoàng' },
  ];

  for (const endpoint of ['profile', 'admin']) {
    for (const address of invalidAddresses) {
      let writeCalled = false;
      userModel.update = async () => {
        writeCalled = true;
      };
      userModel.updateAdminProfile = async () => {
        writeCalled = true;
      };
      const response = createResponse();
      const request = endpoint === 'profile'
        ? { user: { id: 'user-1' }, body: { address } }
        : { params: { id: 'user-1' }, body: { address } };

      await withLocalAddressService(async () => {
        await controller[endpoint === 'profile' ? 'updateProfile' : 'updateAdminUser'](
          request,
          response,
          assert.fail
        );
      });

      assert.equal(response.statusCode, 400);
      assert.equal(response.body.success, false);
      assert.equal(writeCalled, false);
    }
  }
});

test('explicit null clears a verified address through the real mapper on either profile endpoint', async () => {
  const controller = require('./user.controller');

  for (const endpoint of ['profile', 'admin']) {
    let persisted = null;
    userModel.findById = async () => structuredUser();
    userModel.update = async (id, data) => {
      persisted = { id, ...structuredClone(data) };
      return { id, ...data };
    };
    userModel.updateAdminProfile = async (id, data) => {
      persisted = { id, ...structuredClone(data) };
      return { id, ...data };
    };
    const response = createResponse();

    await withLocalAddressService(async () => {
      const request = endpoint === 'profile'
        ? { user: { id: 'user-1' }, body: { address: null } }
        : { params: { id: 'user-1' }, body: { address: null } };
      await controller[endpoint === 'profile' ? 'updateProfile' : 'updateAdminUser'](
        request,
        response,
        assert.fail
      );
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(persisted, { id: 'user-1', ...EMPTY_USER_ADDRESS_FIELDS });
  }
});

test('unexpected profile storage failures are forwarded to next without being swallowed', async () => {
  const controller = require('./user.controller');
  const failure = new Error('database write failed');

  for (const endpoint of ['profile', 'admin']) {
    const forwarded = [];
    const response = createResponse();
    userModel.update = async () => {
      throw failure;
    };
    userModel.updateAdminProfile = async () => {
      throw failure;
    };
    const request = endpoint === 'profile'
      ? { user: { id: 'user-1' }, body: { phone: '0987654321' } }
      : { params: { id: 'user-1' }, body: { phone: '0987654321' } };

    await controller[endpoint === 'profile' ? 'updateProfile' : 'updateAdminUser'](
      request,
      response,
      (error) => forwarded.push(error)
    );

    assert.deepEqual(forwarded, [failure]);
    assert.equal(response.statusCode, null);
    assert.equal(response.body, null);
  }
});


test('updateAdminUser rejects invalid phone values before model invocation', async () => {
  const controller = require('./user.controller');
  let updateCalled = false;
  userModel.updateAdminProfile = async () => {
    updateCalled = true;
  };

  const response = createResponse();
  await controller.updateAdminUser(
    {
      params: { id: 'user-1' },
      body: { phone: '09-123' },
      user: { id: 'admin-1', role: 'admin' },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Số điện thoại chỉ được chứa chữ số.');
  assert.equal(updateCalled, false);
});
