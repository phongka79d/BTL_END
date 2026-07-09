const nodemailer = require('nodemailer');

const isProduction = () => process.env.NODE_ENV === 'production';

const getDeliveryMode = () => {
  const mode = (process.env.PASSWORD_OTP_DELIVERY_MODE || '').trim().toLowerCase();

  if (!mode) {
    if (isProduction()) {
      throw new Error('PASSWORD_OTP_DELIVERY_MODE=smtp is required in production');
    }

    return 'console';
  }

  if (isProduction() && mode !== 'smtp') {
    throw new Error('PASSWORD_OTP_DELIVERY_MODE=smtp is required in production');
  }

  if (mode !== 'console' && mode !== 'smtp') {
    throw new Error('Unsupported password OTP delivery mode');
  }

  return mode;
};

const getSmtpConfig = () => {
  const host = (process.env.SMTP_HOST || '').trim();
  const from = (process.env.SMTP_FROM || '').trim();

  if (!host || !from) {
    throw new Error('SMTP password OTP delivery is not configured');
  }

  const port = Number(process.env.SMTP_PORT || 587);

  if (!Number.isFinite(port) || !Number.isInteger(port) || port <= 0) {
    throw new Error('SMTP_PORT must be a positive integer');
  }

  if (port > 65535) {
    throw new Error('SMTP_PORT must be an integer between 1 and 65535');
  }

  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if ((user && !pass) || (!user && pass)) {
    throw new Error('SMTP_USER and SMTP_PASS must both be set or both be empty');
  }

  if (!user && !pass) {
    throw new Error('SMTP_USER and SMTP_PASS are required for SMTP password OTP delivery');
  }

  return {
    host,
    port,
    from,
    auth: user && pass
      ? {
          user,
          pass,
        }
      : undefined,
  };
};

const createSmtpTransport = (config) => {
  const { host, port, auth } = config;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth,
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

  const smtpConfig = getSmtpConfig();
  const transporter = createSmtpTransport(smtpConfig);

  await transporter.sendMail({
    from: smtpConfig.from,
    to,
    subject: 'Your TechMart password change OTP',
    text: `Your password change OTP is ${otp}. It expires in ${process.env.PASSWORD_OTP_EXPIRES_MINUTES || 10} minutes.`,
  });

  return { delivery: 'smtp' };
};

module.exports = {
  sendPasswordChangeOtpEmail,
};
