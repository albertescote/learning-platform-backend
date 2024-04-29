import { Injectable } from '@nestjs/common';
import Meeting from '../domain/meeting';
import MeetingId from '../domain/meetingId';
import { MeetingRepository } from '../infrastructure/meetingRepository';

export interface MeetingRequest {
  id: number;
}

export interface MeetingResponse {
  id: number;
}

@Injectable()
export class MeetingService {
  constructor(private meetingRepository: MeetingRepository) {}

  create(): MeetingResponse {
    const meeting = new Meeting(MeetingId.generate());
    const storedMeeting = this.meetingRepository.addMeeting(meeting);
    return storedMeeting.toPrimitives();
  }

  getById(id: number): MeetingResponse {
    const storedMeeting = this.meetingRepository.getMeetingById(
      new MeetingId(id),
    );
    return storedMeeting.toPrimitives();
  }

  getAll(): MeetingResponse[] {
    const meetings = this.meetingRepository.getAllMeetings();
    return meetings.map((meeting) => {
      return meeting.toPrimitives();
    });
  }

  update(id: number, request: MeetingRequest): MeetingResponse {
    const updatedMeeting = this.meetingRepository.updateMeeting(
      new MeetingId(id),
      Meeting.fromPrimitives(request),
    );
    return updatedMeeting.toPrimitives();
  }

  deleteById(id: number): void {
    const deleted = this.meetingRepository.deleteMeeting(new MeetingId(id));
    if (!deleted) {
      throw new Error(`unable to delete this meeting: ${id}`);
    }
    return;
  }
}
