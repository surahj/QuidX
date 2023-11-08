import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  public use(req: any, res: any, next: () => void) {
    if (req.session['user'] != null) next();
    else throw new UnauthorizedException();
  }
}
