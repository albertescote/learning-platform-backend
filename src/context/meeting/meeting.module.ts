import { Module } from '@nestjs/common';
import { MeetingService } from './service/meeting.service';
import { MeetingRepository } from './infrastructure/meetingRepository';
import { UserRepository } from '../user/infrastructure/userRepository';
import RsaSigner from '../shared/infrastructure/rsaSigner';
import { CqrsModule } from '@nestjs/cqrs';
import { ModuleConnectors } from '../shared/infrastructure/moduleConnectors';

@Module({
  imports: [CqrsModule],
  providers: [
    MeetingService,
    MeetingRepository,
    UserRepository,
    RsaSigner,
    ModuleConnectors,
  ],
  exports: [MeetingService],
})
export class MeetingModule {}
