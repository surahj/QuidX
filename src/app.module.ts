import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import envValidator from '@common/validators/env.validator';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseLoggerInterceptor } from '@common/interceptors/response-logger.interceptor';
import { ErrorInterceptor } from '@common/interceptors/error.interceptor';
import { NestModule } from '@nestjs/common';
import { RequestLogger } from '@common/middlewares/request-logger.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema: envValidator }),
    DatabaseModule,

  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ResponseLoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ErrorInterceptor },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLogger)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
