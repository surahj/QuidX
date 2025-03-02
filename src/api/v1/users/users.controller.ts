import { UsersService } from './users.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';

@ApiTags('Users')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  async get(@Req() req, @Query() option: PageOptionsDto) {
    return this.usersService.getAllUsers(req.user.id, option);
  }

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
