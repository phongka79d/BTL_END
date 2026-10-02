const test = require('node:test');
const assert = require('node:assert/strict');
const orderController = require('./order.controller');
const orderModel = require('../models/order.model');

const createMockResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const validBody = (overrides = {}) => ({
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  address: {
    provinceCode: '01',
    wardCode: '00001',
    streetRef: 'street_1',
    detail: 'Số 123'
  },
  note: 'Giao ngoài giờ',
  cartItemIds: ['item_a'],
  ...overrides
});

const withCheckoutSpy = async (run) => {
  const original = orderModel.checkout;
  const calls = [];
  orderModel.checkout = async (...args) => {
    calls.push(args);
    return { id: 'order_new', status: 'pending' };
  };

  try {
    await run(calls);
  } finally {
    orderModel.checkout = original;
  }
};

const runCheckout = async (body) => {
  const res = createMockResponse();
  const nextCalls = [];
  await orderController.checkout(
    { user: { id: 'user_1' }, body },
    res,
    (error) => { nextCalls.push(error); }
  );
  return { res, nextCalls };
};

test('checkout accepts the structured address and selected cart items at the model boundary', async () => {
  await withCheckoutSpy(async (calls) => {
    const address = {
      provinceCode: '01',
      wardCode: '00001',
      streetRef: 'street_1',
      detail: 'Số 123',
      provinceName: 'Client-provided name must not pass through'
    };
    const { res, nextCalls } = await runCheckout(
      validBody({ fullName: '  Nguyễn Văn A  ', address })
    );

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, 'order_new');
    assert.equal(nextCalls.length, 0);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], [
      'user_1',
      { provinceCode: '01', wardCode: '00001', streetRef: 'street_1', detail: 'Số 123' },
      { fullName: 'Nguyễn Văn A', phone: '0987654321', note: 'Giao ngoài giờ' },
      ['item_a']
    ]);
  });
});

test('checkout sends a null note when the optional note is omitted or null', async () => {
  await withCheckoutSpy(async (calls) => {
    const withoutNote = validBody();
    delete withoutNote.note;
    const { res: resWithoutNote } = await runCheckout(withoutNote);
    assert.equal(resWithoutNote.statusCode, 201);

    const { res: resWithNullNote } = await runCheckout(validBody({ note: null }));
    assert.equal(resWithNullNote.statusCode, 201);

    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0][2], { fullName: 'Nguyễn Văn A', phone: '0987654321', note: null });
    assert.deepEqual(calls[1][2], { fullName: 'Nguyễn Văn A', phone: '0987654321', note: null });
  });
});

test('checkout rejects phone numbers outside the required digit-only 9–11 character range', async () => {
  const invalidPhones = [
    '12345678',
    '123456789012',
    'abc',
    '0987abc',
    '090 123 4567',
    '090-123-4567',
    '090.123.4567',
    '+84901234567',
    ' 0987654321',
    '0987654321 ',
    '',
    '   ',
    null,
    undefined,
    90987654321,
    0,
    true,
    {},
    ['0987654321']
  ];

  await withCheckoutSpy(async (calls) => {
    for (const phone of invalidPhones) {
      const { res, nextCalls } = await runCheckout(validBody({ phone }));
      assert.equal(res.statusCode, 400, String(phone));
      assert.equal(res.body.success, false, String(phone));
      assert.match(res.body.message, /Số điện thoại/, String(phone));
      assert.equal(nextCalls.length, 0, String(phone));
    }

    assert.equal(calls.length, 0);
  });
});

test('checkout accepts exact full-name and phone length boundaries', async () => {
  await withCheckoutSpy(async () => {
    for (const fullName of ['A'.repeat(10), 'A'.repeat(50)]) {
      for (const phone of ['1'.repeat(9), '1'.repeat(11)]) {
        const { res, nextCalls } = await runCheckout(validBody({ fullName, phone }));
        assert.equal(res.statusCode, 201);
        assert.equal(nextCalls.length, 0);
      }
    }
  });
});

test('checkout rejects recipient names outside the required 10–50 character range', async () => {
  const invalidNames = [
    '',
    '   ',
    'A'.repeat(9),
    'A'.repeat(51),
    null,
    undefined,
    123,
    {},
    ['Nguyễn Văn A']
  ];

  await withCheckoutSpy(async (calls) => {
    for (const fullName of invalidNames) {
      const { res, nextCalls } = await runCheckout(validBody({ fullName }));
      assert.equal(res.statusCode, 400, String(fullName));
      assert.match(res.body.message, /Họ và tên/, String(fullName));
      assert.equal(nextCalls.length, 0, String(fullName));
    }

    assert.equal(calls.length, 0);
  });
});

