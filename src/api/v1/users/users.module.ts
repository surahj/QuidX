import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@database/database.module';
import { UsersRepository } from './users.repository';
import { GuestController } from './guest.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, GuestController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
