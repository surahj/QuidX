import {
  getEmailToResetPasswordOptions,
  getEmailVerificationOptions,
  getEmailWelcomeOptions,
  getEmailWhilePasswodResetedOptions,
  sendOtpToEmailOptions,
  transporter,
} from './config';
import { EmailService } from './email.service';
import { ReceiverEmailData } from './types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NodeMailerService implements EmailService {
  public async sendEmailWelcome({
    email,
    username,
    token,
  }: ReceiverEmailData): Promise<void> {
    const options = getEmailWelcomeOptions({ email, username, token });

    await transporter.sendMail(options);
  }

  async resendEmailVerification({
    email,
    username,
    token,
  }: ReceiverEmailData): Promise<void> {
    const options = getEmailVerificationOptions({ email, username, token });

    await transporter.sendMail(options);
  }

  async sendEmailToResetPassword(
    receiverEmailData: ReceiverEmailData,
  ): Promise<void> {
    const options = getEmailToResetPasswordOptions(receiverEmailData);

    await transporter.sendMail(options);
  }

  public async sendOtpToEmail(
    receiverEmailData: ReceiverEmailData,
  ): Promise<void> {
    const options = sendOtpToEmailOptions(receiverEmailData);

    await transporter.sendMail(options);
  }

  public async sendEmailWhilePasswordReseted(
    receiverEmailData: ReceiverEmailData,
  ): Promise<void> {
    const options = getEmailWhilePasswodResetedOptions(receiverEmailData);

    return transporter.sendMail(options);
  }
}