test('checkout rejects a non-string note with 400', async () => {
  await withCheckoutSpy(async (calls) => {
    for (const note of [42, true, {}, ['Giao ngoài giờ']]) {
      const { res, nextCalls } = await runCheckout(validBody({ note }));
      assert.equal(res.statusCode, 400, String(note));
      assert.match(res.body.message, /Ghi chú/, String(note));
      assert.equal(nextCalls.length, 0, String(note));
    }

    assert.equal(calls.length, 0);
  });
});

test('checkout rejects missing, legacy-string, and incomplete structured addresses with field errors', async () => {
  await withCheckoutSpy(async (calls) => {
    for (const body of [
      validBody({ address: undefined }),
      validBody({ address: undefined, shippingAddress: '123 Đường ABC' })
    ]) {
      const { res, nextCalls } = await runCheckout(body);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.deepEqual(res.body.errors.map(({ field }) => field), [
        'provinceCode',
        'wardCode',
        'streetRef',
        'detail'
      ]);
      assert.equal(nextCalls.length, 0);
    }

    const { res, nextCalls } = await runCheckout(validBody({
      address: { provinceCode: '01', wardCode: '00001', detail: 'Số 123' }
    }));
    assert.equal(res.statusCode, 400);
    assert.ok(res.body.errors.some(({ field }) => field === 'streetRef'));
    assert.equal(nextCalls.length, 0);
    assert.equal(calls.length, 0);
  });
});

test('checkout rejects malformed cart item selections with 400', async () => {
  const malformedSelections = [
    { cartItemIds: [], pattern: /Phải chọn ít nhất một sản phẩm/ },
    { cartItemIds: ['item_a', 'item_a'], pattern: /duy nhất/ },
    { cartItemIds: [''], pattern: /phải là chuỗi/ },
    { cartItemIds: [null], pattern: /phải là chuỗi/ },
    { cartItemIds: [1], pattern: /phải là chuỗi/ },
    { cartItemIds: 'item_a', pattern: /Phải chọn ít nhất một sản phẩm/ }
  ];

  await withCheckoutSpy(async (calls) => {
    for (const { cartItemIds, pattern } of malformedSelections) {
      const { res, nextCalls } = await runCheckout(validBody({ cartItemIds }));
      assert.equal(res.statusCode, 400, JSON.stringify(cartItemIds));
      assert.match(res.body.message, pattern, JSON.stringify(cartItemIds));
      assert.equal(nextCalls.length, 0, JSON.stringify(cartItemIds));
    }

    assert.equal(calls.length, 0);
  });
});

test('checkout maps model validation, lookup, conflict, and unavailable errors with field details', async () => {
  const fieldErrors = [{ field: 'streetRef', message: 'Unknown street' }];
  const cases = [
    { status: 400, message: 'Số lượng yêu cầu của Laptop vượt quá tồn kho (4).' },
    { status: 404, message: 'Không tìm thấy sản phẩm có ID product_a.' },
    { status: 409, message: 'Tồn kho của Laptop đã thay đổi, vui lòng thử lại.' },
    {
      statusCode: 503,
      message: 'Address provider unavailable',
      errors: fieldErrors
    }
  ];

  const original = orderModel.checkout;
  try {
    for (const testCase of cases) {
      orderModel.checkout = async () => {
        const error = new Error(testCase.message);
        if (testCase.status) error.status = testCase.status;
        if (testCase.statusCode) error.statusCode = testCase.statusCode;
        if (testCase.errors) error.errors = testCase.errors;
        throw error;
      };

      const { res, nextCalls } = await runCheckout(validBody());
      assert.equal(res.statusCode, testCase.statusCode || testCase.status, testCase.message);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, testCase.message);
      assert.deepEqual(res.body.errors, testCase.errors || []);
      assert.equal(nextCalls.length, 0);
    }
  } finally {
    orderModel.checkout = original;
  }
});

test('checkout forwards unexpected model errors to the error middleware', async () => {
  const original = orderModel.checkout;
  const failure = new Error('database exploded');
  try {
    orderModel.checkout = async () => { throw failure; };

    const { res, nextCalls } = await runCheckout(validBody());
    assert.equal(res.statusCode, null);
    assert.equal(nextCalls.length, 1);
    assert.equal(nextCalls[0], failure);
  } finally {
    orderModel.checkout = original;
  }
});
