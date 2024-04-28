import { Module } from '@nestjs/common';
import { MeetingService } from './service/meeting.service';
import { MeetingRepository } from './infrastructure/meetingRepository';

@Module({
  providers: [MeetingService, MeetingRepository],
  exports: [MeetingService],
})
export class MeetingModule {}
