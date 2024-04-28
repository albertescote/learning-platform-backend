import MeetingId from './meetingId';

export interface MeetingPrimitives {
  id: number;
}

export default class Meeting {
  constructor(private id: MeetingId) {}

  static fromPrimitives(meeting: MeetingPrimitives): Meeting {
    return new Meeting(new MeetingId(meeting.id));
  }

  toPrimitives(): MeetingPrimitives {
    return {
      id: this.id.toPrimitive(),
    };
  }
}
