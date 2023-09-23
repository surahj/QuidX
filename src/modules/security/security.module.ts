import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SecurityService } from './security.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: config.getOrThrow('JWT_PRIVATE_KEY'),
        publicKey: config.getOrThrow('JWT_PUBLIC_KEY'),
      }),
    }),
  ],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
