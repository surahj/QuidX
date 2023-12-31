import requestParser from '@common/utils/request-logger.parser';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ResponseLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseLoggerInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest() as Request;

    const requestInfo = await requestParser(request);

    return next.handle().pipe(
      tap({
        next: async (data) => {
          if (data && data.password) {
            const dataWithoutPassword = { ...data };
            delete dataWithoutPassword.password;

            this.logger.log(
              JSON.stringify(
                { requestInfo, responseData: dataWithoutPassword },
                null,
                4,
              ),
            );
          } else {
            this.logger.log(
              JSON.stringify({ requestInfo, responseData: data }, null, 4),
            );
          }
        },
        error: async (err) => {
          return err;
        },
      }),
    );
  }
}
