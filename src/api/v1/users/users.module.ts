import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '@database/database.module';
import { UsersRepository } from './users.repository';
import { GuestController } from './guest.controller';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  controllers: [UsersController, GuestController],
  providers: [UsersService, UsersRepository, CronService],
  exports: [UsersService, CronService],
})
export class UsersModule {}
