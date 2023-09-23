import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { SecurityModule } from '@modules/security/security.module';
import { EmailModule } from '@modules/emails/email.module';
import { UsersModule } from '@api/v1/users/users.module';

@Module({
  imports: [UsersModule, SecurityModule, EmailModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
