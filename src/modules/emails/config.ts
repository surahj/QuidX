import * as dotenv from 'dotenv';
import * as Mailgen from 'mailgen';
import * as nodemailer from 'nodemailer';
import { EmailOptionsType, ReceiverEmailData } from './types';

dotenv.config();

const COMPANY_NAME = process.env.COMPANY_NAME;
const COMPANY_EMAIL = process.env.COMPANY_EMAIL;

const NGIMDOCK_LINKEDIN = process.env.NGIMDOCK_LINKEDIN;

const SERVER_APP_HOST = process.env.SERVER_APP_HOST;
const SERVER_APP_PORT = process.env.SERVER_APP_PORT;

const mailtrapHost = process.env.MAILTRAP_HOST;
const mailtrapPort = process.env.MAILTRAP_PORT;
const mailtrapUsername = process.env.MAILTRAP_USERNAME;
const mailtrapPassword = process.env.MAILTRAP_PASSWORD;

export const transporter = nodemailer.createTransport({
  host: mailtrapHost,
  port: mailtrapPort,
  auth: {
    user: mailtrapUsername,
    pass: mailtrapPassword,
  },
});

const MailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: COMPANY_NAME,
    link: NGIMDOCK_LINKEDIN,
  },
});

export const getEmailWelcomeOptions = ({
  email,
  username,
  token,
  callbackUrl,
}: ReceiverEmailData): EmailOptionsType => {
  const template = {
    body: {
      name: username || 'there',
      intro: `Welcome to ${COMPANY_NAME} We're very excited to have you on board.`,
      action: {
        instructions: `To get started with ${COMPANY_NAME} , please click here:`,
        button: {
          color: '#22BC66',
          text: 'Confirm your account',
          link: `${callbackUrl}?token=${token}`,
        },
      },
      outro: `Need help, or have questions? Just reply to this email, we'd love to help.


              ${COMPANY_NAME} Team.
            `,
    },
  };

  const welcomeEmailTemplate = MailGenerator.generate(template);

  return {
    from: COMPANY_EMAIL,
    to: email,
    subject: `Welcome to ${COMPANY_NAME}`,
    html: welcomeEmailTemplate,
  };
};

export const getEmailVerificationOptions = ({
  email,
  username,
  token,
}: ReceiverEmailData): EmailOptionsType => {
  const template = {
    body: {
      name: username || '',
      intro: `To ensure that you receive all important updates and information related to our services, we need to verify your email account.`,
      action: {
        instructions: `Please click on the verification link provided below to complete the process:`,
        button: {
          color: '#22BC66',
          text: 'Verify your email',
          link: `${SERVER_APP_HOST}:${SERVER_APP_PORT}/auth/email/verify/${token}`,
        },
      },
      outro: `Need help, or have questions? Just reply to this email, we'd love to help.


              ${COMPANY_NAME} Team.
            `,
    },
  };

  const welcomeEmailTemplate = MailGenerator.generate(template);

  return {
    from: COMPANY_EMAIL,
    to: email,
    subject: `Please Verify Your Email Account`,
    html: welcomeEmailTemplate,
  };
};

export const sendOtpToEmailOptions = ({
  email,
  username,
  token,
}: ReceiverEmailData): EmailOptionsType => {
  const template = {
    body: {
      name: username || '',
      intro: `Find Below the Otp to reset your password.`,
      action: {
        instructions: `Otp will expire in in 4 min.`,
        token: {
          color: '#22BC66',
          text: `${token}`,
        },
        button: {
          color: '#22BC66',
          text: `${token}`,
          link: ``,
        },
      },
      outro: `If you did not request a password reset, no further action is required on your part.


              ${COMPANY_NAME} Team.
            `,
    },
  };

  const otpTemplate = MailGenerator.generate(template);

  return {
    from: COMPANY_EMAIL,
    to: email,
    subject: `Reset password OTP`,
    html: otpTemplate,
  };
};

export const getEmailToResetPasswordOptions = ({
  email,
  username,
  token,
  callbackUrl,
}: ReceiverEmailData): EmailOptionsType => {
  const template = {
    body: {
      name: username || '',
      intro: `Click on this button to reset your password.`,
      action: {
        instructions: `This reset password link will expire in in 5 min.`,
        button: {
          color: '#22BC66',
          text: 'Reset your password',
          link: `${callbackUrl}?token=${token}`,
        },
      },
      outro: `Need help, or have questions? Just reply to this email, we'd love to help.


              ${COMPANY_NAME} Team.
            `,
    },
  };

  const resetPasswordTemplate = MailGenerator.generate(template);

  return {
    from: COMPANY_EMAIL,
    to: email,
    subject: `Reset your password`,
    html: resetPasswordTemplate,
  };
};

export const getEmailWhilePasswodResetedOptions = ({
  email,
  username,
}: ReceiverEmailData): EmailOptionsType => {
  const template = {
    body: {
      name: username || '',
      intro: `Your password has been reset successfully, use your new password to login.`,
      action: {
        instructions: `If you did this action, you can safely ignore this email. Otherwise, contact us immediately.`,
        button: {
          color: '#22BC66',
          text: 'The login page',
          link: `${SERVER_APP_HOST}:${SERVER_APP_PORT}/auth/login`,
        },
      },
      outro: `Need help, or have questions? Just reply to this email, we'd love to help.


              ${COMPANY_NAME} Team.
            `,
    },
  };

  const welcomeEmailTemplate = MailGenerator.generate(template);

  return {
    from: COMPANY_EMAIL,
    to: email,
    subject: `Your password has been reset`,
    html: welcomeEmailTemplate,
  };
};

export const getEmailToDownloadPdf = ({
  email,
  username,
  link,
}: ReceiverEmailData): EmailOptionsType => {
  const template = {
    body: {
      name: username || '',
      intro: `Thank you for having interest in QuidX.`,
      action: {
        instructions: 'Click the button below to download your pdf.',
        button: {
          color: '#22BC66',
          text: 'Downlod',
          link: `${link}`,
        },
      },
      outro: `Need help, or have questions? Just reply to this email, we'd love to help.


              ${COMPANY_NAME} Team.
            `,
    },
  };

  const sendPdfTemplate = MailGenerator.generate(template);
  return {
    from: COMPANY_EMAIL,
    to: email,
    subject: `Download your pdf`,
    html: sendPdfTemplate,
  };
};
