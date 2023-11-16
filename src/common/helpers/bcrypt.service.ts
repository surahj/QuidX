import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService {
  async hash(payload: string | Buffer, rounds = 10): Promise<string> {
    const salt = await this.generateSalt(rounds);
    return await bcrypt.hash(payload, salt);
  }

  async compare(plain: string | Buffer, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }

  async generateSalt(rounds = 10): Promise<string> {
    return await bcrypt.genSalt(rounds);
  }
}
