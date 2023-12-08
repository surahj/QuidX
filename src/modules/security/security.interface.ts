import { TokenType } from '@common/enums';
import { DynamicObject } from '@common/interfaces';
import { Algorithm } from 'jsonwebtoken';

export interface GenerateTokenOptions {
  /**  time for token to expires (default is 24h) */
  expiresIn?: string;

  /** algorithm (default is RS256) */
  algorithm?: Algorithm;

  privateKey?: string | Buffer;

  secret?: string | Buffer;
}

export interface VerifyTokenOptions {
  secret?: string | Buffer;

  publicKey?: string | Buffer;
}

export type TokenData = { tokenType: TokenType } & DynamicObject;
