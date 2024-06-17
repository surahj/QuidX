import { UsersService } from './users.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createGuestDto } from './dto/create-user.dto';

@ApiTags('Guests')
@Controller('guests')
export class GuestController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  public async addGuest(@Body() createGuest: createGuestDto) {
    await this.usersService.createGuest(createGuest);
    return {
      message: 'success',
      statusCode: 200,
    };
  }
}
