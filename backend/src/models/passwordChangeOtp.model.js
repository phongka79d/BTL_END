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
      expiresAt: { gt: new Date() },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const findLatestUnusedOtp = async (userId) => {
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
    const now = new Date();
    const claimResult = await tx.passwordChangeOtp.updateMany({
      where: {
        id: otpId,
        userId,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (claimResult.count !== 1) {
      throw new Error('OTP không còn hợp lệ');
    }

    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  });
};

module.exports = {
  invalidateActiveOtps,
  createPasswordChangeOtp,
  findLatestActiveOtp,
  findLatestUnusedOtp,
  incrementOtpAttempts,
  completePasswordChange,
};
