import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SecurityService } from './security.service';

@Module({
  imports: [],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
