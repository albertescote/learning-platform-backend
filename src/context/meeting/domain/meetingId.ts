import { v4 as uuidv4, validate } from 'uuid';

export default class MeetingId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new Error('invalid meetingId format');
    }
  }

  static generate(): MeetingId {
    return new MeetingId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
