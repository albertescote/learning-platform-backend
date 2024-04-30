import { Injectable } from '@nestjs/common';
import Meeting from '../domain/meeting';
import MeetingId from '../domain/meetingId';
import { MeetingRepository } from '../infrastructure/meetingRepository';

export interface MeetingRequest {
  topic: string;
}

export interface MeetingResponse {
  id: string;
  topic: string;
}

@Injectable()
export class MeetingService {
  constructor(private meetingRepository: MeetingRepository) {}

  create(request: MeetingRequest): MeetingResponse {
    const meeting = new Meeting(MeetingId.generate(), request.topic);
    const storedMeeting = this.meetingRepository.addMeeting(meeting);
    return storedMeeting.toPrimitives();
  }

  getById(id: string): MeetingResponse {
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

  update(id: string, request: MeetingRequest): MeetingResponse {
    const updatedMeeting = this.meetingRepository.updateMeeting(
      new MeetingId(id),
      Meeting.fromPrimitives({ ...request, id }),
    );
    return updatedMeeting.toPrimitives();
  }

  deleteById(id: string): void {
    const deleted = this.meetingRepository.deleteMeeting(new MeetingId(id));
    if (!deleted) {
      throw new Error(`unable to delete this meeting: ${id}`);
    }
    return;
  }
}
