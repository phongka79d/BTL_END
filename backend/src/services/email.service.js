const nodemailer = require('nodemailer');

const getDeliveryMode = () => process.env.PASSWORD_OTP_DELIVERY_MODE || 'console';

const createSmtpTransport = () => {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
};

const sendPasswordChangeOtpEmail = async ({ to, otp }) => {
  const mode = getDeliveryMode();

  if (mode === 'console') {
    console.info(`Password change OTP for ${to}: ${otp}`);
    return { delivery: 'console' };
  }

  if (mode !== 'smtp') {
    throw new Error('Unsupported password OTP delivery mode');
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    throw new Error('SMTP password OTP delivery is not configured');
  }

  const transporter = createSmtpTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your TechMart password change OTP',
    text: `Your password change OTP is ${otp}. It expires in ${process.env.PASSWORD_OTP_EXPIRES_MINUTES || 10} minutes.`,
  });

  return { delivery: 'smtp' };
};

module.exports = {
  sendPasswordChangeOtpEmail,
};
