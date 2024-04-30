import { Module } from '@nestjs/common';
import { MeetingService } from './service/meeting.service';
import { MeetingRepository } from './infrastructure/meetingRepository';
import { UserRepository } from '../user/infrastructure/userRepository';

@Module({
  providers: [MeetingService, MeetingRepository, UserRepository],
  exports: [MeetingService],
})
export class MeetingModule {}
