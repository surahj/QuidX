import { UsersService } from './users.service';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/profile')
  public async updateProfile(
    @Req() req,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    return this.usersService.updateUserProfile(
      req.user.profile.id,
      updateProfileDto,
    );
  }

  @Get('/profile')
  public async getProfile(@Req() req) {
    return this.usersService.getUserProfile(req.user.profile.id);
  }
}
