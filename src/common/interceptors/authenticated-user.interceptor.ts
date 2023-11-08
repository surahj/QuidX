import { Role } from '@common/enums';
import { SerializedSessionUser } from '@common/interfaces';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '@api/v1/users/users.repository';
import { Request } from 'express';
import { Observable } from 'rxjs';

/** Use this interceptor to append the authenticate user to the `request` object for `CurrentUser` decorator
 * to be able to add the user data as meta data on the into the argument of the controller method `CurrentUser` is used on
 * */
@Injectable()
export class AuthenticatedUserInterceptor implements NestInterceptor {
  constructor(private readonly userRepository: UsersRepository) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.session['user']?.role !== Role.USER) {
      throw new UnauthorizedException();
    }

    const sessionUser = request.session['user'] as SerializedSessionUser;
    const userId = sessionUser['id'] as string;

    if (sessionUser.role === Role.USER) {
      const user = await this.userRepository.findById(userId);
      console.log('user with password', user);
      user.password = undefined;
      console.log('user without pass', user);

      request['user'] = { role: Role.USER, ...user };
    }

    return next.handle();
  }
}
