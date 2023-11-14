import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { BcryptService } from '@common/helpers/bcrypt.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local-strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, BcryptService, LocalStrategy],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY') },
      }),
    }),
    UsersModule,
    PassportModule,
  ],
})
export class AuthModule {}
