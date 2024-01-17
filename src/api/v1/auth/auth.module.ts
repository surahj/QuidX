import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { BcryptService } from '@common/helpers/bcrypt.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local-strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.services';
import { DatabaseModule } from '@database/database.module';
import { EmailModule } from '@modules/emails/email.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    BcryptService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
  ],
  imports: [
    JwtModule.register({}),
    UsersModule,
    PassportModule,
    DatabaseModule,
    EmailModule,
  ],
})
export class AuthModule {}
