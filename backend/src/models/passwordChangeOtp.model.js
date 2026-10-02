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

/**
 * Giữ chỗ nguyên tử một lượt thử OTP: chỉ tăng khi OTP còn hiệu lực và chưa đạt giới hạn.
 * Nhiều yêu cầu đồng thời không thể vượt quá maxAttempts lượt so khớp.
 * @returns {Promise<boolean>} true nếu còn lượt thử.
 */
const reserveOtpAttempt = async (id, maxAttempts) => {
  const result = await prisma.passwordChangeOtp.updateMany({
    where: {
      id,
      usedAt: null,
      expiresAt: { gt: new Date() },
      attempts: { lt: maxAttempts },
    },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });
  return result.count === 1;
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
  findLatestUnusedOtp,
  reserveOtpAttempt,
  completePasswordChange,
};
