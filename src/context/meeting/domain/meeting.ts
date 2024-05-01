import MeetingId from './meetingId';
import { Role } from '../../shared/domain/role';

export interface MeetingPrimitives {
  id: string;
  topic: string;
  role: string;
  ownerId: string;
}

export default class Meeting {
  constructor(
    private id: MeetingId,
    private topic: string,
    private role: Role,
    private ownerId: string,
  ) {}

  static fromPrimitives(meeting: MeetingPrimitives): Meeting {
    return new Meeting(
      new MeetingId(meeting.id),
      meeting.topic,
      Role[meeting.role],
      meeting.ownerId,
    );
  }

  toPrimitives(): MeetingPrimitives {
    return {
      id: this.id.toPrimitive(),
      topic: this.topic,
      role: this.role.toString(),
      ownerId: this.ownerId,
    };
  }
}
