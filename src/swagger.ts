import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

export function SwaggerInit(
  app: INestApplication,
  // eslint-disable-next-line @typescript-eslint/ban-types
  modules?: Function[],
) {
  const config = new DocumentBuilder()
    .setTitle('QuidX API')
    .setDescription('QuidX documentation')
    .setVersion('1.0')
    .addTag('Api')
    .addCookieAuth('Authentication')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'Bearer', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'QuidX API',
    useGlobalPrefix: false,
  };

  const configService = app.get(ConfigService);

  const NODE_ENV = configService.get<string>('NODE_ENV');

  const swaggerRoute = configService.get<string>('SWAGGER_ROUTE');

  const document = SwaggerModule.createDocument(app, config, {
    // include: modules,
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });

  if (NODE_ENV != 'development') {
    const DEFAULT_ADMIN_USERNAME = configService.get<string>(
      'DEFAULT_ADMIN_USERNAME',
    );

    const DEFAULT_ADMIN_PASSWORD = configService.get<string>(
      'DEFAULT_ADMIN_PASSWORD',
    );

    app.use(
      swaggerRoute,
      basicAuth({
        challenge: true,
        users: { [DEFAULT_ADMIN_USERNAME]: DEFAULT_ADMIN_PASSWORD },
      }),
    );
  }

  SwaggerModule.setup(swaggerRoute, app, document, customOptions);
}
