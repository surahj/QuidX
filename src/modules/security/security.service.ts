import { Injectable, Logger } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  // constructor(private readonly jwtService: JwtService) {}

  public async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
