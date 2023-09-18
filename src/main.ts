import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerInit } from './swagger';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '@api/users/users.module';
import { AuthenticationModule } from '@api/authentication/authentication.module';

async function bootstrap() {
  const infoLogRotationTransport = new DailyRotateFile({
    filename: './/logs//info',
    datePattern: 'YYYY-MM-DD-HH:MM',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '80d',
    level: 'info',
    extension: '.log',
  });

  const errorLogRotationTransport = new DailyRotateFile({
    filename: './/logs//error',
    datePattern: 'YYYY-MM-DD-HH:MM',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '80d',
    level: 'error',
    extension: '.log',
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.prettyPrint(),
      ),
      transports: [
        infoLogRotationTransport,
        errorLogRotationTransport,
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('app'),
          ),
        }),
      ],
    }),
  });

  app.enableCors();

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  SwaggerInit(app, [UsersModule, AuthenticationModule]);

  const PORT = configService.get<string>('PORT');

  await app.listen(PORT);

  const appUrl = await app.getUrl();

  Logger.log(`app is running on ${appUrl}`, 'NestApplication');
}

bootstrap();
