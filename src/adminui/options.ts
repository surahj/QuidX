import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModuleFactory, CustomLoader } from '@adminjs/nestjs';
import { PostgresPrismaService } from '@database/postgres-prisma.service';
import { DatabaseModule } from '@database/database.module';
import AdminResourceBuilder from './resource.builder';

export const adminUIOptions: AdminModuleFactory & CustomLoader = {
  imports: [ConfigModule, DatabaseModule],
  inject: [ConfigService, PostgresPrismaService],
  useFactory: async (
    configService: ConfigService,
    prisma: PostgresPrismaService,
  ) => {
    const ADMINJS_ROUTE = configService.get<string>('ADMINJS_ROUTE');

    const adminResources = new AdminResourceBuilder(prisma);
    adminResources.addResource('User');

    if (configService.get('NODE_ENV') != 'development') {
      return {
        adminJsOptions: {
          rootPath: ADMINJS_ROUTE,
          loginPath: `${ADMINJS_ROUTE}/login`,
          logoutPath: `${ADMINJS_ROUTE}/logout`,
          branding: {
            companyName: 'NestApp',
          },
          resources: adminResources.build(),
        },
        auth: {
          authenticate: async (email: string, password: string) => {
            if (
              email === configService.get<string>('DEFAULT_ADMIN_USERNAME') &&
              password === configService.get<string>('DEFAULT_ADMIN_PASSWORD')
            ) {
              return {
                email: configService.get<string>('DEFAULT_ADMIN_USERNAME'),
              };
            }
            return null;
          },
          cookieName: configService.get<string>('ADMINJS_COOKIE_NAME'),
          cookiePassword: configService.get<string>('ADMINJS_COOKIE_SECRET'),
        },
        sessionOptions: {
          resave: true,
          saveUninitialized: true,
          secret: configService.get<string>('ADMINJS_COOKIE_SECRET'),
        },
      };
    }

    return {
      adminJsOptions: {
        rootPath: ADMINJS_ROUTE,
        branding: {
          companyName: 'NestApp',
        },
        // resources: new AdminResourceBuilder(prisma).build(),
        resources: adminResources.build(),
        // resources: [
        //   {
        //     resource: { model: dmmf.modelMap.User, client: prisma },
        //     options: {},
        //   },
        // ],
      },
    };
  },
};
