import { Module } from '@nestjs/common';
import { MeetingController } from './api/meeting/meeting.controller';
import { MeetingModule } from '../context/meeting/meeting.module';
import { HealthcheckController } from './api/healthcheck/healthcheck.controller';
import { UserModule } from '../context/user/user.module';
import { UserController } from './api/user/user.controller';
import { AuthController } from './api/auth/auth.controller';
import { AuthModule } from '../context/auth/auth.module';

@Module({
  imports: [MeetingModule, UserModule, AuthModule],
  controllers: [
    HealthcheckController,
    MeetingController,
    UserController,
    AuthController,
  ],
})
export class AppModule {}
