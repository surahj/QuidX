export enum TokenType {
  /** multi-factor authentication  */
  MFA = '2FA',
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  FORGET_PASSWORD = 'FORGET_PASSWORD',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}
