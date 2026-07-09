const prisma = require('../config/database');

const invalidateActiveOtps = async (userId) => {
  return prisma.passwordChangeOtp.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
};

const createPasswordChangeOtp = async ({ userId, otpHash, expiresAt }) => {
  return prisma.$transaction(async (tx) => {
    await tx.passwordChangeOtp.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return tx.passwordChangeOtp.create({
      data: {
        userId,
        otpHash,
        expiresAt,
      },
    });
  });
};

const findLatestActiveOtp = async (userId) => {
  return prisma.passwordChangeOtp.findFirst({
    where: {
      userId,
      usedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const incrementOtpAttempts = async (id) => {
  return prisma.passwordChangeOtp.update({
    where: { id },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });
};

const completePasswordChange = async ({ otpId, userId, passwordHash }) => {
  return prisma.$transaction(async (tx) => {
    const otp = await tx.passwordChangeOtp.findFirst({
      where: {
        id: otpId,
        userId,
        usedAt: null,
      },
    });

    if (!otp) {
      throw new Error('OTP is no longer valid');
    }

    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await tx.passwordChangeOtp.update({
      where: { id: otpId },
      data: { usedAt: new Date() },
    });
  });
};

module.exports = {
  invalidateActiveOtps,
  createPasswordChangeOtp,
  findLatestActiveOtp,
  incrementOtpAttempts,
  completePasswordChange,
};
