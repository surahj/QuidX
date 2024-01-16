export interface EmailOptionsType {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export type ReceiverEmailData = {
  email: string;
  username?: string;
  token?: string;
  callbackUrl?: string
};

export interface OtpArgs {
  /** time it takes to expire in milli-seconds, default is `5 minutes` (`300_000 milliseconds`) */
  expiresIn?: number;

  /** key to store otp reference in cache */
  key: string;
}

export interface VerifyOtpParams {
  /** key to retrieve the otp reference in cache */
  key: string;
  otp: string;
}
