import MeetingId from './meetingId';

export interface MeetingPrimitives {
  id: string;
  topic: string;
}

export default class Meeting {
  constructor(
    private id: MeetingId,
    private topic: string,
  ) {}

  static fromPrimitives(meeting: MeetingPrimitives): Meeting {
    return new Meeting(new MeetingId(meeting.id), meeting.topic);
  }

  toPrimitives(): MeetingPrimitives {
    return {
      id: this.id.toPrimitive(),
      topic: this.topic,
    };
  }
}
