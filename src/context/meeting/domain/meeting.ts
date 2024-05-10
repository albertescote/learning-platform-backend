import MeetingId from './meetingId';
import { Role } from '../../shared/domain/role';
import UserId from '../../shared/domain/userId';

export interface MeetingPrimitives {
  id: string;
  topic: string;
  role: string;
  ownerId: string;
  studentId: string;
}

export default class Meeting {
  constructor(
    private id: MeetingId,
    private topic: string,
    private role: Role,
    private ownerId: UserId,
    private studentId: UserId,
  ) {}

  static fromPrimitives(meeting: MeetingPrimitives): Meeting {
    return new Meeting(
      new MeetingId(meeting.id),
      meeting.topic,
      Role[meeting.role],
      new UserId(meeting.ownerId),
      new UserId(meeting.studentId),
    );
  }

  toPrimitives(): MeetingPrimitives {
    return {
      id: this.id.toPrimitive(),
      topic: this.topic,
      role: this.role.toString(),
      ownerId: this.ownerId.toPrimitive(),
      studentId: this.studentId.toPrimitive(),
    };
  }
}
