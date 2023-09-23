import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import envValidator from '@common/validators/env.validator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { AdminModule as AdminJsModule } from '@adminjs/nestjs';
import { adminUIOptions } from '@admin-ui/options';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseLoggerInterceptor } from '@common/interceptors/response-logger.interceptor';
import { ErrorInterceptor } from '@common/interceptors/error.interceptor';
import { NestModule } from '@nestjs/common';
import { RequestLogger } from '@common/middlewares/request-logger.middleware';
import { UsersModule } from '@api/v1/users/users.module';
import { AuthenticationModule } from '@api/v1/authentication/authentication.module';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import Redis from '@database/redis';
import { redisStore } from 'cache-manager-redis-store';
import RedisStore from 'connect-redis';
import * as session from 'express-session';

AdminJS.registerAdapter({ Database, Resource });

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: (await redisStore({
          url: configService.getOrThrow('REDIS_URL'),
        })) as unknown as CacheStore,
      }),
    }),
    AdminJsModule.createAdminAsync(adminUIOptions),
    ConfigModule.forRoot({ validationSchema: envValidator }),
    DatabaseModule,
    UsersModule,
    AuthenticationModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseLoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ErrorInterceptor },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        errorHttpStatusCode: 400,
        stopAtFirstError: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLogger)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    const sessionStore = new RedisStore({
      client: new Redis(this.configService.getOrThrow('REDIS_URL')),
    });

    consumer
      .apply(
        session({
          secret: this.configService.get('APP_SESSION_SECRET'),
          resave: false,
          saveUninitialized: false,
          store: sessionStore,
          cookie: {
            httpOnly: true,
            sameSite: false,
            secure: this.configService.get<string>('NODE_ENV') === 'production',
            // maxAge: 3 * 60 * 60 * 1000, // 3hours
          },
        }),
      )
      .forRoutes('*');
  }
}
