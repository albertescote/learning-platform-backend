import { Injectable } from '@nestjs/common';
import Meeting, { MeetingPrimitives } from '../domain/meeting';
import MeetingId from '../domain/meetingId';

@Injectable()
export class MeetingRepository {
  private meetings: MeetingPrimitives[] = [];

  addMeeting(meeting: Meeting): Meeting {
    this.meetings.push(meeting.toPrimitives());
    return meeting;
  }

  getMeetingById(id: MeetingId): Meeting {
    const meeting = this.meetings.find(
      (meeting) => meeting.id === id.toPrimitive(),
    );
    return meeting ? Meeting.fromPrimitives(meeting) : null;
  }

  getAllMeetings(): Meeting[] {
    return this.meetings.map((meeting) => {
      return Meeting.fromPrimitives(meeting);
    });
  }

  updateMeeting(id: MeetingId, updatedMeeting: Meeting): Meeting {
    const index = this.meetings.findIndex(
      (meeting) => meeting.id === id.toPrimitive(),
    );
    if (index !== -1) {
      this.meetings[index] = {
        ...this.meetings[index],
        ...updatedMeeting.toPrimitives(),
      };
      return Meeting.fromPrimitives(this.meetings[index]);
    }
    return null;
  }

  deleteMeeting(id: MeetingId): boolean {
    const index = this.meetings.findIndex(
      (meeting) => meeting.id === id.toPrimitive(),
    );
    if (index !== -1) {
      this.meetings.splice(index, 1);
      return true;
    }
    return false;
  }
}
