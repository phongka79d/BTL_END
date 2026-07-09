const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const bcrypt = require('bcrypt');

const userModel = require('../models/user.model');
const passwordChangeOtpModel = require('../models/passwordChangeOtp.model');
const emailService = require('../services/email.service');
const { PASSWORD_POLICY_MESSAGE } = require('../utils/passwordPolicy');

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
  process.env.JWT_SECRET = 'test-secret';
  userModel.findByEmail = async () => null;
  userModel.findById = async () => null;
  passwordChangeOtpModel.createPasswordChangeOtp = async () => null;
  passwordChangeOtpModel.findLatestActiveOtp = async () => null;
  passwordChangeOtpModel.findLatestUnusedOtp = async () => null;
  passwordChangeOtpModel.incrementOtpAttempts = async () => null;
  passwordChangeOtpModel.completePasswordChange = async () => null;
  passwordChangeOtpModel.invalidateActiveOtps = async () => null;
  emailService.sendPasswordChangeOtpEmail = async () => ({ delivery: 'console' });
});

test('login rejects blocked users before issuing a token', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('blocked123', 4);
  userModel.findByEmail = async () => ({
    id: 'user-1',
    username: 'blocked',
    email: 'blocked@example.com',
    fullName: 'Blocked User',
    passwordHash,
    role: 'customer',
    isBlocked: true,
  });

  const response = createResponse();
  await controller.login(
    { body: { email: 'blocked@example.com', password: 'blocked123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.message, 'Your account has been blocked');
  assert.equal(response.body.data, undefined);
});

test('login accepts existing weak passwords when the hash matches', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('old123', 4);
  userModel.findByEmail = async () => ({
    id: 'user-1',
    username: 'legacy',
    email: 'legacy@example.com',
    fullName: 'Legacy User',
    passwordHash,
    role: 'customer',
    isBlocked: false,
  });

  const response = createResponse();
  await controller.login(
    { body: { email: 'legacy@example.com', password: 'old123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'Login successful');
  assert.equal(response.body.data.user.email, 'legacy@example.com');
});

test('login rejects existing weak passwords when the hash does not match', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('old123', 4);
  userModel.findByEmail = async () => ({
    id: 'user-1',
    username: 'legacy',
    email: 'legacy@example.com',
    fullName: 'Legacy User',
    passwordHash,
    role: 'customer',
    isBlocked: false,
  });

  const response = createResponse();
  await controller.login(
    { body: { email: 'legacy@example.com', password: 'wrong123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'Invalid email or password');
});

test('requestPasswordChangeOtp rejects unauthenticated users', async () => {
  const controller = require('./auth.controller');
  const response = createResponse();

  await controller.requestPasswordChangeOtp(
    { user: null, body: { currentPassword: 'old123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'User not authenticated');
});

test('requestPasswordChangeOtp verifies current password before creating otp', async () => {
  const controller = require('./auth.controller');
  let created = false;
  const passwordHash = await bcrypt.hash('correct123', 4);

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.createPasswordChangeOtp = async () => {
    created = true;
  };

  const response = createResponse();
  await controller.requestPasswordChangeOtp(
    { user: { id: 'user-1' }, body: { currentPassword: 'wrong123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Current password is incorrect');
  assert.equal(created, false);
});

test('requestPasswordChangeOtp creates and sends otp after current password passes', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('correct123', 4);
  let createdPayload = null;
  let emailPayload = null;

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.createPasswordChangeOtp = async (payload) => {
    createdPayload = payload;
    return { id: 'otp-1' };
  };
  emailService.sendPasswordChangeOtpEmail = async (payload) => {
    emailPayload = payload;
    return { delivery: 'console' };
  };

  const response = createResponse();
  await controller.requestPasswordChangeOtp(
    { user: { id: 'user-1' }, body: { currentPassword: 'correct123' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'Password change OTP sent');
  assert.equal(createdPayload.userId, 'user-1');
  assert.match(createdPayload.otpHash, /^\$2/);
  assert.equal(emailPayload.to, 'ada@example.com');
  assert.match(emailPayload.otp, /^\d{6}$/);
});

test('confirmPasswordChange rejects mismatched new password confirmation without updating', async () => {
  const controller = require('./auth.controller');
  let completed = false;

  passwordChangeOtpModel.completePasswordChange = async () => {
    completed = true;
  };

  const response = createResponse();
  await controller.confirmPasswordChange(
    {
      user: { id: 'user-1' },
      body: {
        currentPassword: 'correct123',
        otp: '123456',
        newPassword: 'NewPassword1!',
        confirmPassword: 'different123',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'New password and confirmation password must match');
  assert.equal(completed, false);
});

test('confirmPasswordChange rejects new passwords outside the shared policy without updating', async () => {
  const controller = require('./auth.controller');
  let completed = false;

  passwordChangeOtpModel.completePasswordChange = async () => {
    completed = true;
  };

  const response = createResponse();
  await controller.confirmPasswordChange(
    {
      user: { id: 'user-1' },
      body: {
        currentPassword: 'correct123',
        otp: '123456',
        newPassword: 'lowercasepassword1!',
        confirmPassword: 'lowercasepassword1!',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, PASSWORD_POLICY_MESSAGE.replace('Password', 'New password'));
  assert.equal(completed, false);
});

test('confirmPasswordChange rejects invalid otp and does not update password', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('correct123', 4);
  const otpHash = await bcrypt.hash('123456', 4);
  let completed = false;
  let attemptsIncremented = false;

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.findLatestActiveOtp = async () => ({
    id: 'otp-1',
    userId: 'user-1',
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
  });
  passwordChangeOtpModel.incrementOtpAttempts = async () => {
    attemptsIncremented = true;
  };
  passwordChangeOtpModel.completePasswordChange = async () => {
    completed = true;
  };

  const response = createResponse();
  await controller.confirmPasswordChange(
    {
      user: { id: 'user-1' },
      body: {
        currentPassword: 'correct123',
        otp: '000000',
        newPassword: 'NewPassword1!',
        confirmPassword: 'NewPassword1!',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Invalid OTP');
  assert.equal(attemptsIncremented, true);
  assert.equal(completed, false);
});

test('confirmPasswordChange updates password only after current password and otp pass', async () => {
  const controller = require('./auth.controller');
  const passwordHash = await bcrypt.hash('correct123', 4);
  const otpHash = await bcrypt.hash('123456', 4);
  let completedPayload = null;

  userModel.findById = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    passwordHash,
    isBlocked: false,
  });
  passwordChangeOtpModel.findLatestActiveOtp = async () => ({
    id: 'otp-1',
    userId: 'user-1',
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
  });
  passwordChangeOtpModel.completePasswordChange = async (payload) => {
    completedPayload = payload;
  };

  const response = createResponse();
  await controller.confirmPasswordChange(
    {
      user: { id: 'user-1' },
      body: {
        currentPassword: 'correct123',
        otp: '123456',
        newPassword: 'NewPassword1!',
        confirmPassword: 'NewPassword1!',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'Password changed successfully');
  assert.equal(completedPayload.otpId, 'otp-1');
  assert.equal(completedPayload.userId, 'user-1');
  assert.equal(await bcrypt.compare('NewPassword1!', completedPayload.passwordHash), true);
});

test('requestForgotPasswordOtp returns generic success without creating otp for unknown email', async () => {
  const controller = require('./auth.controller');
  let created = false;
  let emailed = false;

  userModel.findByEmail = async () => null;
  passwordChangeOtpModel.createPasswordChangeOtp = async () => {
    created = true;
  };
  emailService.sendPasswordChangeOtpEmail = async () => {
    emailed = true;
  };

  const response = createResponse();
  await controller.requestForgotPasswordOtp(
    { body: { email: 'missing@example.com' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'If an account exists, a password reset OTP has been sent');
  assert.equal(created, false);
  assert.equal(emailed, false);
});

test('requestForgotPasswordOtp creates and emails otp for an existing user', async () => {
  const controller = require('./auth.controller');
  let createdPayload = null;
  let emailPayload = null;

  userModel.findByEmail = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    isBlocked: false,
  });
  passwordChangeOtpModel.createPasswordChangeOtp = async (payload) => {
    createdPayload = payload;
    return { id: 'otp-1' };
  };
  emailService.sendPasswordChangeOtpEmail = async (payload) => {
    emailPayload = payload;
  };

  const response = createResponse();
  await controller.requestForgotPasswordOtp(
    { body: { email: 'ada@example.com' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'If an account exists, a password reset OTP has been sent');
  assert.equal(createdPayload.userId, 'user-1');
  assert.match(createdPayload.otpHash, /^\$2/);
  assert.equal(emailPayload.to, 'ada@example.com');
  assert.match(emailPayload.otp, /^\d{6}$/);
});

test('verifyForgotPasswordOtp rejects invalid otp without updating password', async () => {
  const controller = require('./auth.controller');
  const otpHash = await bcrypt.hash('123456', 4);
  let completed = false;
  let attemptsIncremented = false;

  userModel.findByEmail = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    isBlocked: false,
  });
  passwordChangeOtpModel.findLatestUnusedOtp = async () => ({
    id: 'otp-1',
    userId: 'user-1',
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
  });
  passwordChangeOtpModel.incrementOtpAttempts = async () => {
    attemptsIncremented = true;
  };
  passwordChangeOtpModel.completePasswordChange = async () => {
    completed = true;
  };

  const response = createResponse();
  await controller.verifyForgotPasswordOtp(
    { body: { email: 'ada@example.com', otp: '000000' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Invalid OTP');
  assert.equal(attemptsIncremented, true);
  assert.equal(completed, false);
});

test('verifyForgotPasswordOtp rejects expired otp with a clear message', async () => {
  const controller = require('./auth.controller');
  const otpHash = await bcrypt.hash('123456', 4);
  let invalidatedUserId = null;

  userModel.findByEmail = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    isBlocked: false,
  });
  passwordChangeOtpModel.findLatestUnusedOtp = async () => ({
    id: 'otp-1',
    userId: 'user-1',
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() - 60_000),
    usedAt: null,
  });
  passwordChangeOtpModel.invalidateActiveOtps = async (userId) => {
    invalidatedUserId = userId;
  };

  const response = createResponse();
  await controller.verifyForgotPasswordOtp(
    { body: { email: 'ada@example.com', otp: '123456' } },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'OTP has expired');
  assert.equal(invalidatedUserId, 'user-1');
});

test('resetForgotPassword updates password only after otp and password confirmation pass', async () => {
  const controller = require('./auth.controller');
  const otpHash = await bcrypt.hash('123456', 4);
  let completedPayload = null;

  userModel.findByEmail = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    isBlocked: false,
  });
  passwordChangeOtpModel.findLatestUnusedOtp = async () => ({
    id: 'otp-1',
    userId: 'user-1',
    otpHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
  });
  passwordChangeOtpModel.completePasswordChange = async (payload) => {
    completedPayload = payload;
  };

  const response = createResponse();
  await controller.resetForgotPassword(
    {
      body: {
        email: 'ada@example.com',
        otp: '123456',
        newPassword: 'NewPassword1!',
        confirmPassword: 'NewPassword1!',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, 'Password reset successfully');
  assert.equal(completedPayload.otpId, 'otp-1');
  assert.equal(completedPayload.userId, 'user-1');
  assert.equal(await bcrypt.compare('NewPassword1!', completedPayload.passwordHash), true);
});

test('resetForgotPassword rejects new passwords outside the shared policy without updating', async () => {
  const controller = require('./auth.controller');
  let completed = false;

  userModel.findByEmail = async () => ({
    id: 'user-1',
    email: 'ada@example.com',
    isBlocked: false,
  });
  passwordChangeOtpModel.completePasswordChange = async () => {
    completed = true;
  };

  const response = createResponse();
  await controller.resetForgotPassword(
    {
      body: {
        email: 'ada@example.com',
        otp: '123456',
        newPassword: 'lowercasepassword1!',
        confirmPassword: 'lowercasepassword1!',
      },
    },
    response,
    assert.fail
  );

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, PASSWORD_POLICY_MESSAGE.replace('Password', 'New password'));
  assert.equal(completed, false);
});
