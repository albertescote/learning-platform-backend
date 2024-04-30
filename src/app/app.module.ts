import { Module } from '@nestjs/common';
import { SignatureController } from './api/signature/signature.controller';
import { SignatureModule } from '../context/signature/signature.module';
import { MeetingController } from './api/meeting/meeting.controller';
import { MeetingModule } from '../context/meeting/meeting.module';
import { HealthcheckController } from './api/healthcheck/healthcheck.controller';
import { UserModule } from '../context/user/user.module';

@Module({
  imports: [SignatureModule, MeetingModule, UserModule],
  controllers: [HealthcheckController, SignatureController, MeetingController],
})
export class AppModule {}
