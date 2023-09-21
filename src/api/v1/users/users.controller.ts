import { UsersService } from './users.service';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
